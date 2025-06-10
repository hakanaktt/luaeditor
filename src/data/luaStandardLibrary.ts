/**
 * Lua Standard Library Function Database
 * 
 * Comprehensive catalog of Lua 5.4 standard library functions with detailed
 * documentation for IntelliSense and tooltip support.
 */

export interface LuaParameter {
  name: string
  type: string
  optional?: boolean
  description: string
  defaultValue?: string
}

export interface LuaFunction {
  name: string
  module: string
  description: string
  syntax: string
  parameters: LuaParameter[]
  returns: string
  returnDescription: string
  example?: string
  seeAlso?: string[]
  version?: string
}

export interface LuaKeyword {
  name: string
  type: 'keyword' | 'operator' | 'literal'
  description: string
  syntax: string
  example?: string
}

// Lua Keywords and Control Structures
export const luaKeywords: LuaKeyword[] = [
  {
    name: 'function',
    type: 'keyword',
    description: 'Defines a function',
    syntax: 'function name(parameters) ... end',
    example: 'function add(a, b)\n  return a + b\nend'
  },
  {
    name: 'local',
    type: 'keyword',
    description: 'Declares a local variable',
    syntax: 'local variable = value',
    example: 'local x = 10\nlocal name = "John"'
  },
  {
    name: 'if',
    type: 'keyword',
    description: 'Conditional statement',
    syntax: 'if condition then ... elseif condition then ... else ... end',
    example: 'if x > 0 then\n  print("positive")\nelse\n  print("not positive")\nend'
  },
  {
    name: 'for',
    type: 'keyword',
    description: 'Loop statement',
    syntax: 'for var = start, stop, step do ... end\nfor key, value in pairs(table) do ... end',
    example: 'for i = 1, 10 do\n  print(i)\nend'
  },
  {
    name: 'while',
    type: 'keyword',
    description: 'While loop statement',
    syntax: 'while condition do ... end',
    example: 'while x > 0 do\n  x = x - 1\nend'
  },
  {
    name: 'repeat',
    type: 'keyword',
    description: 'Repeat-until loop statement',
    syntax: 'repeat ... until condition',
    example: 'repeat\n  x = x + 1\nuntil x > 10'
  },
  {
    name: 'return',
    type: 'keyword',
    description: 'Returns values from a function',
    syntax: 'return [value1, value2, ...]',
    example: 'function multiply(a, b)\n  return a * b\nend'
  },
  {
    name: 'break',
    type: 'keyword',
    description: 'Exits from a loop',
    syntax: 'break',
    example: 'for i = 1, 100 do\n  if i == 50 then break end\nend'
  },
  {
    name: 'nil',
    type: 'literal',
    description: 'Represents the absence of a value',
    syntax: 'nil',
    example: 'local x = nil\nif x == nil then print("x is nil") end'
  },
  {
    name: 'true',
    type: 'literal',
    description: 'Boolean true value',
    syntax: 'true',
    example: 'local flag = true\nif flag then print("flag is true") end'
  },
  {
    name: 'false',
    type: 'literal',
    description: 'Boolean false value',
    syntax: 'false',
    example: 'local flag = false\nif not flag then print("flag is false") end'
  }
]

