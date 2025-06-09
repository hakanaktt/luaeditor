// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use configparser::ini::Ini;
use encoding_rs::{UTF_8, WINDOWS_1252, WINDOWS_1254, ISO_8859_2};

mod lua_engine;
use lua_engine::{NativeLuaEngine, LuaExecutionResult};

#[derive(Debug, Serialize, Deserialize)]
struct AppSettings {
    model_library_path: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            model_library_path: Some("./LIBRARY/modelLibrary".to_string()),
        }
    }
}

fn get_project_root() -> Result<PathBuf, String> {
    // Try to find the project root by looking for the LIBRARY directory
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;

    // Check if we're in the src-tauri directory
    if current_dir.file_name().and_then(|n| n.to_str()) == Some("src-tauri") {
        // Go up one level to the project root
        current_dir.parent()
            .ok_or("Could not find project root".to_string())
            .map(|p| p.to_path_buf())
    } else {
        // We're already in the project root
        Ok(current_dir)
    }
}

fn get_settings_file_path() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or("Could not find config directory")?;

    let app_config_dir = config_dir.join("LuaMacroEditor");

    // Create directory if it doesn't exist
    if !app_config_dir.exists() {
        fs::create_dir_all(&app_config_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    Ok(app_config_dir.join("settings.ini"))
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    // First try to read as UTF-8
    match fs::read_to_string(&resolved_path) {
        Ok(content) => Ok(content),
        Err(_) => {
            // If UTF-8 fails, read as bytes and try to detect encoding
            let bytes = fs::read(&resolved_path)
                .map_err(|e| format!("Failed to read file as bytes: {}", e))?;

            // Try different encodings commonly used for Turkish text
            let encodings_to_try = [
                UTF_8,           // UTF-8 (already tried above, but let's be thorough)
                WINDOWS_1254,    // Windows-1254 (Turkish)
                WINDOWS_1252,    // Windows-1252 (Western European)
                ISO_8859_2,      // ISO-8859-2 (Central European, closest available)
            ];

            for encoding in &encodings_to_try {
                let (decoded, _, had_errors) = encoding.decode(&bytes);
                if !had_errors {
                    return Ok(decoded.into_owned());
                }
            }

            // If all encodings fail, try with replacement characters
            let (decoded, _, _) = UTF_8.decode(&bytes);
            Ok(decoded.into_owned())
        }
    }
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    fs::write(&resolved_path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<String>, String> {
    // Resolve the path to handle relative paths properly
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    let entries = fs::read_dir(&resolved_path)
        .map_err(|e| format!("Failed to read directory '{}': {}", resolved_path.display(), e))?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                e.file_name().to_str().map(|s| s.to_string())
            })
        })
        .collect();
    Ok(entries)
}

#[tauri::command]
fn file_exists(path: String) -> bool {
    let resolved_path = if path.starts_with("./") {
        if let Ok(project_root) = get_project_root() {
            project_root.join(&path[2..])
        } else {
            PathBuf::from(&path)
        }
    } else {
        PathBuf::from(&path)
    };

    resolved_path.exists()
}

#[tauri::command]
fn is_directory(path: String) -> bool {
    // Resolve the path to handle relative paths properly
    let resolved_path = if path.starts_with("./") {
        if let Ok(project_root) = get_project_root() {
            project_root.join(&path[2..])
        } else {
            PathBuf::from(&path)
        }
    } else {
        PathBuf::from(&path)
    };

    resolved_path.is_dir()
}

#[tauri::command]
fn create_file(path: String, content: Option<String>) -> Result<(), String> {
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    // Create parent directories if they don't exist
    if let Some(parent) = resolved_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directories: {}", e))?;
    }

    let file_content = content.unwrap_or_else(|| String::new());
    fs::write(&resolved_path, file_content)
        .map_err(|e| format!("Failed to create file: {}", e))
}

