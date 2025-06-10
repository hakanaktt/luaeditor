// Theme Service for Monaco Editor
import * as monaco from 'monaco-editor'

export type MonacoTheme = 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'

export interface ThemeInfo {
  id: MonacoTheme
  name: string
  description: string
  isDark: boolean
}

export const AVAILABLE_THEMES: ThemeInfo[] = [
  {
    id: 'vs',
    name: 'Light',
    description: 'Visual Studio Light Theme',
    isDark: false
  },
  {
    id: 'vs-dark',
    name: 'Dark',
    description: 'Visual Studio Dark Theme',
    isDark: true
  },
  {
    id: 'hc-black',
    name: 'High Contrast Dark',
    description: 'High Contrast Black Theme',
    isDark: true
  },
  {
    id: 'hc-light',
    name: 'High Contrast Light',
    description: 'High Contrast Light Theme',
    isDark: false
  }
]

export interface TextStyleSettings {
  fontSize: number
  fontFamily: string
  lineHeight: number
  letterSpacing: number
}

export const DEFAULT_TEXT_STYLE: TextStyleSettings = {
  fontSize: 16,
  fontFamily: 'Consolas, "Courier New", Monaco, monospace',
  lineHeight: 1.6,
  letterSpacing: 0.5
}

export const FONT_FAMILIES = [
  'Consolas, "Courier New", Monaco, monospace',
  '"Fira Code", "Cascadia Code", monospace',
  '"JetBrains Mono", monospace',
  '"Source Code Pro", monospace',
  '"Ubuntu Mono", monospace',
  '"Roboto Mono", monospace',
  'Monaco, "Lucida Console", monospace'
]

class ThemeService {
  private currentTheme: MonacoTheme = 'vs-dark'
  private currentTextStyle: TextStyleSettings = { ...DEFAULT_TEXT_STYLE }
  private editors: Set<monaco.editor.IStandaloneCodeEditor> = new Set()

  constructor() {
    this.loadSettings()
  }

  // Theme management
  getCurrentTheme(): MonacoTheme {
    return this.currentTheme
  }

  setTheme(theme: MonacoTheme): void {
    this.currentTheme = theme
    monaco.editor.setTheme(theme)
    this.saveSettings()
    this.notifyThemeChange()
  }

  getThemeInfo(theme: MonacoTheme): ThemeInfo | undefined {
    return AVAILABLE_THEMES.find(t => t.id === theme)
  }

  // Text style management
  getCurrentTextStyle(): TextStyleSettings {
    return { ...this.currentTextStyle }
  }

  setTextStyle(style: Partial<TextStyleSettings>): void {
    this.currentTextStyle = { ...this.currentTextStyle, ...style }
    this.applyTextStyleToEditors()
    this.saveSettings()
  }

  setFontSize(fontSize: number): void {
    this.setTextStyle({ fontSize })
  }

  setFontFamily(fontFamily: string): void {
    this.setTextStyle({ fontFamily })
  }

  setLineHeight(lineHeight: number): void {
    this.setTextStyle({ lineHeight })
  }

  setLetterSpacing(letterSpacing: number): void {
    this.setTextStyle({ letterSpacing })
  }

  // Editor registration
  registerEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editors.add(editor)
    this.applyTextStyleToEditor(editor)
  }

  unregisterEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editors.delete(editor)
  }

  // Apply styles to editors
  private applyTextStyleToEditors(): void {
    this.editors.forEach(editor => {
      this.applyTextStyleToEditor(editor)
    })
  }

  private applyTextStyleToEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
    editor.updateOptions({
      fontSize: this.currentTextStyle.fontSize,
      fontFamily: this.currentTextStyle.fontFamily,
      lineHeight: this.currentTextStyle.lineHeight,
      letterSpacing: this.currentTextStyle.letterSpacing
    })
  }

  // Settings persistence
  private saveSettings(): void {
    const settings = {
      theme: this.currentTheme,
      textStyle: this.currentTextStyle
    }
    localStorage.setItem('monaco-theme-settings', JSON.stringify(settings))
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('monaco-theme-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        this.currentTheme = settings.theme || 'vs-dark'
        this.currentTextStyle = { ...DEFAULT_TEXT_STYLE, ...settings.textStyle }
      }
    } catch (error) {
      console.warn('Failed to load theme settings:', error)
    }
  }

  // Theme change notification
  private notifyThemeChange(): void {
    // Update CSS custom properties for theme-aware components
    const themeInfo = this.getThemeInfo(this.currentTheme)
    if (themeInfo) {
      document.documentElement.setAttribute('data-theme', themeInfo.isDark ? 'dark' : 'light')
    }
  }

  // Utility methods
  getNextTheme(): MonacoTheme {
    const currentIndex = AVAILABLE_THEMES.findIndex(t => t.id === this.currentTheme)
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length
    return AVAILABLE_THEMES[nextIndex].id
  }

  toggleTheme(): void {
    const nextTheme = this.getNextTheme()
    this.setTheme(nextTheme)
  }

  // Initialize theme on startup
  initialize(): void {
    monaco.editor.setTheme(this.currentTheme)
    this.notifyThemeChange()
  }
}

// Export singleton instance
export const themeService = new ThemeService()
