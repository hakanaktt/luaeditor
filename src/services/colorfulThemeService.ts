// Enhanced Colorful Theme Service for Monaco Editor
import * as monaco from 'monaco-editor'

export interface ColorfulThemeDefinition {
  id: string
  name: string
  description: string
  isDark: boolean
  colors: { [key: string]: string }
  tokenColors: { [key: string]: string }
}

// Custom colorful themes
export const COLORFUL_THEMES: ColorfulThemeDefinition[] = [
  {
    id: 'vibrant-dark',
    name: 'Vibrant Dark',
    description: 'A colorful dark theme with enhanced syntax highlighting',
    isDark: true,
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#ffffff',  // Force white text for visibility
      'editor.lineHighlightBackground': '#161b22',
      'editor.selectionBackground': '#264f78',
      'editorLineNumber.foreground': '#7d8590',
      'editorLineNumber.activeForeground': '#f0f6fc',
      'editorCursor.foreground': '#79c0ff',
      'editor.findMatchBackground': '#ffd33d44',
      'editor.findMatchHighlightBackground': '#ffd33d22',
      'editorBracketMatch.background': '#3fb95040',
      'editorBracketMatch.border': '#3fb950'
    },
    tokenColors: {
      'keyword': '#ff7b72',           // Bright red for keywords
      'string': '#a5d6ff',           // Light blue for strings
      'string.escape': '#79c0ff',    // Cyan for escape sequences
      'number': '#79c0ff',           // Cyan for numbers
      'comment': '#8b949e',          // Gray for comments
      'function': '#d2a8ff',         // Purple for functions
      'function.call': '#ffa657',    // Orange for function calls
      'variable': '#ffffff',         // Force white for variables
      'variable.local': '#7ee787',   // Green for local variables
      'operator': '#ff7b72',         // Red for operators
      'delimiter': '#ffffff',        // Force white for delimiters
      'identifier': '#ffffff',       // Force white for identifiers
      'type': '#ffa657',             // Orange for types
      'constant': '#79c0ff',         // Cyan for constants
      'adeko.function': '#f2cc60',   // Yellow for AdekoLib functions
      'lua.builtin': '#d2a8ff'       // Purple for Lua built-ins
    }
  },
  {
    id: 'vibrant-light',
    name: 'Vibrant Light',
    description: 'A colorful light theme with enhanced syntax highlighting',
    isDark: false,
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.selectionBackground': '#0969da33',
      'editorLineNumber.foreground': '#656d76',
      'editorLineNumber.activeForeground': '#24292f',
      'editorCursor.foreground': '#0969da',
      'editor.findMatchBackground': '#fff8c5',
      'editor.findMatchHighlightBackground': '#fff8c544',
      'editorBracketMatch.background': '#1f883d22',
      'editorBracketMatch.border': '#1f883d'
    },
    tokenColors: {
      'keyword': '#cf222e',           // Red for keywords
      'string': '#0a3069',           // Dark blue for strings
      'string.escape': '#0969da',    // Blue for escape sequences
      'number': '#0969da',           // Blue for numbers
      'comment': '#6e7781',          // Gray for comments
      'function': '#8250df',         // Purple for functions
      'function.call': '#d1242f',    // Red for function calls
      'variable': '#24292f',         // Black for variables
      'variable.local': '#1a7f37',   // Green for local variables
      'operator': '#cf222e',         // Red for operators
      'delimiter': '#24292f',        // Black for delimiters
      'identifier': '#24292f',       // Black for identifiers
      'type': '#d1242f',             // Red for types
      'constant': '#0969da',         // Blue for constants
      'adeko.function': '#bf8700',   // Orange for AdekoLib functions
      'lua.builtin': '#8250df'       // Purple for Lua built-ins
    }
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    description: 'A neon-inspired dark theme with glowing colors',
    isDark: true,
    colors: {
      'editor.background': '#0a0a0a',
      'editor.foreground': '#00ff41',
      'editor.lineHighlightBackground': '#1a1a1a',
      'editor.selectionBackground': '#ff006644',
      'editorLineNumber.foreground': '#666666',
      'editorLineNumber.activeForeground': '#00ff41',
      'editorCursor.foreground': '#ff0066',
      'editor.findMatchBackground': '#ffff0044',
      'editor.findMatchHighlightBackground': '#ffff0022',
      'editorBracketMatch.background': '#00ffff40',
      'editorBracketMatch.border': '#00ffff'
    },
    tokenColors: {
      'keyword': '#ff0066',           // Hot pink for keywords
      'string': '#00ffff',           // Cyan for strings
      'string.escape': '#ffff00',    // Yellow for escape sequences
      'number': '#ff6600',           // Orange for numbers
      'comment': '#666666',          // Dark gray for comments
      'function': '#9966ff',         // Purple for functions
      'function.call': '#ff3366',    // Pink for function calls
      'variable': '#00ff41',         // Green for variables
      'variable.local': '#66ff66',   // Light green for local variables
      'operator': '#ff0066',         // Hot pink for operators
      'delimiter': '#00ff41',        // Green for delimiters
      'identifier': '#00ff41',       // Green for identifiers
      'type': '#ff6600',             // Orange for types
      'constant': '#ffff00',         // Yellow for constants
      'adeko.function': '#ffcc00',   // Gold for AdekoLib functions
      'lua.builtin': '#cc66ff'       // Light purple for Lua built-ins
    }
  }
]