#[tauri::command]
fn create_directory(path: String) -> Result<(), String> {
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    fs::create_dir_all(&resolved_path)
        .map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
fn delete_file_or_directory(path: String) -> Result<(), String> {
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    if !resolved_path.exists() {
        return Err("File or directory does not exist".to_string());
    }

    if resolved_path.is_dir() {
        fs::remove_dir_all(&resolved_path)
            .map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(&resolved_path)
            .map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[tauri::command]
fn rename_file_or_directory(old_path: String, new_path: String) -> Result<(), String> {
    let resolved_old_path = if old_path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&old_path[2..])
    } else {
        PathBuf::from(&old_path)
    };

    let resolved_new_path = if new_path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&new_path[2..])
    } else {
        PathBuf::from(&new_path)
    };

    if !resolved_old_path.exists() {
        return Err("Source file or directory does not exist".to_string());
    }

    if resolved_new_path.exists() {
        return Err("Target file or directory already exists".to_string());
    }

    fs::rename(&resolved_old_path, &resolved_new_path)
        .map_err(|e| format!("Failed to rename: {}", e))
}

#[tauri::command]
fn copy_file_or_directory(source_path: String, target_path: String) -> Result<(), String> {
    let resolved_source = if source_path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&source_path[2..])
    } else {
        PathBuf::from(&source_path)
    };

    let resolved_target = if target_path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&target_path[2..])
    } else {
        PathBuf::from(&target_path)
    };

    if !resolved_source.exists() {
        return Err("Source file or directory does not exist".to_string());
    }

    if resolved_source.is_dir() {
        copy_dir_recursive(&resolved_source, &resolved_target)
    } else {
        if let Some(parent) = resolved_target.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create target directory: {}", e))?;
        }
        fs::copy(&resolved_source, &resolved_target)
            .map_err(|e| format!("Failed to copy file: {}", e))?;
        Ok(())
    }
}

