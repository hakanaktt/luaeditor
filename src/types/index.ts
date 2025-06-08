export interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  children?: FileItem[]
  isExpanded?: boolean
  isLoading?: boolean
  depth?: number
  parentPath?: string
}

export interface EditorSettings {
  fontSize: number
  theme: 'vs-dark' | 'vs-light'
  wordWrap: boolean
  minimap: boolean
}

export interface AdekoFunction {
  name: string
  description: string
  parameters: Parameter[]
  returnType: string
  returnDescription: string
  example: string
  category: string
  subcategory?: string
  tags: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
  usage?: string
  seeAlso?: string[]
}

export interface Parameter {
  name: string
  type: string
  description: string
  optional?: boolean
  defaultValue?: any
}

export interface MacroTemplate {
  name: string
  description: string
  code: string
  category: string
}

export interface AppSettings {
  model_library_path?: string
  language?: string
  sidebar_width?: number
}

// Function category structure for organizing functions
export interface FunctionCategory {
  name: string
  description: string
  icon: string
  subcategories?: FunctionSubcategory[]
}

export interface FunctionSubcategory {
  name: string
  description: string
  functions: string[] // function names
}

// IntelliSense suggestion
export interface IntelliSenseSuggestion {
  label: string
  kind: 'function' | 'variable' | 'keyword' | 'constant'
  detail: string
  documentation: string
  insertText: string
  filterText: string
  sortText: string
  range?: {
    startLineNumber: number
    endLineNumber: number
    startColumn: number
    endColumn: number
  }
}

// Function search and filtering
export interface FunctionFilter {
  category?: string
  subcategory?: string
  complexity?: 'basic' | 'intermediate' | 'advanced'
  tags?: string[]
  searchTerm?: string
}
