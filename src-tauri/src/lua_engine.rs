use mlua::{Lua, Result as LuaResult, Table, Value};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrawCommand {
    pub command_type: String,
    pub x1: f64,
    pub y1: f64,
    pub x2: f64,
    pub y2: f64,
    pub radius: f64,
    pub color: String,
    pub size: f64,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LuaExecutionResult {
    pub success: bool,
    pub output: String,
    pub error: String,
    pub execution_time_ms: u64,
    pub draw_commands: Vec<DrawCommand>,
}

#[derive(Debug, Clone)]
pub struct TurtleState {
    pub x: f64,
    pub y: f64,
    pub angle: f64,
    pub pen_down: bool,
    pub pen_color: String,
    pub pen_size: f64,
}

impl Default for TurtleState {
    fn default() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            angle: 0.0,
            pen_down: true,
            pen_color: "black".to_string(),
            pen_size: 1.0,
        }
    }
}

#[derive(Debug, Clone)]
pub struct AdekoState {
    pub current_face: String,
    pub current_layer: String,
    pub current_thickness: f64,
    #[allow(dead_code)]
    pub show_points_enabled: bool,
    #[allow(dead_code)]
    pub listing_enabled: bool,
    pub part_width: f64,
    pub part_height: f64,
}

impl Default for AdekoState {
    fn default() -> Self {
        Self {
            current_face: "top".to_string(),
            current_layer: "default".to_string(),
            current_thickness: 0.0,
            show_points_enabled: false,
            listing_enabled: false,
            part_width: 0.0,
            part_height: 0.0,
        }
    }
}

pub struct NativeLuaEngine {
    lua: Lua,
    output_buffer: Arc<Mutex<Vec<String>>>,
    turtle_state: Arc<Mutex<TurtleState>>,
    adeko_state: Arc<Mutex<AdekoState>>,
    draw_commands: Arc<Mutex<Vec<DrawCommand>>>,
    lua_library_path: Option<String>,
}

impl NativeLuaEngine {
    #[allow(dead_code)]
    pub fn new() -> LuaResult<Self> {
        Self::new_with_library_path(None)
    }

    pub fn new_with_library_path(lua_library_path: Option<String>) -> LuaResult<Self> {
        let lua = Lua::new();
        let output_buffer = Arc::new(Mutex::new(Vec::new()));
        let turtle_state = Arc::new(Mutex::new(TurtleState::default()));
        let adeko_state = Arc::new(Mutex::new(AdekoState::default()));
        let draw_commands = Arc::new(Mutex::new(Vec::new()));

        let engine = Self {
            lua,
            output_buffer,
            turtle_state,
            adeko_state,
            draw_commands,
            lua_library_path,
        };

        engine.setup_lua_environment()?;
        Ok(engine)
    }

    fn setup_lua_environment(&self) -> LuaResult<()> {
        let globals = self.lua.globals();

        // Setup package path for module loading
        self.setup_package_path(&globals)?;

        // Setup custom require function for modules
        self.setup_custom_require(&globals)?;

        // Setup custom print function
        let output_buffer = Arc::clone(&self.output_buffer);
        let print_fn = self.lua.create_function(move |_, args: mlua::Variadic<Value>| {
            let mut output = output_buffer.lock().unwrap();
            let line = args
                .iter()
                .map(|v| match v {
                    Value::String(s) => s.to_str().unwrap_or("").to_string(),
                    Value::Number(n) => n.to_string(),
                    Value::Integer(i) => i.to_string(),
                    Value::Boolean(b) => b.to_string(),
                    Value::Nil => "nil".to_string(),
                    _ => format!("{:?}", v),
                })
                .collect::<Vec<_>>()
                .join("\t");
            output.push(line);
            Ok(())
        })?;
        globals.set("print", print_fn)?;

        // Setup turtle graphics functions
        self.setup_turtle_functions(&globals)?;

        // Setup AdekoLib functions
        self.setup_adeko_functions(&globals)?;

        // Setup debug mode variables
        self.setup_debug_variables(&globals)?;

        Ok(())
    }

