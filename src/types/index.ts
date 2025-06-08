export interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  children?: FileItem[]
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
  example?: string
}

export interface Parameter {
  name: string
  type: string
  description: string
  optional?: boolean
}

export interface MacroTemplate {
  name: string
  description: string
  code: string
  category: string
}

export interface AppSettings {
  model_library_path?: string
}
