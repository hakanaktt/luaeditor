import * as monaco from 'monaco-editor'
import { functionService } from './functionService'
import { luaStandardLibraryService } from '../data/luaStandardLibrary'

export class MonacoIntelliSenseService {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private disposables: monaco.IDisposable[] = []
  private adekoLibAliases: Set<string> = new Set(['ADekoLib'])

  /**
   * Initialize IntelliSense for the given Monaco editor
   */
  initialize(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor
    this.setupLanguageFeatures()
  }

  /**
   * Dispose of all IntelliSense features
   */
  dispose() {
    this.disposables.forEach(d => d.dispose())
    this.disposables = []
  }

  /**
   * Detect AdekoLib aliases in the current document
   */
  private detectAdekoLibAliases(model: monaco.editor.ITextModel): void {
    const content = model.getValue()
    // Reset aliases to default
    this.adekoLibAliases.clear()
    this.adekoLibAliases.add('ADekoLib')

    // Look for patterns like: G = ADekoLib, local G = ADekoLib, etc.
    const aliasPattern = /(?:local\s+)?(\w+)\s*=\s*ADekoLib/g
    let match

    while ((match = aliasPattern.exec(content)) !== null) {
      const aliasName = match[1]
      if (aliasName !== 'ADekoLib') {
        this.adekoLibAliases.add(aliasName)
      }
    }
  }

  /**
   * Check if a prefix is an AdekoLib alias
   */
  private isAdekoLibAlias(prefix: string): boolean {
    return this.adekoLibAliases.has(prefix)
  }

  /**
   * Setup language features for Lua with AdekoLib support
   */
  private setupLanguageFeatures() {
    // Register completion provider
    this.disposables.push(
      monaco.languages.registerCompletionItemProvider('lua', {
        provideCompletionItems: (model, position) => {
          return this.provideCompletionItems(model, position)
        },
        triggerCharacters: ['.']
      })
    )

    // Register hover provider
    this.disposables.push(
      monaco.languages.registerHoverProvider('lua', {
        provideHover: (model, position) => {
          return this.provideHover(model, position)
        }
      })
    )

    // Register signature help provider
    this.disposables.push(
      monaco.languages.registerSignatureHelpProvider('lua', {
        provideSignatureHelp: (model, position) => {
          return this.provideSignatureHelp(model, position)
        },
        signatureHelpTriggerCharacters: ['(', ',']
      })
    )

    // Register definition provider
    this.disposables.push(
      monaco.languages.registerDefinitionProvider('lua', {
        provideDefinition: (model, position) => {
          return this.provideDefinition(model, position)
        }
      })
    )
  }

  /**
   * Provide completion items (autocomplete suggestions)
   */
  private provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const lineContent = model.getLineContent(position.lineNumber)
    const textUntilPosition = lineContent.substring(0, position.column - 1)

    // Detect aliases in the current document
    this.detectAdekoLibAliases(model)

    // Check if we're typing after any AdekoLib alias (including "ADekoLib.")
    const aliasPattern = new RegExp(`(${Array.from(this.adekoLibAliases).join('|')})\\.([a-zA-Z_]\\w*)$`)
    const adekoLibMatch = textUntilPosition.match(aliasPattern)