fn copy_dir_recursive(source: &Path, target: &Path) -> Result<(), String> {
    fs::create_dir_all(target)
        .map_err(|e| format!("Failed to create target directory: {}", e))?;

    for entry in fs::read_dir(source)
        .map_err(|e| format!("Failed to read source directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let source_path = entry.path();
        let target_path = target.join(entry.file_name());

        if source_path.is_dir() {
            copy_dir_recursive(&source_path, &target_path)?;
        } else {
            fs::copy(&source_path, &target_path)
                .map_err(|e| format!("Failed to copy file: {}", e))?;
        }
    }

    Ok(())
}

#[derive(serde::Serialize)]
struct FileItemData {
    name: String,
    path: String,
    is_directory: bool,
    depth: u32,
    parent_path: Option<String>,
}

#[tauri::command]
fn get_directory_tree(path: String, max_depth: Option<u32>) -> Result<Vec<FileItemData>, String> {
    let resolved_path = if path.starts_with("./") {
        let project_root = get_project_root()?;
        project_root.join(&path[2..])
    } else {
        PathBuf::from(&path)
    };

    let max_depth = max_depth.unwrap_or(1); // Default to 1 level deep
    let mut items = Vec::new();

    collect_directory_items(&resolved_path, &path, 0, max_depth, &mut items)?;

    // Sort: directories first, then files, both alphabetically within each depth level
    items.sort_by(|a, b| {
        // First sort by depth
        let depth_cmp = a.depth.cmp(&b.depth);
        if depth_cmp != std::cmp::Ordering::Equal {
            return depth_cmp;
        }

        // Then by directory vs file
        if a.is_directory && !b.is_directory {
            std::cmp::Ordering::Less
        } else if !a.is_directory && b.is_directory {
            std::cmp::Ordering::Greater
        } else {
            // Finally by name
            a.name.cmp(&b.name)
        }
    });

    Ok(items)
}

fn collect_directory_items(
    dir_path: &Path,
    logical_path: &str,
    current_depth: u32,
    max_depth: u32,
    items: &mut Vec<FileItemData>,
) -> Result<(), String> {
    if current_depth > max_depth {
        return Ok(());
    }

    let entries = fs::read_dir(dir_path)
        .map_err(|e| format!("Failed to read directory '{}': {}", dir_path.display(), e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let file_name = entry.file_name();
        let file_name_str = file_name.to_str().unwrap_or("").to_string();

        if file_name_str.is_empty() {
            continue;
        }

        let entry_path = entry.path();
        let logical_entry_path = format!("{}/{}", logical_path, file_name_str).replace("//", "/");
        let is_dir = entry_path.is_dir();

        let parent_path = if current_depth == 0 {
            None
        } else {
            Some(logical_path.to_string())
        };

        items.push(FileItemData {
            name: file_name_str,
            path: logical_entry_path.clone(),
            is_directory: is_dir,
            depth: current_depth,
            parent_path,
        });

        // Recursively collect subdirectory items if we haven't reached max depth
        if is_dir && current_depth < max_depth {
            collect_directory_items(&entry_path, &logical_entry_path, current_depth + 1, max_depth, items)?;
        }
    }

    Ok(())
}

#[tauri::command]
fn load_settings() -> Result<AppSettings, String> {
    let settings_path = get_settings_file_path()?;

    if !settings_path.exists() {
        // Return default settings if file doesn't exist
        return Ok(AppSettings::default());
    }

    let mut ini = Ini::new();
    ini.load(&settings_path)
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    let settings = AppSettings {
        model_library_path: ini.get("Paths", "model_library_path"),
    };

    Ok(settings)
}

#[tauri::command]
fn save_settings(settings: AppSettings) -> Result<(), String> {
    let settings_path = get_settings_file_path()?;

    let mut ini = Ini::new();

    ini.setstr("Paths", "model_library_path", settings.model_library_path.as_deref());

    ini.write(&settings_path)
        .map_err(|e| format!("Failed to save settings: {}", e))?;

    Ok(())
}

#[tauri::command]
fn get_lua_library_path(model_library_path: String) -> Result<String, String> {
    let model_path = Path::new(&model_library_path);

    // Get the parent directory of modelLibrary
    let parent = model_path.parent()
        .ok_or("Could not find parent directory of model library")?;

    // Construct the lua library path (sibling to modelLibrary)
    let lua_path = parent.join("luaLibrary");

    // Convert to string
    Ok(lua_path.to_str()
        .ok_or("Invalid path encoding")?
        .to_string())
}





#[tauri::command]
async fn execute_lua_script(
    script_content: String,
    lua_library_path: String,
    debug_mode: bool,
) -> Result<LuaExecutionResult, String> {
    // Create a new native Lua engine instance with library path
    let engine = NativeLuaEngine::new_with_library_path(Some(lua_library_path.clone()))
        .map_err(|e| format!("Failed to create Lua engine: {}", e))?;

    // Prepare the script content with library includes if needed
    let mut full_script = String::new();

    // AdekoLib.lua is now bundled with the app and loaded automatically by the Lua engine
    println!("=== USING BUNDLED ADEKO LIB ===");
    println!("AdekoLib.lua is bundled with the app and loaded automatically");
    println!("No need to load from external files");

    // Skip loading external turtle.lua - we use built-in turtle functions
    println!("=== USING BUILT-IN TURTLE FUNCTIONS ===");
    println!("Skipping external turtle.lua (uses wxWidgets which is not available)");
    println!("Using built-in turtle graphics implementation instead");

    // Open turtle graphics window using built-in function
    full_script.push_str("-- Using built-in turtle graphics\n");
    full_script.push_str("-- open('Lua Debug - Turtle Graphics')\n");

    if debug_mode {
        // In debug mode, we emulate ZeroBrane's behavior:
        // 1. First load the user script to define modelMain()
        // 2. Then execute ADekoDebugMode.lua which sets up 6-face layout and calls modelMain()
        println!("🔧 Debug mode: Emulating ZeroBrane-style debugging");

        // Add the user script which defines modelMain()
        full_script.push_str("\n-- ===== USER SCRIPT (defines modelMain function) =====\n");
        full_script.push_str(&script_content);
        full_script.push_str("\n\n");

        // Load ADekoDebugMode.lua from file (will be packaged with the app)
        println!("📋 Debug mode: Loading ADekoDebugMode.lua for 6-face layout");
        let debug_mode_path = Path::new(&lua_library_path).join("ADekoDebugMode.lua");
        println!("📁 Attempting to load ADekoDebugMode.lua from: {}", debug_mode_path.display());

        if debug_mode_path.exists() {
            match fs::read_to_string(&debug_mode_path) {
                Ok(debug_content) => {
                    println!("✅ Successfully loaded ADekoDebugMode.lua ({} bytes)", debug_content.len());
                    full_script.push_str("-- ===== ADEKOLIB DEBUG MODE (ZeroBrane-style 6-face layout) =====\n");
                    full_script.push_str("print('🎯 Starting ZeroBrane-style debug mode with 6-face layout')\n");
                    full_script.push_str(&debug_content);
                    full_script.push_str("\nprint('✅ Debug mode execution completed')\n");
                }
                Err(e) => {
                    println!("❌ Failed to read ADekoDebugMode.lua: {}", e);
                    // Enhanced fallback with better ZeroBrane emulation
                    full_script.push_str("-- ===== FALLBACK DEBUG ENVIRONMENT =====\n");
                    full_script.push_str("print('⚠️  Using fallback debug environment (ADekoDebugMode.lua not found)')\n");
                    full_script.push_str("X = 500\nY = 700\nmaterialThickness = 18\noffset = 20\n");
                    full_script.push_str("edge1layer=\"LMM0\"\nedge2layer=\"LMM1\"\nedge3layer=\"LMM2\"\nedge4layer=\"LMM3\"\n");
                    full_script.push_str("edge1thickness=0.1\nedge2thickness=0.2\nedge3thickness=0.3\nedge4thickness=0.4\n");
                    full_script.push_str("doesSizeIncludeEdgeThickness=\"false\"\nmodelParameters=\"\"\n");
                    full_script.push_str("print('🔧 Setting up basic debug environment')\n");
                    full_script.push_str("if ADekoLib then ADekoLib.start() end\n");
                    full_script.push_str("if modelMain then\n");
                    full_script.push_str("  print('📞 Calling modelMain() function')\n");
                    full_script.push_str("  modelMain()\n");
                    full_script.push_str("  print('✅ modelMain() execution completed')\n");
                    full_script.push_str("else\n");
                    full_script.push_str("  print('❌ modelMain function not found in script')\n");
                    full_script.push_str("end\n");
                    full_script.push_str("if ADekoLib then ADekoLib.finish() end\n");
                }
            }
        } else {
            println!("❌ ADekoDebugMode.lua not found at: {}", debug_mode_path.display());
            // Enhanced fallback with better ZeroBrane emulation
            full_script.push_str("-- ===== SIMPLIFIED DEBUG ENVIRONMENT =====\n");
            full_script.push_str("print('⚠️  ADekoDebugMode.lua not found, using simplified debug environment')\n");
            full_script.push_str("X = 500\nY = 700\nmaterialThickness = 18\noffset = 20\n");
            full_script.push_str("edge1layer=\"LMM0\"\nedge2layer=\"LMM1\"\nedge3layer=\"LMM2\"\nedge4layer=\"LMM3\"\n");
            full_script.push_str("edge1thickness=0.1\nedge2thickness=0.2\nedge3thickness=0.3\nedge4thickness=0.4\n");
            full_script.push_str("doesSizeIncludeEdgeThickness=\"false\"\nmodelParameters=\"\"\n");
            full_script.push_str("print('🔧 Setting up basic debug environment')\n");
            full_script.push_str("if ADekoLib then ADekoLib.start() end\n");
            full_script.push_str("if modelMain then\n");
            full_script.push_str("  print('📞 Calling modelMain() function')\n");
            full_script.push_str("  modelMain()\n");
            full_script.push_str("  print('✅ modelMain() execution completed')\n");
            full_script.push_str("else\n");
            full_script.push_str("  print('❌ modelMain function not found in script')\n");
            full_script.push_str("end\n");
            full_script.push_str("if ADekoLib then ADekoLib.finish() end\n");
        }

        println!("Debug mode: Final script length: {}", full_script.len());

        // Debug: Show the last few lines of the script to check for syntax issues
        let lines: Vec<&str> = full_script.lines().collect();
        let total_lines = lines.len();
        println!("Debug mode: Total lines in final script: {}", total_lines);
        if total_lines > 10 {
            println!("Debug mode: Last 10 lines of script:");
            for (i, line) in lines.iter().enumerate().skip(total_lines - 10) {
                println!("  {}: {}", i + 1, line);
            }
        }
    } else {
        // Normal mode: just add the user script
        full_script.push_str("\n-- User Script:\n");
        full_script.push_str(&script_content);
    }

    // Debug: Print the final script that will be executed
    println!("=== FINAL SCRIPT TO EXECUTE ===");
    println!("{}", full_script);
    println!("=== END OF SCRIPT ===");

    // Execute the script using the native Lua engine
    Ok(engine.execute_script(&full_script))
}

#[tauri::command]
fn check_lua_availability() -> Result<bool, String> {
    // With embedded Lua via mlua, Lua is always available
    Ok(true)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_directory,
            file_exists,
            is_directory,
            create_file,
            create_directory,
            delete_file_or_directory,
            rename_file_or_directory,
            copy_file_or_directory,
            get_directory_tree,
            load_settings,
            save_settings,
            get_lua_library_path,
            execute_lua_script,
            check_lua_availability
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
