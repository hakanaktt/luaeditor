import * as monaco from 'monaco-editor'
import { functionService } from './functionService'

export class MonacoIntelliSenseService {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private disposables: monaco.IDisposable[] = []

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

    // Check if we're typing after "ADekoLib."
    const adekoLibMatch = textUntilPosition.match(/ADekoLib\.(\w*)$/)
    
    if (adekoLibMatch) {
      const partialFunction = adekoLibMatch[1]
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

    // Basic Lua keywords and ADekoLib prefix
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
      }
    ]

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

    const lineContent = model.getLineContent(position.lineNumber)
    const beforeWord = lineContent.substring(0, word.startColumn - 1)
    
    // Check if this is an AdekoLib function
    if (beforeWord.endsWith('ADekoLib.')) {
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

    // Find the function call we're in
    const functionMatch = textUntilPosition.match(/ADekoLib\.(\w+)\s*\([^)]*$/)
    
    if (functionMatch) {
      const functionName = functionMatch[1]
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

    const lineContent = model.getLineContent(position.lineNumber)
    const beforeWord = lineContent.substring(0, word.startColumn - 1)
    
    // Check if this is an AdekoLib function
    if (beforeWord.endsWith('ADekoLib.')) {
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

    // Create snippet with parameter placeholders
    const parameterSnippet = func.parameters.map((param, index) => 
      `\${${index + 1}:${param.name}}`
    ).join(', ')

    const snippet = `ADekoLib.${func.name}(${parameterSnippet})`

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
    const signature = functionService.getFunctionSignature(functionName)
    const documentation = functionService.getQuickHelp(functionName)

    // Show hover widget
    this.editor.trigger('keyboard', 'editor.action.showHover', {})
  }
}

// Export singleton instance
export const monacoIntelliSenseService = new MonacoIntelliSenseService()