    if (adekoLibMatch) {
      const partialFunction = adekoLibMatch[2]
      const suggestions = functionService.getIntelliSenseSuggestions(
        textUntilPosition,
        position.column - 1,
        lineContent
      )

      return {
        suggestions: suggestions.map(suggestion => ({
          label: suggestion.label,
          kind: this.getMonacoCompletionKind(suggestion.kind),
          detail: suggestion.detail,
          documentation: {
            value: suggestion.documentation,
            isTrusted: true
          },
          insertText: suggestion.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          filterText: suggestion.filterText,
          sortText: suggestion.sortText,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - partialFunction.length,
            endColumn: position.column
          }
        }))
      }
    }

    // Check if we're typing after a Lua module (string., math., table., etc.)
    const moduleMatch = textUntilPosition.match(/(\w+)\.(\w*)$/)
    if (moduleMatch) {
      const moduleName = moduleMatch[1]
      const partialFunction = moduleMatch[2]

      // Get functions for this module
      const moduleFunctions = luaStandardLibraryService.getFunctionsByModule(moduleName)

      if (moduleFunctions.length > 0) {
        const suggestions = moduleFunctions
          .filter(func => func.name.toLowerCase().startsWith(partialFunction.toLowerCase()))
          .map((func, index) => {
            const parameterSnippet = func.parameters
              .map((param, i) => `\${${i + 1}:${param.name}}`)
              .join(', ')

            return {
              label: func.name,
              kind: monaco.languages.CompletionItemKind.Function,
              detail: `${func.name}(${func.parameters.map(p => p.name).join(', ')}) → ${func.returns}`,
              documentation: {
                value: luaStandardLibraryService.formatFunctionDocumentation(func),
                isTrusted: true
              },
              insertText: `${func.name}(${parameterSnippet})`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              filterText: func.name,
              sortText: String(index).padStart(3, '0') + func.name,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - partialFunction.length,
                endColumn: position.column
              }
            }
          })

        return { suggestions }
      }
    }

    // Basic Lua keywords, modules, and ADekoLib prefix
    const basicSuggestions: monaco.languages.CompletionItem[] = [
      {
        label: 'ADekoLib',
        kind: monaco.languages.CompletionItemKind.Module,
        detail: 'AdekoLib Function Library',
        documentation: 'Access to AdekoLib functions for CAD/CAM operations',
        insertText: 'ADekoLib.',
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column
        }
      },
      {
        label: 'string',
        kind: monaco.languages.CompletionItemKind.Module,
        detail: 'Lua String Library',
        documentation: 'String manipulation functions',
        insertText: 'string.',
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column
        }
      },
      {
        label: 'math',
        kind: monaco.languages.CompletionItemKind.Module,
        detail: 'Lua Math Library',
        documentation: 'Mathematical functions and constants',
        insertText: 'math.',
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column
        }
      },
      {
        label: 'table',
        kind: monaco.languages.CompletionItemKind.Module,
        detail: 'Lua Table Library',
        documentation: 'Table manipulation functions',
        insertText: 'table.',
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column
        }
      }
    ]

    // Add core Lua functions if user is typing something that might match
    const word = model.getWordUntilPosition(position)
    if (word.word.length > 1) {
      const coreFunctions = luaStandardLibraryService.getFunctionsByModule('core')
      const matchingCoreFunctions = coreFunctions
        .filter(func => func.name.toLowerCase().startsWith(word.word.toLowerCase()))
        .slice(0, 5) // Limit to top 5 matches
        .map((func, index) => {
          const parameterSnippet = func.parameters
            .map((param, i) => `\${${i + 1}:${param.name}}`)
            .join(', ')

          return {
            label: func.name,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: `${func.name}(${func.parameters.map(p => p.name).join(', ')}) → ${func.returns}`,
            documentation: {
              value: luaStandardLibraryService.formatFunctionDocumentation(func),
              isTrusted: true
            },
            insertText: `${func.name}(${parameterSnippet})`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            filterText: func.name,
            sortText: String(index + 100).padStart(3, '0') + func.name, // Lower priority than modules
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }
          }
        })

      basicSuggestions.push(...matchingCoreFunctions)
    }

    return { suggestions: basicSuggestions }
  }

  /**
   * Provide hover information
   */
  private provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.Hover> {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    // Detect aliases in the current document
    this.detectAdekoLibAliases(model)

    const lineContent = model.getLineContent(position.lineNumber)
    const beforeWord = lineContent.substring(0, word.startColumn - 1)

    // Check if this is an AdekoLib function (including aliases)
    const aliasMatch = beforeWord.match(/(\w+)\.$/);
    if (aliasMatch) {
      const prefix = aliasMatch[1];
      if (this.isAdekoLibAlias(prefix)) {
        const functionName = word.word
        const func = functionService.getFunction(functionName)

        if (func) {
          const signature = functionService.getFunctionSignature(functionName)
          const documentation = functionService.getQuickHelp(functionName)

          return {
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            },
            contents: [
              { value: `\`\`\`lua\n${signature}\n\`\`\`` },
              { value: documentation || func.description }
            ]
          }
        }
      }
    }

    // Check if this is a Lua standard library function with module prefix
    const moduleMatch = beforeWord.match(/(\w+)\.$/);
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      const functionName = word.word;
      const fullName = `${moduleName}.${functionName}`;

      // Check for standard Lua functions (string.*, math.*, table.*, etc.)
      const luaFunc = luaStandardLibraryService.getFunction(fullName);
      if (luaFunc) {
        const documentation = luaStandardLibraryService.formatFunctionDocumentation(luaFunc);

        return {
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          },
          contents: [
            { value: `\`\`\`lua\n${luaFunc.syntax}\n\`\`\`` },
            { value: documentation }
          ]
        }
      }
    }

    // Check if this is a core Lua function (print, type, pairs, etc.)
    const luaFunc = luaStandardLibraryService.getFunction(word.word);
    if (luaFunc && luaFunc.module === 'core') {
      const documentation = luaStandardLibraryService.formatFunctionDocumentation(luaFunc);

      return {
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        },
        contents: [
          { value: `\`\`\`lua\n${luaFunc.syntax}\n\`\`\`` },
          { value: documentation }
        ]
      }
    }

    // Check if this is a Lua keyword
    const luaKeyword = luaStandardLibraryService.getKeyword(word.word);
    if (luaKeyword) {
      const documentation = luaStandardLibraryService.formatKeywordDocumentation(luaKeyword);

      return {
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        },
        contents: [
          { value: `\`\`\`lua\n${luaKeyword.syntax}\n\`\`\`` },
          { value: documentation }
        ]
      }
    }

    return null
  }

  /**
   * Provide signature help (parameter hints)
   */
  private provideSignatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {
    const lineContent = model.getLineContent(position.lineNumber)
    const textUntilPosition = lineContent.substring(0, position.column - 1)

    // Detect aliases in the current document
    this.detectAdekoLibAliases(model)

    // Find AdekoLib function calls (including aliases)
    const aliasPattern = new RegExp(`(${Array.from(this.adekoLibAliases).join('|')})\\.(\\w+)\\s*\\([^)]*$`)
    const adekoLibMatch = textUntilPosition.match(aliasPattern)

    if (adekoLibMatch) {
      const functionName = adekoLibMatch[2]
      const func = functionService.getFunction(functionName)

      if (func) {
        // Count commas to determine active parameter
        const commaCount = (textUntilPosition.match(/,/g) || []).length
        const activeParameter = Math.min(commaCount, func.parameters.length - 1)

        const signature: monaco.languages.SignatureInformation = {
          label: `${func.name}(${func.parameters.map(p =>
            `${p.name}: ${p.type}${p.optional ? '?' : ''}`
          ).join(', ')})`,
          documentation: func.description,
          parameters: func.parameters.map(param => ({
            label: `${param.name}: ${param.type}${param.optional ? '?' : ''}`,
            documentation: param.description
          }))
        }

        return {
          value: {
            signatures: [signature],
            activeSignature: 0,
            activeParameter
          },
          dispose: () => {}
        }
      }
    }

    // Find Lua standard library function calls (module.function)
    const luaModuleMatch = textUntilPosition.match(/(\w+)\.(\w+)\s*\([^)]*$/)

    if (luaModuleMatch) {
      const moduleName = luaModuleMatch[1]
      const functionName = luaModuleMatch[2]
      const fullName = `${moduleName}.${functionName}`

      const luaFunc = luaStandardLibraryService.getFunction(fullName)

      if (luaFunc) {
        // Count commas to determine active parameter
        const commaCount = (textUntilPosition.match(/,/g) || []).length
        const activeParameter = Math.min(commaCount, luaFunc.parameters.length - 1)

        const signature: monaco.languages.SignatureInformation = {
          label: luaFunc.syntax,
          documentation: luaFunc.description,
          parameters: luaFunc.parameters.map(param => ({
            label: `${param.name}: ${param.type}${param.optional ? '?' : ''}`,
            documentation: param.description
          }))
        }

        return {
          value: {
            signatures: [signature],
            activeSignature: 0,
            activeParameter
          },
          dispose: () => {}
        }
      }
    }

    // Find core Lua function calls
    const coreFunctionMatch = textUntilPosition.match(/(\w+)\s*\([^)]*$/)

    if (coreFunctionMatch) {
      const functionName = coreFunctionMatch[1]
      const luaFunc = luaStandardLibraryService.getFunction(functionName)

      if (luaFunc && luaFunc.module === 'core') {
        // Count commas to determine active parameter
        const commaCount = (textUntilPosition.match(/,/g) || []).length
        const activeParameter = Math.min(commaCount, luaFunc.parameters.length - 1)

        const signature: monaco.languages.SignatureInformation = {
          label: luaFunc.syntax,
          documentation: luaFunc.description,
          parameters: luaFunc.parameters.map(param => ({
            label: `${param.name}: ${param.type}${param.optional ? '?' : ''}`,
            documentation: param.description
          }))
        }

        return {
          value: {
            signatures: [signature],
            activeSignature: 0,
            activeParameter
          },
          dispose: () => {}
        }
      }
    }

    return null
  }

  /**
   * Provide definition (go to definition)
   */
  private provideDefinition(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.Definition> {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    // Detect aliases in the current document
    this.detectAdekoLibAliases(model)

    const lineContent = model.getLineContent(position.lineNumber)
    const beforeWord = lineContent.substring(0, word.startColumn - 1)

    // Check if this is an AdekoLib function (including aliases)
    const aliasMatch = beforeWord.match(/(\w+)\.$/);
    if (aliasMatch) {
      const prefix = aliasMatch[1];
      if (this.isAdekoLibAlias(prefix)) {
        const functionName = word.word
        const func = functionService.getFunction(functionName)

        if (func) {
          // Since we don't have actual source files, we'll show the function info
          // In a real implementation, this would navigate to the function definition
          return {
            uri: model.uri,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }
          }
        }
      }
    }

    return null
  }

  /**
   * Convert our completion kind to Monaco's completion kind
   */
  private getMonacoCompletionKind(kind: string): monaco.languages.CompletionItemKind {
    switch (kind) {
      case 'function':
        return monaco.languages.CompletionItemKind.Function
      case 'variable':
        return monaco.languages.CompletionItemKind.Variable
      case 'keyword':
        return monaco.languages.CompletionItemKind.Keyword
      case 'constant':
        return monaco.languages.CompletionItemKind.Constant
      default:
        return monaco.languages.CompletionItemKind.Text
    }
  }

  /**
   * Insert function at cursor position
   */
  insertFunction(functionName: string) {
    if (!this.editor) return

    const func = functionService.getFunction(functionName)
    if (!func) return

    const position = this.editor.getPosition()
    if (!position) return

    // Detect aliases in the current document
    this.detectAdekoLibAliases(this.editor.getModel()!)

    // Get the appropriate alias name (first found alias or default to 'ADekoLib')
    const aliasName = Array.from(this.adekoLibAliases).find(alias => alias !== 'ADekoLib') || 'ADekoLib'

    // Create snippet with parameter placeholders
    const parameterSnippet = func.parameters.map((param, index) =>
      `\${${index + 1}:${param.name}}`
    ).join(', ')

    const snippet = `${aliasName}.${func.name}(${parameterSnippet})`

    this.editor.executeEdits('insert-function', [{
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        endColumn: position.column
      },
      text: snippet
    }])

    // Trigger snippet mode
    this.editor.focus()
  }

  /**
   * Show function documentation in a widget
   */
  showFunctionHelp(functionName: string) {
    if (!this.editor) return

    const func = functionService.getFunction(functionName)
    if (!func) return

    const position = this.editor.getPosition()
    if (!position) return

    // Create hover widget content
    // const signature = functionService.getFunctionSignature(functionName)
    // const documentation = functionService.getQuickHelp(functionName)

    // Show hover widget
    this.editor.trigger('keyboard', 'editor.action.showHover', {})
  }
}

// Export singleton instance
export const monacoIntelliSenseService = new MonacoIntelliSenseService()