    fn setup_package_path(&self, globals: &Table) -> LuaResult<()> {
        // Get the package table
        let package: Table = globals.get("package")?;

        // Get current path
        let current_path: String = package.get("path").unwrap_or_else(|_| "?.lua;?/init.lua".to_string());

        // Add lua library path if available
        let new_path = if let Some(ref lib_path) = self.lua_library_path {
            format!("{};{}/?.lua;{}/?/init.lua", current_path, lib_path, lib_path)
        } else {
            current_path
        };

        package.set("path", new_path)?;
        Ok(())
    }

    fn setup_custom_require(&self, globals: &Table) -> LuaResult<()> {
        use std::fs;
        use std::path::Path;

        let lua_library_path = self.lua_library_path.clone();

        let custom_require = self.lua.create_function(move |lua, module_name: String| {
            let package: Table = lua.globals().get("package")?;
            let loaded: Table = package.get("loaded")?;

            // Check if module is already loaded
            if let Ok(module) = loaded.get::<_, Value>(module_name.clone()) {
                if !matches!(module, Value::Nil) {
                    return Ok(module);
                }
            }

            // Special handling for built-in modules
            match module_name.as_str() {
                "ADekoLib" => {
                    // ADekoLib is built-in, return the global ADekoLib table
                    let adeko_lib = lua.globals().get::<_, Value>("ADekoLib")?;
                    loaded.set(module_name.clone(), adeko_lib.clone())?;
                    return Ok(adeko_lib);
                }
                "turtle" => {
                    // Turtle functions are built-in, return true to indicate success
                    let result = Value::Boolean(true);
                    loaded.set(module_name.clone(), result.clone())?;
                    return Ok(result);
                }
                "ADekoDebugMode" => {
                    // Special handling for ADekoDebugMode - it's not a typical module
                    // Instead of loading the file, we just return true since the debug variables
                    // are already set up in setup_debug_variables()
                    let result = Value::Boolean(true);
                    loaded.set(module_name.clone(), result.clone())?;
                    return Ok(result);
                }
                _ => {}
            }

            // Handle external library modules (excluding ADekoDebugMode which is handled above)
            if let Some(ref lib_path) = lua_library_path {
                let module_file = Path::new(lib_path).join(format!("{}.lua", module_name));

                if module_file.exists() {
                    if let Ok(content) = fs::read_to_string(&module_file) {
                        // For other modules, execute and return the result
                        let result = lua.load(&content).call::<_, Value>(())?;
                        loaded.set(module_name.clone(), result.clone())?;
                        return Ok(result);
                    }
                }
            }

            // If we can't find the module, return an error
            Err(mlua::Error::RuntimeError(format!("module '{}' not found", module_name)))
        })?;

        globals.set("require", custom_require)?;
        Ok(())
    }

    fn setup_turtle_functions(&self, globals: &Table) -> LuaResult<()> {
        let turtle_state = Arc::clone(&self.turtle_state);
        let output_buffer = Arc::clone(&self.output_buffer);
        let draw_commands = Arc::clone(&self.draw_commands);

        // move function
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let draw_commands_clone = Arc::clone(&draw_commands);
        let move_fn = self.lua.create_function(move |_, distance: f64| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            let mut commands = draw_commands_clone.lock().unwrap();

            let new_x = state.x + distance * state.angle.to_radians().cos();
            let new_y = state.y + distance * state.angle.to_radians().sin();

            if state.pen_down {
                output.push(format!("Drawing line from ({:.2}, {:.2}) to ({:.2}, {:.2})",
                    state.x, state.y, new_x, new_y));

                // Add draw command for line
                commands.push(DrawCommand {
                    command_type: "line".to_string(),
                    x1: state.x,
                    y1: state.y,
                    x2: new_x,
                    y2: new_y,
                    radius: 0.0,
                    color: state.pen_color.clone(),
                    size: state.pen_size,
                    text: String::new(),
                });
            } else {
                output.push(format!("Moving from ({:.2}, {:.2}) to ({:.2}, {:.2})",
                    state.x, state.y, new_x, new_y));
            }

            state.x = new_x;
            state.y = new_y;
            Ok(())
        })?;
        globals.set("move", move_fn)?;

