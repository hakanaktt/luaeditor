import type { 
  CNCTool, 
  CylindricalTool, 
  ConicalTool, 
  BallnoseTool, 
  RadialTool, 
  SpecialTool,
  DoorMachiningProfile,
  ToolOperation 
} from '@/types'

export class CNCToolService {
  private static instance: CNCToolService
  private tools: Map<string, CNCTool> = new Map()
  private machiningProfiles: Map<string, DoorMachiningProfile> = new Map()

  private constructor() {
    this.initializeDefaultTools()
    this.initializeDefaultProfiles()
  }

  public static getInstance(): CNCToolService {
    if (!CNCToolService.instance) {
      CNCToolService.instance = new CNCToolService()
    }
    return CNCToolService.instance
  }

  private initializeDefaultTools(): void {
    // Cylindrical tools for general machining
    const cylindrical3mm: CylindricalTool = {
      id: 'cyl-3mm',
      name: '3mm End Mill',
      shape: 'cylindrical',
      units: 'metric',
      diameter: 3,
      length: 40,
      flutes: 2,
      helixAngle: 30,
      description: 'Small end mill for fine detail work',
      material: 'Carbide',
      coating: 'TiN'
    }

    const cylindrical6mm: CylindricalTool = {
      id: 'cyl-6mm',
      name: '6mm End Mill',
      shape: 'cylindrical',
      units: 'metric',
      diameter: 6,
      length: 50,
      flutes: 2,
      helixAngle: 30,
      description: 'General purpose 2-flute end mill for roughing and finishing',
      material: 'HSS',
      coating: 'TiN'
    }

    const cylindrical10mm: CylindricalTool = {
      id: 'cyl-10mm',
      name: '10mm End Mill',
      shape: 'cylindrical',
      units: 'metric',
      diameter: 10,
      length: 60,
      flutes: 3,
      helixAngle: 35,
      description: 'Heavy-duty 3-flute end mill for material removal',
      material: 'Carbide',
      coating: 'TiAlN'
    }

    const cylindrical20mm: CylindricalTool = {
      id: 'cyl-20mm',
      name: '20mm End Mill',
      shape: 'cylindrical',
      units: 'metric',
      diameter: 20,
      length: 80,
      flutes: 4,
      helixAngle: 35,
      description: 'Large end mill for heavy material removal',
      material: 'Carbide',
      coating: 'TiAlN'
    }

    // Conical tools for V-grooves and chamfers
    const conical90deg: ConicalTool = {
      id: 'con-90deg',
      name: '90° V-Bit',
      shape: 'conical',
      units: 'metric',
      diameter: 20,
      length: 40,
      tipAngle: 90,
      tipDiameter: 0.2,
      flutes: 2,
      description: 'Sharp V-bit for precise grooves and chamfers',
      material: 'Carbide'
    }

    const conical60deg: ConicalTool = {
      id: 'con-60deg',
      name: '60° V-Bit',
      shape: 'conical',
      units: 'metric',
      diameter: 15,
      length: 35,
      tipAngle: 60,
      tipDiameter: 0.1,
      flutes: 2,
      description: 'Narrow angle V-bit for fine detail work',
      material: 'Carbide'
    }

    const conical45deg: ConicalTool = {
      id: 'con-45deg',
      name: '45° V-Bit',
      shape: 'conical',
      units: 'metric',
      diameter: 12,
      length: 30,
      tipAngle: 45,
      tipDiameter: 0.1,
      flutes: 2,
      description: '45° V-bit for decorative grooves',
      material: 'Carbide'
    }

    // Ballnose tools for 3D contouring
    const ballnose6mm: BallnoseTool = {
      id: 'ball-6mm',
      name: '6mm Ball End Mill',
      shape: 'ballnose',
      units: 'metric',
      diameter: 6,
      length: 50,
      ballRadius: 3,
      flutes: 2,
      helixAngle: 30,
      description: 'Ball end mill for 3D contouring and smooth finishes',
      material: 'Carbide',
      coating: 'TiAlN'
    }

    const ballnose3mm: BallnoseTool = {
      id: 'ball-3mm',
      name: '3mm Ball End Mill',
      shape: 'ballnose',
      units: 'metric',
      diameter: 3,
      length: 40,
      ballRadius: 1.5,
      flutes: 2,
      helixAngle: 30,
      description: 'Small ball end mill for fine detail work',
      material: 'Carbide'
    }

    // Radial tools for corner rounding
    const radial2mm: RadialTool = {
      id: 'rad-2mm',
      name: '2mm Corner Radius',
      shape: 'radial',
      units: 'metric',
      diameter: 8,
      length: 45,
      cornerRadius: 2,
      flutes: 2,
      helixAngle: 30,
      description: 'Corner rounding tool for edge finishing',
      material: 'Carbide'
    }

    // Special tools for custom operations
    const dovetail: SpecialTool = {
      id: 'special-dovetail',
      name: 'Dovetail Cutter',
      shape: 'special',
      units: 'metric',
      diameter: 12,
      length: 40,
      specialType: 'dovetail',
      customParameters: {
        angle: 14,
        neckDiameter: 6,
        cuttingLength: 15
      },
      description: 'Dovetail cutter for joinery work',
      material: 'Carbide'
    }

    // Add tools to the map
    this.tools.set(cylindrical3mm.id, cylindrical3mm)
    this.tools.set(cylindrical6mm.id, cylindrical6mm)
    this.tools.set(cylindrical10mm.id, cylindrical10mm)
    this.tools.set(cylindrical20mm.id, cylindrical20mm)
    this.tools.set(conical45deg.id, conical45deg)
    this.tools.set(conical60deg.id, conical60deg)
    this.tools.set(conical90deg.id, conical90deg)
    this.tools.set(ballnose3mm.id, ballnose3mm)
    this.tools.set(ballnose6mm.id, ballnose6mm)
    this.tools.set(radial2mm.id, radial2mm)
    this.tools.set(dovetail.id, dovetail)
  }