// Core Lua Functions
export const luaCoreFunctions: LuaFunction[] = [
  {
    name: 'print',
    module: 'core',
    description: 'Prints values to standard output',
    syntax: 'print(...)',
    parameters: [
      {
        name: '...',
        type: 'any',
        description: 'Values to print (variable number of arguments)'
      }
    ],
    returns: 'void',
    returnDescription: 'No return value',
    example: 'print("Hello, World!")\nprint(42, true, nil)',
    seeAlso: ['io.write', 'string.format']
  },
  {
    name: 'type',
    module: 'core',
    description: 'Returns the type of a value',
    syntax: 'type(value)',
    parameters: [
      {
        name: 'value',
        type: 'any',
        description: 'The value to check the type of'
      }
    ],
    returns: 'string',
    returnDescription: 'The type name: "nil", "boolean", "number", "string", "function", "userdata", "thread", or "table"',
    example: 'print(type(42))        -- "number"\nprint(type("hello"))   -- "string"\nprint(type({}))        -- "table"',
    seeAlso: ['getmetatable', 'setmetatable']
  },
  {
    name: 'tonumber',
    module: 'core',
    description: 'Converts a value to a number',
    syntax: 'tonumber(value [, base])',
    parameters: [
      {
        name: 'value',
        type: 'string|number',
        description: 'The value to convert'
      },
      {
        name: 'base',
        type: 'number',
        optional: true,
        description: 'The base for conversion (2-36)',
        defaultValue: '10'
      }
    ],
    returns: 'number|nil',
    returnDescription: 'The converted number, or nil if conversion fails',
    example: 'print(tonumber("42"))     -- 42\nprint(tonumber("1010", 2)) -- 10\nprint(tonumber("hello"))  -- nil',
    seeAlso: ['tostring', 'string.format']
  },
  {
    name: 'tostring',
    module: 'core',
    description: 'Converts a value to a string',
    syntax: 'tostring(value)',
    parameters: [
      {
        name: 'value',
        type: 'any',
        description: 'The value to convert'
      }
    ],
    returns: 'string',
    returnDescription: 'The string representation of the value',
    example: 'print(tostring(42))    -- "42"\nprint(tostring(true))  -- "true"\nprint(tostring(nil))   -- "nil"',
    seeAlso: ['tonumber', 'string.format']
  },
  {
    name: 'pairs',
    module: 'core',
    description: 'Returns an iterator for all key-value pairs in a table',
    syntax: 'pairs(table)',
    parameters: [
      {
        name: 'table',
        type: 'table',
        description: 'The table to iterate over'
      }
    ],
    returns: 'function, table, nil',
    returnDescription: 'Iterator function, table, and initial key',
    example: 'local t = {a = 1, b = 2, c = 3}\nfor key, value in pairs(t) do\n  print(key, value)\nend',
    seeAlso: ['ipairs', 'next']
  },
  {
    name: 'ipairs',
    module: 'core',
    description: 'Returns an iterator for the array part of a table',
    syntax: 'ipairs(table)',
    parameters: [
      {
        name: 'table',
        type: 'table',
        description: 'The table to iterate over'
      }
    ],
    returns: 'function, table, number',
    returnDescription: 'Iterator function, table, and initial index (0)',
    example: 'local t = {"a", "b", "c"}\nfor index, value in ipairs(t) do\n  print(index, value)\nend',
    seeAlso: ['pairs', 'next']
  },
  {
    name: 'next',
    module: 'core',
    description: 'Returns the next key-value pair in a table',
    syntax: 'next(table [, key])',
    parameters: [
      {
        name: 'table',
        type: 'table',
        description: 'The table to traverse'
      },
      {
        name: 'key',
        type: 'any',
        optional: true,
        description: 'The current key (nil for first key)'
      }
    ],
    returns: 'any, any',
    returnDescription: 'Next key and its value, or nil if no more pairs',
    example: 'local t = {a = 1, b = 2}\nlocal key, value = next(t)\nprint(key, value)  -- prints first pair',
    seeAlso: ['pairs', 'ipairs']
  }
]

