import { invoke } from '@tauri-apps/api/core'

export interface DrawCommand {
  command_type: string
  x1: number
  y1: number
  x2: number
  y2: number
  radius: number
  color: string
  size: number
  text: string
  layer_name: string
  thickness?: number
}

export interface LuaExecutionResult {
  success: boolean
  output: string
  error: string
  execution_time_ms: number
  draw_commands: DrawCommand[]
}

export interface LuaExecutorOptions {
  scriptContent: string
  luaLibraryPath: string
  debugMode: boolean
}

export interface LuaSyntaxError {
  line: number
  column: number
  message: string
}

export interface LuaSyntaxValidationResult {
  is_valid: boolean
  errors: LuaSyntaxError[]
}

/**
 * Execute Lua script using the embedded native Lua interpreter
 */
export async function executeLuaScript(options: LuaExecutorOptions): Promise<LuaExecutionResult> {
  try {
    console.log('=== SENDING TO RUST ===')
    console.log('Script content:', options.scriptContent)
    console.log('Lua library path:', options.luaLibraryPath)
    console.log('Debug mode:', options.debugMode)
    console.log('=== END SENDING TO RUST ===')

    // Use native Lua execution (always available with embedded mlua)
    return await invoke<LuaExecutionResult>('execute_lua_script', {
      scriptContent: options.scriptContent,
      luaLibraryPath: options.luaLibraryPath,
      debugMode: options.debugMode
    })
  } catch (error) {
    return {
      success: false,
      output: '',
      error: `Failed to execute Lua script: ${error}`,
      execution_time_ms: 0,
      draw_commands: []
    }
  }
}

/**
 * Check if native Lua is available (always true with embedded Lua)
 */
export async function checkLuaAvailability(): Promise<boolean> {
  try {
    return await invoke<boolean>('check_lua_availability')
  } catch {
    return false
  }
}

/**
 * Validate Lua syntax using the embedded Lua interpreter
 */
export async function validateLuaSyntax(scriptContent: string): Promise<LuaSyntaxValidationResult> {
  try {
    return await invoke<LuaSyntaxValidationResult>('validate_lua_syntax', {
      scriptContent
    })
  } catch (error) {
    return {
      is_valid: false,
      errors: [{
        line: 1,
        column: 1,
        message: `Failed to validate Lua syntax: ${error}`
      }]
    }
  }
}