  private initializeDefaultProfiles(): void {
    // Standard door machining profile
    const standardDoorProfile: DoorMachiningProfile = {
      id: 'standard-door',
      name: 'Standard Door Profile',
      description: 'Basic door machining with top and bottom surface operations',
      topSurfaceOperations: [
        {
          toolId: 'cyl-10mm',
          operation: 'roughing',
          surface: 'top',
          depth: -5,
          feedRate: 1000,
          spindleSpeed: 12000,
          stepDown: 2,
          stepOver: 6
        },
        {
          toolId: 'cyl-6mm',
          operation: 'finishing',
          surface: 'top',
          depth: -5,
          feedRate: 800,
          spindleSpeed: 15000,
          stepDown: 1,
          stepOver: 3
        }
      ],
      bottomSurfaceOperations: [
        {
          toolId: 'cyl-10mm',
          operation: 'roughing',
          surface: 'bottom',
          depth: -5,
          feedRate: 1000,
          spindleSpeed: 12000,
          stepDown: 2,
          stepOver: 6
        },
        {
          toolId: 'ball-6mm',
          operation: 'finishing',
          surface: 'bottom',
          depth: -5,
          feedRate: 600,
          spindleSpeed: 18000,
          stepDown: 0.5,
          stepOver: 2
        }
      ],
      tools: Array.from(this.tools.values())
    }

    this.machiningProfiles.set(standardDoorProfile.id, standardDoorProfile)
  }

  // Tool management methods
  public getAllTools(): CNCTool[] {
    return Array.from(this.tools.values())
  }

  public getToolById(id: string): CNCTool | undefined {
    return this.tools.get(id)
  }