// String Library Functions
export const luaStringFunctions: LuaFunction[] = [
  {
    name: 'len',
    module: 'string',
    description: 'Returns the length of a string',
    syntax: 'string.len(s) or #s',
    parameters: [
      {
        name: 's',
        type: 'string',
        description: 'The string to measure'
      }
    ],
    returns: 'number',
    returnDescription: 'The length of the string in bytes',
    example: 'print(string.len("hello"))  -- 5\nprint(#"world")            -- 5',
    seeAlso: ['string.sub', 'utf8.len']
  },
  {
    name: 'sub',
    module: 'string',
    description: 'Returns a substring',
    syntax: 'string.sub(s, start [, end])',
    parameters: [
      {
        name: 's',
        type: 'string',
        description: 'The source string'
      },
      {
        name: 'start',
        type: 'number',
        description: 'Starting position (1-based, negative counts from end)'
      },
      {
        name: 'end',
        type: 'number',
        optional: true,
        description: 'Ending position (inclusive, defaults to string length)'
      }
    ],
    returns: 'string',
    returnDescription: 'The substring',
    example: 'print(string.sub("hello", 2, 4))  -- "ell"\nprint(string.sub("hello", -3))    -- "llo"',
    seeAlso: ['string.len', 'string.find']
  },
  {
    name: 'upper',
    module: 'string',
    description: 'Converts string to uppercase',
    syntax: 'string.upper(s)',
    parameters: [
      {
        name: 's',
        type: 'string',
        description: 'The string to convert'
      }
    ],
    returns: 'string',
    returnDescription: 'The uppercase string',
    example: 'print(string.upper("hello"))  -- "HELLO"',
    seeAlso: ['string.lower', 'string.gsub']
  },
  {
    name: 'lower',
    module: 'string',
    description: 'Converts string to lowercase',
    syntax: 'string.lower(s)',
    parameters: [
      {
        name: 's',
        type: 'string',
        description: 'The string to convert'
      }
    ],
    returns: 'string',
    returnDescription: 'The lowercase string',
    example: 'print(string.lower("HELLO"))  -- "hello"',
    seeAlso: ['string.upper', 'string.gsub']
  },
  {
    name: 'find',
    module: 'string',
    description: 'Finds a pattern in a string',
    syntax: 'string.find(s, pattern [, init [, plain]])',
    parameters: [
      {
        name: 's',
        type: 'string',
        description: 'The string to search in'
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'The pattern to search for'
      },
      {
        name: 'init',
        type: 'number',
        optional: true,
        description: 'Starting position for search',
        defaultValue: '1'
      },
      {
        name: 'plain',
        type: 'boolean',
        optional: true,
        description: 'If true, pattern is treated as plain text',
        defaultValue: 'false'
      }
    ],
    returns: 'number, number, ...',
    returnDescription: 'Start and end positions of match, plus any captures',
    example: 'local start, stop = string.find("hello world", "wor")\nprint(start, stop)  -- 7 9',
    seeAlso: ['string.match', 'string.gsub', 'string.gmatch']
  },
  {
    name: 'gsub',
    module: 'string',
    description: 'Global substitution of patterns in a string',
    syntax: 'string.gsub(s, pattern, replacement [, n])',
    parameters: [
      {
        name: 's',
        type: 'string',
        description: 'The source string'
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'The pattern to replace'
      },
      {
        name: 'replacement',
        type: 'string|function|table',
        description: 'The replacement string, function, or table'
      },
      {
        name: 'n',
        type: 'number',
        optional: true,
        description: 'Maximum number of replacements'
      }
    ],
    returns: 'string, number',
    returnDescription: 'The modified string and number of substitutions made',
    example: 'local result = string.gsub("hello world", "l", "L")\nprint(result)  -- "heLLo worLd"',
    seeAlso: ['string.find', 'string.match', 'string.gmatch']
  },
  {
    name: 'format',
    module: 'string',
    description: 'Formats a string using printf-style formatting',
    syntax: 'string.format(formatstring, ...)',
    parameters: [
      {
        name: 'formatstring',
        type: 'string',
        description: 'The format string with placeholders'
      },
      {
        name: '...',
        type: 'any',
        description: 'Values to format'
      }
    ],
    returns: 'string',
    returnDescription: 'The formatted string',
    example: 'print(string.format("Hello %s, you are %d years old", "John", 25))\n-- "Hello John, you are 25 years old"',
    seeAlso: ['tostring', 'tonumber']
  }
]

