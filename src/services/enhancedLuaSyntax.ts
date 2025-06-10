// Enhanced Lua Syntax Highlighting for Monaco Editor
import * as monaco from 'monaco-editor'

// AdekoLib functions for special highlighting
export const ADEKO_FUNCTIONS = [
  // Drawing functions
  'point', 'line', 'arc', 'circle', 'rectangle', 'polygon',
  'bezier', 'spline', 'ellipse', 'polyline',
  
  // Layer and styling functions
  'setLayer', 'setFace', 'setThickness', 'setColor', 'setPenWidth',
  'setLineType', 'setHatch', 'setFill',
  
  // Transformation functions
  'move', 'rotate', 'scale', 'mirror', 'translate',
  'transform', 'matrix',
  
  // Measurement functions
  'distance', 'angle', 'area', 'perimeter', 'length',
  
  // Utility functions
  'start', 'finish', 'showPoints', 'enableListing',
  'getX', 'getY', 'getZ', 'setX', 'setY', 'setZ',
  
  // Advanced functions
  'offset', 'fillet', 'chamfer', 'trim', 'extend',
  'intersect', 'union', 'subtract', 'boolean'
]

// Lua built-in functions
export const LUA_BUILTINS = [
  // Basic functions
  'print', 'type', 'tostring', 'tonumber', 'pairs', 'ipairs',
  'next', 'select', 'unpack', 'rawget', 'rawset', 'rawlen',
  'getmetatable', 'setmetatable', 'pcall', 'xpcall',
  
  // String functions
  'string.find', 'string.match', 'string.gsub', 'string.sub',
  'string.len', 'string.upper', 'string.lower', 'string.rep',
  'string.format', 'string.char', 'string.byte',
  
  // Table functions
  'table.insert', 'table.remove', 'table.sort', 'table.concat',
  'table.pack', 'table.unpack',
  
  // Math functions
  'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.atan2',
  'math.ceil', 'math.cos', 'math.deg', 'math.exp', 'math.floor',
  'math.fmod', 'math.log', 'math.max', 'math.min', 'math.modf',
  'math.pow', 'math.rad', 'math.random', 'math.randomseed',
  'math.sin', 'math.sqrt', 'math.tan',
  
  // IO functions
  'io.open', 'io.close', 'io.read', 'io.write', 'io.flush'
]

// Enhanced Lua language configuration
export const ENHANCED_LUA_CONFIG: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '--',
    blockComment: ['--[[', ']]']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '[[', close: ']]' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '[[', close: ']]' }
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*--\\s*#region\\b'),
      end: new RegExp('^\\s*--\\s*#endregion\\b')
    }
  }
}

// Enhanced Lua tokenizer with better syntax highlighting
export const ENHANCED_LUA_TOKENIZER: monaco.languages.IMonarchLanguage = {
  // Remove problematic array references and use direct patterns
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root: [
      // Function definitions
      [/\b(function)\s+([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)\s*\(/,
        ['keyword', 'function']],

      // Local function definitions
      [/\b(local)\s+(function)\s+([a-zA-Z_]\w*)\s*\(/,
        ['keyword', 'keyword', 'function']],

      // AdekoLib function calls (ADekoLib.functionName)
      [/\b(ADekoLib|G)\s*\.\s*([a-zA-Z_]\w*)\s*\(/,
        ['identifier', 'adeko.function']],

      // Direct AdekoLib function calls (check against known functions)
      [/\b(point|line|arc|circle|rectangle|polygon|bezier|spline|ellipse|polyline|setLayer|setFace|setThickness|setColor|setPenWidth|setLineType|setHatch|setFill|move|rotate|scale|mirror|translate|transform|matrix|distance|angle|area|perimeter|length|start|finish|showPoints|enableListing|getX|getY|getZ|setX|setY|setZ|offset|fillet|chamfer|trim|extend|intersect|union|subtract|boolean)\s*\(/, 'adeko.function'],

      // Lua built-in function calls
      [/\b(print|type|tostring|tonumber|pairs|ipairs|next|select|unpack|rawget|rawset|rawlen|getmetatable|setmetatable|pcall|xpcall)\s*\(/, 'lua.builtin'],

      // String library functions
      [/\b(string)\s*\.\s*(find|match|gsub|sub|len|upper|lower|rep|format|char|byte)\s*\(/, ['identifier', 'lua.builtin']],

      // Table library functions
      [/\b(table)\s*\.\s*(insert|remove|sort|concat|pack|unpack)\s*\(/, ['identifier', 'lua.builtin']],

      // Math library functions
      [/\b(math)\s*\.\s*(abs|acos|asin|atan|atan2|ceil|cos|deg|exp|floor|fmod|log|max|min|modf|pow|rad|random|randomseed|sin|sqrt|tan|pi|huge)\s*\(/, ['identifier', 'lua.builtin']],

      // IO library functions
      [/\b(io)\s*\.\s*(open|close|read|write|flush)\s*\(/, ['identifier', 'lua.builtin']],

      // Function calls (general)
      [/\b([a-zA-Z_]\w*)\s*\(/, 'function.call'],

      // Local variable declarations
      [/\b(local)\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)/,
        ['keyword', 'variable.local']],

      // Keywords (explicit list)
      [/\b(and|break|do|else|elseif|end|false|for|function|if|in|local|nil|not|or|repeat|return|then|true|until|while|goto)\b/, 'keyword'],

      // Identifiers
      [/[a-zA-Z_]\w*/, 'identifier'],

      // Numbers (enhanced)
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+\.?\d*([eE][-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // Strings (enhanced)
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string_single'],
      [/\[\[/, 'string', '@string_multiline'],

      // Comments (enhanced)
      [/--\[\[/, 'comment', '@comment_multiline'],
      [/--.*$/, 'comment'],

      // Operators (explicit patterns)
      [/[=><~!]+/, 'operator'],
      [/[+\-*/%^#]+/, 'operator'],
      [/\.\.\.?/, 'operator'],
      [/[&|~]/, 'operator'],

      // Delimiters
      [/[{}()[\]]/, 'delimiter.bracket'],
      [/[,;]/, 'delimiter'],

      // Whitespace
      [/\s+/, 'white']
    ],
    
    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],
    
    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],
    
    string_multiline: [
      [/[^\]]+/, 'string'],
      [/\]\]/, 'string', '@pop'],
      [/[\]]/, 'string']
    ],
    
    comment_multiline: [
      [/[^\]]+/, 'comment'],
      [/\]\]/, 'comment', '@pop'],
      [/[\]]/, 'comment']
    ]
  }
}

/**
 * Setup enhanced Lua syntax highlighting
 */
export function setupEnhancedLuaSyntax(): void {
  // Register enhanced language configuration
  monaco.languages.setLanguageConfiguration('lua', ENHANCED_LUA_CONFIG)
  
  // Register enhanced tokenizer
  monaco.languages.setMonarchTokensProvider('lua', ENHANCED_LUA_TOKENIZER)
}

/**
 * Update AdekoLib alias detection for dynamic highlighting
 */
export function updateAdekoLibAlias(alias: string): void {
  // This function can be called when a new alias is detected
  // For now, we'll keep it simple and rely on the tokenizer patterns
  console.log(`AdekoLib alias detected: ${alias}`)
}