  public getToolsByShape(shape: string): CNCTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.shape === shape)
  }

  public addTool(tool: CNCTool): void {
    this.tools.set(tool.id, tool)
  }

  public removeTool(id: string): boolean {
    return this.tools.delete(id)
  }

  public updateTool(tool: CNCTool): void {
    this.tools.set(tool.id, tool)
  }

  // Machining profile methods
  public getAllProfiles(): DoorMachiningProfile[] {
    return Array.from(this.machiningProfiles.values())
  }

  public getProfileById(id: string): DoorMachiningProfile | undefined {
    return this.machiningProfiles.get(id)
  }

  public addProfile(profile: DoorMachiningProfile): void {
    this.machiningProfiles.set(profile.id, profile)
  }

  public removeProfile(id: string): boolean {
    return this.machiningProfiles.delete(id)
  }

  public updateProfile(profile: DoorMachiningProfile): void {
    this.machiningProfiles.set(profile.id, profile)
  }

  // Utility methods
  public getRecommendedToolsForOperation(operation: string, surface: string): CNCTool[] {
    const recommendations: Record<string, string[]> = {
      'roughing': ['cyl-10mm', 'cyl-6mm'],
      'finishing': ['cyl-6mm', 'ball-6mm', 'ball-3mm'],
      'profiling': ['con-90deg', 'con-60deg', 'rad-2mm'],
      'drilling': ['cyl-6mm', 'cyl-10mm'],
      'pocketing': ['cyl-10mm', 'cyl-6mm']
    }

    const toolIds = recommendations[operation] || []
    return toolIds.map(id => this.tools.get(id)).filter(Boolean) as CNCTool[]
  }

  public calculateMachiningTime(operations: ToolOperation[], materialVolume: number): number {
    // Simple estimation based on material removal rate
    let totalTime = 0

    operations.forEach(op => {
      const tool = this.getToolById(op.toolId)
      if (tool && op.feedRate) {
        // Simplified calculation: volume / (feed rate * tool diameter)
        const removalRate = op.feedRate * tool.diameter * (op.stepDown || 1)
        totalTime += materialVolume / removalRate
      }
    })

    return totalTime // in minutes
  }

  // Automatic tool detection from layer names
  public detectToolFromLayerName(layerName: string): CNCTool | null {
    if (!layerName) return null

    const layer = layerName.toLowerCase()

    // Pattern matching for different tool types based on layer naming conventions

    // Cylindrical tools (Freze)
    if (layer.includes('freze') || layer.includes('k_freze')) {
      const diameterMatch = layer.match(/(\d+)mm/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6
      return this.findToolByShapeAndDiameter('cylindrical', diameter)
    }

    // Ball nose tools (Ballnose)
    if (layer.includes('ballnose') || layer.includes('k_ballnose') || layer.includes('baliksırti') || layer.includes('baliksırti')) {
      const diameterMatch = layer.match(/(\d+)mm/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6
      return this.findToolByShapeAndDiameter('ballnose', diameter)
    }

    // Conical tools (V-bit, Acili)
    if (layer.includes('aciliv') || layer.includes('k_aciliv') || layer.includes('v_oyuk')) {
      const angleMatch = layer.match(/(\d+)/)
      const angle = angleMatch ? parseInt(angleMatch[1]) : 90
      return this.findToolByShapeAndAngle('conical', angle)
    }

    // Special operations
    if (layer.includes('cep_acma') || layer.includes('pocket')) {
      return this.findToolByShapeAndDiameter('cylindrical', 10) // Default to 10mm for pocketing
    }

    if (layer.includes('desen') || layer.includes('pattern')) {
      return this.findToolByShapeAndDiameter('ballnose', 3) // Small ball end mill for patterns
    }

    // Panel operations (general machining)
    if (layer.includes('panel')) {
      return this.findToolByShapeAndDiameter('cylindrical', 6)
    }

    // Default fallback
    return this.findToolByShapeAndDiameter('cylindrical', 6)
  }

  private findToolByShapeAndDiameter(shape: string, diameter: number): CNCTool | null {
    const tools = this.getToolsByShape(shape)

    // Find exact diameter match first
    let tool = tools.find(t => t.diameter === diameter)
    if (tool) return tool

    // Find closest diameter
    tool = tools.reduce((closest, current) => {
      if (!closest) return current
      const closestDiff = Math.abs(closest.diameter - diameter)
      const currentDiff = Math.abs(current.diameter - diameter)
      return currentDiff < closestDiff ? current : closest
    }, null as CNCTool | null)

    return tool
  }

  private findToolByShapeAndAngle(shape: string, angle: number): CNCTool | null {
    const tools = this.getToolsByShape(shape)

    // Find exact angle match for conical tools
    let tool = tools.find(t =>
      t.shape === 'conical' && (t as any).tipAngle === angle
    )
    if (tool) return tool

    // Find closest angle
    tool = tools.reduce((closest, current) => {
      if (current.shape !== 'conical') return closest
      if (!closest) return current

      const closestAngle = (closest as any).tipAngle || 90
      const currentAngle = (current as any).tipAngle || 90
      const closestDiff = Math.abs(closestAngle - angle)
      const currentDiff = Math.abs(currentAngle - angle)

      return currentDiff < closestDiff ? current : closest
    }, null as CNCTool | null)

    return tool
  }

  // Get tool information from layer name with detailed analysis
  public analyzeLayerForTool(layerName: string): {
    tool: CNCTool | null
    operation: string
    surface: string
    parameters: Record<string, any>
  } {
    const layer = layerName.toLowerCase()
    let operation = 'finishing'
    let surface = 'top'
    const parameters: Record<string, any> = {}

    // Determine surface from layer name
    if (layer.includes('_sf') || layer.includes('bottom')) {
      surface = 'bottom'
    }

    // Determine operation type
    if (layer.includes('roughing') || layer.includes('kaba')) {
      operation = 'roughing'
    } else if (layer.includes('finishing') || layer.includes('son')) {
      operation = 'finishing'
    } else if (layer.includes('cep') || layer.includes('pocket')) {
      operation = 'pocketing'
    } else if (layer.includes('drilling') || layer.includes('delme')) {
      operation = 'drilling'
    } else if (layer.includes('profile') || layer.includes('profil')) {
      operation = 'profiling'
    }

    // Extract parameters from layer name
    const diameterMatch = layer.match(/(\d+)mm/)
    if (diameterMatch) {
      parameters.diameter = parseInt(diameterMatch[1])
    }

    const angleMatch = layer.match(/(\d+)(?:deg|°)/)
    if (angleMatch) {
      parameters.angle = parseInt(angleMatch[1])
    }

    const tool = this.detectToolFromLayerName(layerName)

    return {
      tool,
      operation,
      surface,
      parameters
    }
  }
}

export const cncToolService = CNCToolService.getInstance()
