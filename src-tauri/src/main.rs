// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use configparser::ini::Ini;

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

    fs::read_to_string(&resolved_path).map_err(|e| e.to_string())
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
            load_settings,
            save_settings,
            get_lua_library_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