// Math Library Functions
export const luaMathFunctions: LuaFunction[] = [
  {
    name: 'abs',
    module: 'math',
    description: 'Returns the absolute value of a number',
    syntax: 'math.abs(x)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to get absolute value of'
      }
    ],
    returns: 'number',
    returnDescription: 'The absolute value of x',
    example: 'print(math.abs(-5))   -- 5\nprint(math.abs(3.14)) -- 3.14',
    seeAlso: ['math.floor', 'math.ceil']
  },
  {
    name: 'floor',
    module: 'math',
    description: 'Returns the largest integer less than or equal to x',
    syntax: 'math.floor(x)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to floor'
      }
    ],
    returns: 'number',
    returnDescription: 'The floor of x',
    example: 'print(math.floor(3.7))  -- 3\nprint(math.floor(-2.3)) -- -3',
    seeAlso: ['math.ceil', 'math.abs']
  },
  {
    name: 'ceil',
    module: 'math',
    description: 'Returns the smallest integer greater than or equal to x',
    syntax: 'math.ceil(x)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to ceil'
      }
    ],
    returns: 'number',
    returnDescription: 'The ceiling of x',
    example: 'print(math.ceil(3.2))  -- 4\nprint(math.ceil(-2.7)) -- -2',
    seeAlso: ['math.floor', 'math.abs']
  },
  {
    name: 'max',
    module: 'math',
    description: 'Returns the maximum value among its arguments',
    syntax: 'math.max(x, ...)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'First number'
      },
      {
        name: '...',
        type: 'number',
        description: 'Additional numbers to compare'
      }
    ],
    returns: 'number',
    returnDescription: 'The maximum value',
    example: 'print(math.max(1, 5, 3))  -- 5\nprint(math.max(-1, -5))   -- -1',
    seeAlso: ['math.min']
  },
  {
    name: 'min',
    module: 'math',
    description: 'Returns the minimum value among its arguments',
    syntax: 'math.min(x, ...)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'First number'
      },
      {
        name: '...',
        type: 'number',
        description: 'Additional numbers to compare'
      }
    ],
    returns: 'number',
    returnDescription: 'The minimum value',
    example: 'print(math.min(1, 5, 3))  -- 1\nprint(math.min(-1, -5))   -- -5',
    seeAlso: ['math.max']
  },
  {
    name: 'sqrt',
    module: 'math',
    description: 'Returns the square root of x',
    syntax: 'math.sqrt(x)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'The number to get square root of (must be non-negative)'
      }
    ],
    returns: 'number',
    returnDescription: 'The square root of x',
    example: 'print(math.sqrt(16))  -- 4\nprint(math.sqrt(2))   -- 1.4142135623731',
    seeAlso: ['math.pow', 'math.exp']
  },
  {
    name: 'sin',
    module: 'math',
    description: 'Returns the sine of x (in radians)',
    syntax: 'math.sin(x)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in radians'
      }
    ],
    returns: 'number',
    returnDescription: 'The sine of x',
    example: 'print(math.sin(math.pi / 2))  -- 1\nprint(math.sin(0))            -- 0',
    seeAlso: ['math.cos', 'math.tan', 'math.pi']
  },
  {
    name: 'cos',
    module: 'math',
    description: 'Returns the cosine of x (in radians)',
    syntax: 'math.cos(x)',
    parameters: [
      {
        name: 'x',
        type: 'number',
        description: 'The angle in radians'
      }
    ],
    returns: 'number',
    returnDescription: 'The cosine of x',
    example: 'print(math.cos(0))         -- 1\nprint(math.cos(math.pi))   -- -1',
    seeAlso: ['math.sin', 'math.tan', 'math.pi']
  }
]

// Table Library Functions
export const luaTableFunctions: LuaFunction[] = [
  {
    name: 'insert',
    module: 'table',
    description: 'Inserts an element into a table',
    syntax: 'table.insert(list, [pos,] value)',
    parameters: [
      {
        name: 'list',
        type: 'table',
        description: 'The table to insert into'
      },
      {
        name: 'pos',
        type: 'number',
        optional: true,
        description: 'Position to insert at (defaults to end)'
      },
      {
        name: 'value',
        type: 'any',
        description: 'The value to insert'
      }
    ],
    returns: 'void',
    returnDescription: 'No return value',
    example: 'local t = {1, 2, 3}\ntable.insert(t, 4)     -- {1, 2, 3, 4}\ntable.insert(t, 2, 5)  -- {1, 5, 2, 3, 4}',
    seeAlso: ['table.remove', 'table.concat']
  },
  {
    name: 'remove',
    module: 'table',
    description: 'Removes an element from a table',
    syntax: 'table.remove(list [, pos])',
    parameters: [
      {
        name: 'list',
        type: 'table',
        description: 'The table to remove from'
      },
      {
        name: 'pos',
        type: 'number',
        optional: true,
        description: 'Position to remove (defaults to last element)'
      }
    ],
    returns: 'any',
    returnDescription: 'The removed element',
    example: 'local t = {1, 2, 3, 4}\nlocal removed = table.remove(t)    -- removes 4\nlocal removed2 = table.remove(t, 2) -- removes 2',
    seeAlso: ['table.insert', 'table.concat']
  },
  {
    name: 'concat',
    module: 'table',
    description: 'Concatenates table elements into a string',
    syntax: 'table.concat(list [, sep [, start [, end]]])',
    parameters: [
      {
        name: 'list',
        type: 'table',
        description: 'The table to concatenate'
      },
      {
        name: 'sep',
        type: 'string',
        optional: true,
        description: 'Separator string',
        defaultValue: '""'
      },
      {
        name: 'start',
        type: 'number',
        optional: true,
        description: 'Starting index',
        defaultValue: '1'
      },
      {
        name: 'end',
        type: 'number',
        optional: true,
        description: 'Ending index',
        defaultValue: '#list'
      }
    ],
    returns: 'string',
    returnDescription: 'The concatenated string',
    example: 'local t = {"a", "b", "c"}\nprint(table.concat(t, ", "))  -- "a, b, c"',
    seeAlso: ['table.insert', 'table.remove', 'string.format']
  },
  {
    name: 'sort',
    module: 'table',
    description: 'Sorts table elements in place',
    syntax: 'table.sort(list [, comp])',
    parameters: [
      {
        name: 'list',
        type: 'table',
        description: 'The table to sort'
      },
      {
        name: 'comp',
        type: 'function',
        optional: true,
        description: 'Comparison function (a, b) -> boolean'
      }
    ],
    returns: 'void',
    returnDescription: 'No return value (sorts in place)',
    example: 'local t = {3, 1, 4, 1, 5}\ntable.sort(t)\n-- t is now {1, 1, 3, 4, 5}',
    seeAlso: ['pairs', 'ipairs']
  }
]

