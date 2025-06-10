# Enhanced Tooltipping System

The Adeko Lua Editor now features a comprehensive tooltipping system that provides intelligent hover documentation for both AdekoLib functions and Lua standard library functions.

## 🎯 Features Overview

### 1. AdekoLib Function Tooltips
- **Enhanced Documentation**: Rich tooltips with function signatures, parameter details, and examples
- **Category Information**: Shows function category and complexity level
- **Parameter Hints**: Detailed parameter descriptions with types and default values
- **Usage Examples**: Working code examples for each function
- **Related Functions**: Suggestions for similar or related functions

### 2. Lua Standard Library Tooltips
- **Core Functions**: `print`, `type`, `tonumber`, `tostring`, `pairs`, `ipairs`, `next`
- **String Library**: `string.len`, `string.sub`, `string.upper`, `string.lower`, `string.find`, `string.gsub`, `string.format`
- **Math Library**: `math.abs`, `math.floor`, `math.ceil`, `math.max`, `math.min`, `math.sqrt`, `math.sin`, `math.cos`
- **Table Library**: `table.insert`, `table.remove`, `table.concat`, `table.sort`

### 3. Lua Keywords and Control Structures
- **Keywords**: `function`, `local`, `if`, `for`, `while`, `repeat`, `return`, `break`
- **Literals**: `nil`, `true`, `false`
- **Syntax Examples**: Complete syntax patterns with usage examples

## 🚀 How to Use

### Hover Tooltips
Simply hover your mouse over any function name or keyword to see detailed documentation:

```lua
-- Hover over 'print' to see core function documentation
print("Hello, World!")

-- Hover over 'string.upper' to see string library documentation
local message = string.upper("hello")

-- Hover over 'math.sqrt' to see math library documentation
local result = math.sqrt(16)

-- Hover over 'ADekoLib.circle' to see AdekoLib function documentation
ADekoLib.circle({100, 100}, 50)

-- Hover over 'function' to see keyword documentation
function myFunction()
    return true
end
```

### Auto-completion with Documentation
Type function names to get intelligent suggestions with full documentation:

- Type `string.` to see all string library functions
- Type `math.` to see all math library functions
- Type `table.` to see all table library functions
- Type `ADekoLib.` to see all AdekoLib functions

### Parameter Hints
When typing function calls, you'll see parameter hints with descriptions:

```lua
-- Type the opening parenthesis to see parameter hints
string.sub(|  -- Shows: string.sub(s, start [, end])
math.max(|   -- Shows: math.max(x, ...)
ADekoLib.circle(|  -- Shows: ADekoLib.circle(center, radius)
```

## 📚 Tooltip Content

### AdekoLib Function Tooltips Include:
- **Function Signature**: Complete syntax with parameter types
- **Description**: Detailed explanation of what the function does
- **Parameters**: Each parameter with type, description, and default values
- **Return Value**: What the function returns and its type
- **Example**: Working code example
- **Category**: Function category (e.g., "Geometric Transformations")
- **Complexity**: Difficulty level (Basic, Intermediate, Advanced)
- **Related Functions**: Suggestions for similar functions

### Lua Standard Library Tooltips Include:
- **Module**: Which library the function belongs to (core, string, math, table)
- **Syntax**: Complete function syntax
- **Parameters**: Detailed parameter information
- **Return Value**: What the function returns
- **Example**: Practical usage examples
- **Related Functions**: Links to similar functions

### Keyword Tooltips Include:
- **Type**: Whether it's a keyword, operator, or literal
- **Description**: What the keyword does
- **Syntax**: How to use the keyword
- **Example**: Complete syntax examples

## 🔧 Technical Implementation

### Monaco Editor Integration
- **Hover Provider**: Enhanced to support multiple function types
- **Completion Provider**: Includes Lua standard library functions
- **Signature Help**: Parameter hints for all supported functions

### Function Database
- **Comprehensive Catalog**: 200+ AdekoLib functions + 30+ Lua standard functions
- **Structured Data**: Organized by modules and categories
- **Rich Metadata**: Complete documentation for each function
- **Internationalization**: Support for English and Turkish

### Smart Detection
- **Context Awareness**: Detects function context (AdekoLib vs Lua standard)
- **Module Recognition**: Identifies string.*, math.*, table.* patterns
- **Keyword Recognition**: Recognizes Lua keywords and control structures

## 🌍 Internationalization

All tooltips support both English and Turkish:

- **English**: Complete documentation in English
- **Turkish**: Full Turkish translations for all content
- **Dynamic Switching**: Language changes apply to tooltips immediately

## 💡 Tips for Best Experience

1. **Hover Frequently**: Get in the habit of hovering over functions to learn
2. **Use Auto-completion**: Type module prefixes to discover functions
3. **Read Examples**: Each tooltip includes working code examples
4. **Explore Related Functions**: Use "See Also" suggestions to discover new functions
5. **Check Parameter Types**: Pay attention to parameter types and requirements

## 🎓 Learning Benefits

The enhanced tooltipping system helps developers:

- **Learn Faster**: Instant access to function documentation
- **Write Better Code**: Understanding parameter types and return values
- **Discover Functions**: Find new functions through auto-completion
- **Avoid Errors**: See parameter requirements before calling functions
- **Improve Productivity**: No need to switch to external documentation

## 🔮 Future Enhancements

Planned improvements include:

- **More Lua Libraries**: io, os, utf8, coroutine libraries
- **Custom Functions**: Tooltips for user-defined functions
- **Error Tooltips**: Hover over syntax errors for explanations
- **Performance Metrics**: Function performance information
- **Code Snippets**: Insertable code templates

The enhanced tooltipping system makes the Adeko Lua Editor a powerful learning and development environment for both beginners and experienced Lua developers.
