import { invoke } from '@tauri-apps/api/core'

export interface LuaExecutionResult {
  success: boolean
  output: string
  error: string
  execution_time_ms: number
}

export interface LuaExecutorOptions {
  scriptContent: string
  luaLibraryPath: string
  debugMode: boolean
}

/**
 * Execute Lua script using the embedded native Lua interpreter
 */
export async function executeLuaScript(options: LuaExecutorOptions): Promise<LuaExecutionResult> {
  try {
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
      execution_time_ms: 0
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