// All Lua standard functions combined
export const allLuaFunctions: LuaFunction[] = [
  ...luaCoreFunctions,
  ...luaStringFunctions,
  ...luaMathFunctions,
  ...luaTableFunctions
]

// Service class for Lua standard library
export class LuaStandardLibraryService {
  private functionMap: Map<string, LuaFunction> = new Map()
  private keywordMap: Map<string, LuaKeyword> = new Map()

  constructor() {
    // Index all functions
    allLuaFunctions.forEach(func => {
      this.functionMap.set(func.name, func)
      // Also index with module prefix
      this.functionMap.set(`${func.module}.${func.name}`, func)
    })

    // Index all keywords
    luaKeywords.forEach(keyword => {
      this.keywordMap.set(keyword.name, keyword)
    })
  }

  /**
   * Get a Lua function by name
   */
  getFunction(name: string): LuaFunction | undefined {
    return this.functionMap.get(name)
  }

  /**
   * Get a Lua keyword by name
   */
  getKeyword(name: string): LuaKeyword | undefined {
    return this.keywordMap.get(name)
  }

  /**
   * Check if a name is a Lua standard function
   */
  isLuaFunction(name: string): boolean {
    return this.functionMap.has(name)
  }

  /**
   * Check if a name is a Lua keyword
   */
  isLuaKeyword(name: string): boolean {
    return this.keywordMap.has(name)
  }

  /**
   * Get all functions in a module
   */
  getFunctionsByModule(module: string): LuaFunction[] {
    return allLuaFunctions.filter(func => func.module === module)
  }

  /**
   * Search functions by name or description
   */
  searchFunctions(query: string): LuaFunction[] {
    const lowerQuery = query.toLowerCase()
    return allLuaFunctions.filter(func =>
      func.name.toLowerCase().includes(lowerQuery) ||
      func.description.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Format function documentation for tooltips
   */
  formatFunctionDocumentation(func: LuaFunction): string {
    let doc = `**${func.module}.${func.name}**\n\n${func.description}\n\n`

    doc += `**Syntax:** \`${func.syntax}\`\n\n`

    if (func.parameters.length > 0) {
      doc += '**Parameters:**\n'
      func.parameters.forEach(param => {
        const optional = param.optional ? ' (optional)' : ''
        const defaultVal = param.defaultValue !== undefined ? ` = ${param.defaultValue}` : ''
        doc += `- \`${param.name}\` (${param.type}${defaultVal})${optional}: ${param.description}\n`
      })
      doc += '\n'
    }

    doc += `**Returns:** ${func.returns} - ${func.returnDescription}\n\n`

    if (func.example) {
      doc += `**Example:**\n\`\`\`lua\n${func.example}\n\`\`\`\n\n`
    }

    if (func.seeAlso && func.seeAlso.length > 0) {
      doc += `**See also:** ${func.seeAlso.join(', ')}`
    }

    return doc
  }

  /**
   * Format keyword documentation for tooltips
   */
  formatKeywordDocumentation(keyword: LuaKeyword): string {
    let doc = `**${keyword.name}** (${keyword.type})\n\n${keyword.description}\n\n`

    doc += `**Syntax:** \`${keyword.syntax}\`\n\n`

    if (keyword.example) {
      doc += `**Example:**\n\`\`\`lua\n${keyword.example}\n\`\`\``
    }

    return doc
  }
}

// Export singleton instance
export const luaStandardLibraryService = new LuaStandardLibraryService()
