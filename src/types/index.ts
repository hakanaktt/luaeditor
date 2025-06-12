import * as THREE from 'three'

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
  theme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'
  wordWrap: boolean
  minimap: boolean
  fontFamily: string
  lineHeight: number
  letterSpacing: number
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

// Localized function definitions interface
export interface LocalizedAdekoFunction {
  name: string
  description: string
  parameters: LocalizedParameter[]
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

// Localized parameter interface
export interface LocalizedParameter {
  name: string
  type: string
  description: string
  optional?: boolean
  defaultValue?: any
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

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: string
  category: string
}

export interface ShortcutCategory {
  name: string
  shortcuts: KeyboardShortcut[]
}

// Multi-file editor types
export interface EditorFile {
  id: string
  path: string
  name: string
  content: string
  isModified: boolean
  isUntitled: boolean
  cursorLine: number
  cursorColumn: number
  scrollTop?: number
  scrollLeft?: number
}

export interface DiffEditorFile {
  id: string
  originalFile: EditorFile
  modifiedFile: EditorFile
  name: string // Display name for the diff tab
}

export interface EditorGroup {
  id: string
  activeFileId: string | null
  files: EditorFile[]
  isDiffMode?: boolean
  diffFile?: DiffEditorFile
}

export interface SplitLayout {
  groups: EditorGroup[]
  splitDirection: 'horizontal' | 'vertical' | null
  activeGroupId: string | null
}

// CNC Tool Definitions for Door Surface Machining
export type ToolShape = 'cylindrical' | 'conical' | 'ballnose' | 'radial' | 'special'

export interface BaseTool {
  id: string
  name: string
  shape: ToolShape
  units: 'metric' | 'imperial'
  diameter: number
  length: number
  description?: string
  material?: string
  coating?: string
  manufacturer?: string
  partNumber?: string
}

export interface CylindricalTool extends BaseTool {
  shape: 'cylindrical'
  flutes?: number
  helixAngle?: number
}

export interface ConicalTool extends BaseTool {
  shape: 'conical'
  tipAngle: number
  tipDiameter?: number
  flutes?: number
}

export interface BallnoseTool extends BaseTool {
  shape: 'ballnose'
  ballRadius: number
  flutes?: number
  helixAngle?: number
}

export interface RadialTool extends BaseTool {
  shape: 'radial'
  cornerRadius: number
  flutes?: number
  helixAngle?: number
}

export interface SpecialTool extends BaseTool {
  shape: 'special'
  customParameters: Record<string, any>
  profile?: string // SVG path or description
  specialType: string // e.g., 'dovetail', 'keyhole', 'custom'
}

export type CNCTool = CylindricalTool | ConicalTool | BallnoseTool | RadialTool | SpecialTool

export interface ToolOperation {
  toolId: string
  operation: 'roughing' | 'finishing' | 'profiling' | 'drilling' | 'pocketing'
  surface: 'top' | 'bottom' | 'both'
  feedRate?: number
  spindleSpeed?: number
  stepDown?: number
  stepOver?: number
  depth: number
}

export interface DoorMachiningProfile {
  id: string
  name: string
  description?: string
  topSurfaceOperations: ToolOperation[]
  bottomSurfaceOperations: ToolOperation[]
  tools: CNCTool[]
}

export interface DrawCommand {
  command_type: string
  x1: number
  y1: number
  x2: number
  y2: number
  radius: number
  color: string
  size: number
  text: string
  layer_name: string
  thickness?: number // Thickness/depth information for 3D operations
}

// Three.js tool geometry interfaces for CSG operations
export interface ToolGeometry {
  mesh: THREE.Mesh
  tool: CNCTool
  boundingBox: THREE.Box3
}

export interface CNCToolMesh {
  cylindrical: (tool: CylindricalTool, height?: number) => THREE.Mesh
  conical: (tool: ConicalTool, height?: number) => THREE.Mesh
  ballnose: (tool: BallnoseTool, height?: number) => THREE.Mesh
  radial: (tool: RadialTool, height?: number) => THREE.Mesh
  special: (tool: SpecialTool, height?: number) => THREE.Mesh
}