class ColorfulThemeService {
  private registeredThemes: Set<string> = new Set()

  constructor() {
    this.registerCustomThemes()
  }

  /**
   * Register all custom colorful themes with Monaco
   */
  private registerCustomThemes(): void {
    COLORFUL_THEMES.forEach(theme => {
      if (!this.registeredThemes.has(theme.id)) {
        this.registerTheme(theme)
        this.registeredThemes.add(theme.id)
      }
    })
  }

  /**
   * Register a single theme with Monaco
   */
  private registerTheme(theme: ColorfulThemeDefinition): void {
    try {
      const monacoTheme: monaco.editor.IStandaloneThemeData = {
        base: theme.isDark ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
          // Default text - use bright colors for visibility
          { token: '', foreground: theme.isDark ? 'ffffff' : '000000' },
          { token: 'identifier', foreground: theme.isDark ? 'ffffff' : '000000' },

          // Keywords - bright red
          { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },

          // Strings - bright blue
          { token: 'string', foreground: '79c0ff' },
          { token: 'string.invalid', foreground: 'ff0000' },

          // Numbers - bright cyan
          { token: 'number', foreground: '79c0ff', fontStyle: 'bold' },

          // Comments - gray italic
          { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },

          // Functions - bright yellow/gold
          { token: 'function', foreground: 'f2cc60', fontStyle: 'bold' },
          { token: 'function.builtin', foreground: 'd2a8ff', fontStyle: 'bold' },

          // Types (AdekoLib) - bright orange
          { token: 'type', foreground: 'ffa657', fontStyle: 'bold' },

          // Operators - bright red
          { token: 'operator', foreground: 'ff7b72', fontStyle: 'bold' },

          // Delimiters - white/black
          { token: 'delimiter', foreground: theme.isDark ? 'ffffff' : '000000' }
        ],
        colors: theme.colors
      }

      monaco.editor.defineTheme(theme.id, monacoTheme)
      console.log(`✅ Registered theme: ${theme.name} (${theme.id})`)
    } catch (error) {
      console.error(`❌ Failed to register theme ${theme.id}:`, error)
    }
  }

  /**
   * Remove # from color hex codes for Monaco
   */
  private stripHash(color: string): string {
    return color.startsWith('#') ? color.substring(1) : color
  }

  /**
   * Get all available colorful themes
   */
  getAvailableThemes(): ColorfulThemeDefinition[] {
    return [...COLORFUL_THEMES]
  }

  /**
   * Get theme by ID
   */
  getTheme(id: string): ColorfulThemeDefinition | undefined {
    return COLORFUL_THEMES.find(theme => theme.id === id)
  }

  /**
   * Apply a colorful theme
   */
  applyTheme(themeId: string): boolean {
    const theme = this.getTheme(themeId)
    if (theme) {
      // Ensure theme is registered before applying
      if (!this.registeredThemes.has(themeId)) {
        this.registerTheme(theme)
        this.registeredThemes.add(themeId)
      }
      monaco.editor.setTheme(themeId)
      console.log(`Applied colorful theme: ${theme.name}`)
      return true
    }
    console.warn(`Theme not found: ${themeId}`)
    return false
  }

  /**
   * Initialize and ensure all themes are registered
   */
  initialize(): void {
    this.registerCustomThemes()
    console.log('Colorful themes initialized:', Array.from(this.registeredThemes))
  }
}

// Export singleton instance
export const colorfulThemeService = new ColorfulThemeService()