        // turn function
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let turn_fn = self.lua.create_function(move |_, degrees: f64| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.angle += degrees;
            output.push(format!("Turned {:.2} degrees, now facing {:.2} degrees", degrees, state.angle));
            Ok(())
        })?;
        globals.set("turn", turn_fn)?;

        // pndn function (pen down)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let pndn_fn = self.lua.create_function(move |_, ()| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.pen_down = true;
            output.push("Pen down".to_string());
            Ok(())
        })?;
        globals.set("pndn", pndn_fn)?;

        // pnup function (pen up)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let pnup_fn = self.lua.create_function(move |_, ()| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.pen_down = false;
            output.push("Pen up".to_string());
            Ok(())
        })?;
        globals.set("pnup", pnup_fn)?;

        // posn function (set position)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let posn_fn = self.lua.create_function(move |_, (x, y): (f64, f64)| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.x = x;
            state.y = y;
            output.push(format!("Position set to ({:.2}, {:.2})", x, y));
            Ok(())
        })?;
        globals.set("posn", posn_fn)?;

        // zero function (reset position)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let zero_fn = self.lua.create_function(move |_, args: mlua::Variadic<f64>| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            let x = args.get(0).copied().unwrap_or(0.0);
            let y = args.get(1).copied().unwrap_or(0.0);
            
            state.x = x;
            state.y = y;
            output.push(format!("Zero position set to ({:.2}, {:.2})", x, y));
            Ok(())
        })?;
        globals.set("zero", zero_fn)?;

        // pncl function (pen color)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let pncl_fn = self.lua.create_function(move |_, color: String| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();

            state.pen_color = color.clone();
            output.push(format!("Pen color set to: {}", color));
            Ok(())
        })?;
        globals.set("pncl", pncl_fn)?;

        // pnsz function (pen size)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let pnsz_fn = self.lua.create_function(move |_, size: f64| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();

            state.pen_size = size;
            output.push(format!("Pen size set to: {}", size));
            Ok(())
        })?;
        globals.set("pnsz", pnsz_fn)?;

        // wipe function (clear screen)
        let turtle_state_clone = Arc::clone(&turtle_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let wipe_fn = self.lua.create_function(move |_, ()| {
            let mut state = turtle_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();

            *state = TurtleState::default();
            output.push("Screen cleared".to_string());
            Ok(())
        })?;
        globals.set("wipe", wipe_fn)?;

        // text function - matches turtle.lua signature: text(text, angle, dx, dy)
        let output_buffer_clone = Arc::clone(&output_buffer);
        let draw_commands_clone = Arc::clone(&draw_commands);
        let turtle_state_clone = Arc::clone(&turtle_state);
        let text_fn = self.lua.create_function(move |_, args: mlua::Variadic<Value>| {
            let mut output = output_buffer_clone.lock().unwrap();
            let mut commands = draw_commands_clone.lock().unwrap();
            let state = turtle_state_clone.lock().unwrap();

            // Parse arguments: text(text, angle, dx, dy)
            let text_content = args.get(0).map(|v| match v {
                Value::String(s) => s.to_str().unwrap_or("").to_string(),
                Value::Number(n) => n.to_string(),
                Value::Integer(i) => i.to_string(),
                Value::Boolean(b) => b.to_string(),
                Value::Nil => "nil".to_string(),
                _ => format!("{:?}", v),
            }).unwrap_or_default();

            let _angle = args.get(1).and_then(|v| v.as_number()).unwrap_or(0.0);
            let dx = args.get(2).and_then(|v| v.as_number()).unwrap_or(0.0);
            let dy = args.get(3).and_then(|v| v.as_number()).unwrap_or(0.0);

            // Calculate final position (turtle position + offset)
            let x = state.x + dx;
            let y = state.y + dy;

            output.push(format!("Text at ({:.2}, {:.2}): {}", x, y, text_content));

            // Add draw command for text
            commands.push(DrawCommand {
                command_type: "text".to_string(),
                x1: x,
                y1: y,
                x2: 0.0,
                y2: 0.0,
                radius: 0.0,
                color: state.pen_color.clone(),
                size: state.pen_size,
                text: text_content,
            });

            Ok(())
        })?;
        globals.set("text", text_fn)?;

        // open function (open graphics window)
        let output_buffer_clone = Arc::clone(&output_buffer);
        let open_fn = self.lua.create_function(move |_, title: Option<String>| {
            let mut output = output_buffer_clone.lock().unwrap();
            let window_title = title.unwrap_or_else(|| "Turtle Graphics".to_string());
            output.push(format!("Turtle graphics window opened: {}", window_title));
            Ok(())
        })?;
        globals.set("open", open_fn)?;

        // crcl function (circle)
        let output_buffer_clone = Arc::clone(&output_buffer);
        let draw_commands_clone = Arc::clone(&draw_commands);
        let turtle_state_clone = Arc::clone(&turtle_state);
        let crcl_fn = self.lua.create_function(move |_, (x, y, radius): (f64, f64, f64)| {
            let mut output = output_buffer_clone.lock().unwrap();
            let mut commands = draw_commands_clone.lock().unwrap();
            let state = turtle_state_clone.lock().unwrap();

            output.push(format!("Circle at ({:.2}, {:.2}) with radius {:.2}", x, y, radius));

            // Add draw command for circle
            commands.push(DrawCommand {
                command_type: "circle".to_string(),
                x1: x,
                y1: y,
                x2: 0.0,
                y2: 0.0,
                radius,
                color: state.pen_color.clone(),
                size: state.pen_size,
                text: String::new(),
            });
            Ok(())
        })?;
        globals.set("crcl", crcl_fn)?;

        // line function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let draw_commands_clone = Arc::clone(&draw_commands);
        let turtle_state_clone = Arc::clone(&turtle_state);
        let line_fn = self.lua.create_function(move |_, (x1, y1, x2, y2): (f64, f64, f64, f64)| {
            let mut output = output_buffer_clone.lock().unwrap();
            let mut commands = draw_commands_clone.lock().unwrap();
            let state = turtle_state_clone.lock().unwrap();

            output.push(format!("Line from ({:.2}, {:.2}) to ({:.2}, {:.2})", x1, y1, x2, y2));

            // Add draw command for line
            commands.push(DrawCommand {
                command_type: "line".to_string(),
                x1,
                y1,
                x2,
                y2,
                radius: 0.0,
                color: state.pen_color.clone(),
                size: state.pen_size,
                text: String::new(),
            });
            Ok(())
        })?;
        globals.set("line", line_fn)?;

        // rect function (rectangle)
        let output_buffer_clone = Arc::clone(&output_buffer);
        let draw_commands_clone = Arc::clone(&draw_commands);
        let turtle_state_clone = Arc::clone(&turtle_state);
        let rect_fn = self.lua.create_function(move |_, args: mlua::Variadic<f64>| {
            let mut output = output_buffer_clone.lock().unwrap();
            let mut commands = draw_commands_clone.lock().unwrap();
            let state = turtle_state_clone.lock().unwrap();

            let x = args.get(0).copied().unwrap_or(0.0);
            let y = args.get(1).copied().unwrap_or(0.0);
            let width = args.get(2).copied().unwrap_or(0.0);
            let height = args.get(3).copied().unwrap_or(0.0);
            let corner_radius = args.get(4).copied().unwrap_or(0.0);

            output.push(format!("Rectangle at ({:.2}, {:.2}) size {:.2}x{:.2} radius {:.2}",
                x, y, width, height, corner_radius));

            // Add draw command for rectangle
            commands.push(DrawCommand {
                command_type: "rectangle".to_string(),
                x1: x,
                y1: y,
                x2: x + width,
                y2: y + height,
                radius: corner_radius,
                color: state.pen_color.clone(),
                size: state.pen_size,
                text: String::new(),
            });
            Ok(())
        })?;
        globals.set("rect", rect_fn)?;

        // colr function (color)
        let colr_fn = self.lua.create_function(move |_, (r, g, b): (i32, i32, i32)| {
            Ok(format!("rgb({},{},{})", r, g, b))
        })?;
        globals.set("colr", colr_fn)?;

        // wait function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let wait_fn = self.lua.create_function(move |_, ()| {
            let mut output = output_buffer_clone.lock().unwrap();
            output.push("Waiting for user input...".to_string());
            Ok(())
        })?;
        globals.set("wait", wait_fn)?;

        Ok(())
    }

    fn setup_adeko_functions(&self, globals: &Table) -> LuaResult<()> {
        // Create ADekoLib table
        let adeko_lib = self.lua.create_table()?;
        
        let adeko_state = Arc::clone(&self.adeko_state);
        let output_buffer = Arc::clone(&self.output_buffer);

        // setFace function
        let adeko_state_clone = Arc::clone(&adeko_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let set_face_fn = self.lua.create_function(move |_, face: String| {
            let mut state = adeko_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.current_face = face.clone();
            output.push(format!("Set face to: {}", face));
            Ok(())
        })?;
        adeko_lib.set("setFace", set_face_fn)?;

        // setLayer function
        let adeko_state_clone = Arc::clone(&adeko_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let set_layer_fn = self.lua.create_function(move |_, layer: String| {
            let mut state = adeko_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.current_layer = layer.clone();
            output.push(format!("Set layer to: {}", layer));
            Ok(())
        })?;
        adeko_lib.set("setLayer", set_layer_fn)?;

        // makePart function
        let adeko_state_clone = Arc::clone(&adeko_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let make_part_fn = self.lua.create_function(move |_, (width, height): (f64, f64)| {
            let mut state = adeko_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();
            
            state.part_width = width;
            state.part_height = height;
            output.push(format!("Created part: {:.2} x {:.2}", width, height));
            Ok(())
        })?;
        adeko_lib.set("makePart", make_part_fn)?;

        // setThickness function
        let adeko_state_clone = Arc::clone(&adeko_state);
        let output_buffer_clone = Arc::clone(&output_buffer);
        let set_thickness_fn = self.lua.create_function(move |_, thickness: f64| {
            let mut state = adeko_state_clone.lock().unwrap();
            let mut output = output_buffer_clone.lock().unwrap();

            state.current_thickness = thickness;
            output.push(format!("Set thickness to: {}", thickness));
            Ok(())
        })?;
        adeko_lib.set("setThickness", set_thickness_fn)?;

        // point function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let point_fn = self.lua.create_function(move |_, (x, y): (f64, f64)| {
            let mut output = output_buffer_clone.lock().unwrap();
            output.push(format!("Point at ({:.2}, {:.2})", x, y));
            Ok(())
        })?;
        adeko_lib.set("point", point_fn)?;

        // pointSize function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let point_size_fn = self.lua.create_function(move |_, size: f64| {
            let mut output = output_buffer_clone.lock().unwrap();
            output.push(format!("Point size set to: {}", size));
            Ok(())
        })?;
        adeko_lib.set("pointSize", point_size_fn)?;

        // circle function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let circle_fn = self.lua.create_function(move |_, args: mlua::Variadic<Value>| {
            let mut output = output_buffer_clone.lock().unwrap();

            if args.len() >= 2 {
                // circle({x, y}, radius) format
                if let (Some(center), Some(radius)) = (args.get(0), args.get(1)) {
                    if let Some(center_table) = center.as_table() {
                        let x: f64 = center_table.get(1).unwrap_or(0.0);
                        let y: f64 = center_table.get(2).unwrap_or(0.0);
                        let r: f64 = radius.as_number().unwrap_or(0.0);
                        output.push(format!("Circle at ({:.2}, {:.2}) with radius {:.2}", x, y, r));
                    }
                }
            }
            Ok(())
        })?;
        adeko_lib.set("circle", circle_fn)?;

        // rectangle function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let rectangle_fn = self.lua.create_function(move |_, (p1, p2): (Table, Table)| {
            let mut output = output_buffer_clone.lock().unwrap();

            let x1: f64 = p1.get(1).unwrap_or(0.0);
            let y1: f64 = p1.get(2).unwrap_or(0.0);
            let x2: f64 = p2.get(1).unwrap_or(0.0);
            let y2: f64 = p2.get(2).unwrap_or(0.0);

            output.push(format!("Rectangle from ({:.2}, {:.2}) to ({:.2}, {:.2})", x1, y1, x2, y2));
            Ok(())
        })?;
        adeko_lib.set("rectangle", rectangle_fn)?;

        // line function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let adeko_line_fn = self.lua.create_function(move |_, args: mlua::Variadic<Value>| {
            let mut output = output_buffer_clone.lock().unwrap();

            if args.len() >= 2 {
                if let (Some(p1), Some(p2)) = (args.get(0), args.get(1)) {
                    if let (Some(p1_table), Some(p2_table)) = (p1.as_table(), p2.as_table()) {
                        let x1: f64 = p1_table.get(1).unwrap_or(0.0);
                        let y1: f64 = p1_table.get(2).unwrap_or(0.0);
                        let x2: f64 = p2_table.get(1).unwrap_or(0.0);
                        let y2: f64 = p2_table.get(2).unwrap_or(0.0);

                        let bulge = args.get(2).and_then(|v| v.as_number()).unwrap_or(0.0);
                        if bulge != 0.0 {
                            output.push(format!("Arc from ({:.2}, {:.2}) to ({:.2}, {:.2}) with bulge {:.2}",
                                x1, y1, x2, y2, bulge));
                        } else {
                            output.push(format!("Line from ({:.2}, {:.2}) to ({:.2}, {:.2})", x1, y1, x2, y2));
                        }
                    }
                }
            }
            Ok(())
        })?;
        adeko_lib.set("line", adeko_line_fn)?;

        // polylineimp function
        let output_buffer_clone = Arc::clone(&output_buffer);
        let polyline_fn = self.lua.create_function(move |_, points: Table| {
            let mut output = output_buffer_clone.lock().unwrap();

            let mut point_count = 0;
            for pair in points.pairs::<i32, Table>() {
                if let Ok((_, point)) = pair {
                    let x: f64 = point.get(1).unwrap_or(0.0);
                    let y: f64 = point.get(2).unwrap_or(0.0);
                    point_count += 1;
                    output.push(format!("  Point {}: ({:.2}, {:.2})", point_count, x, y));
                }
            }
            output.push(format!("Polyline with {} points", point_count));
            Ok(())
        })?;
        adeko_lib.set("polylineimp", polyline_fn)?;

        globals.set("ADekoLib", adeko_lib)?;
        Ok(())
    }

    fn setup_debug_variables(&self, globals: &Table) -> LuaResult<()> {
        // ADekoDebugMode variables
        globals.set("X", 500.0)?;
        globals.set("Y", 700.0)?;
        globals.set("modelParameters", "")?;
        globals.set("materialThickness", 18.0)?;
        globals.set("offset", 20.0)?;
        globals.set("edge1layer", "LMM0")?;
        globals.set("edge2layer", "LMM1")?;
        globals.set("edge3layer", "LMM2")?;
        globals.set("edge4layer", "LMM3")?;
        globals.set("edge1thickness", 0.1)?;
        globals.set("edge2thickness", 0.2)?;
        globals.set("edge3thickness", 0.3)?;
        globals.set("edge4thickness", 0.4)?;
        globals.set("doesSizeIncludeEdgeThickness", "false")?;

        Ok(())
    }

    pub fn execute_script(&self, script: &str) -> LuaExecutionResult {
        let start_time = std::time::Instant::now();

        // Clear output buffer and draw commands
        self.output_buffer.lock().unwrap().clear();
        self.draw_commands.lock().unwrap().clear();

        // Execute the script
        match self.lua.load(script).exec() {
            Ok(_) => {
                let output = self.output_buffer.lock().unwrap().join("\n");
                let draw_commands = self.draw_commands.lock().unwrap().clone();
                LuaExecutionResult {
                    success: true,
                    output,
                    error: String::new(),
                    execution_time_ms: start_time.elapsed().as_millis() as u64,
                    draw_commands,
                }
            }
            Err(err) => {
                LuaExecutionResult {
                    success: false,
                    output: String::new(),
                    error: format!("Lua execution error: {}", err),
                    execution_time_ms: start_time.elapsed().as_millis() as u64,
                    draw_commands: Vec::new(),
                }
            }
        }
    }
}
