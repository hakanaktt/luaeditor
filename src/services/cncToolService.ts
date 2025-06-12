import type {
  CNCTool,
  CylindricalTool,
  ConicalTool,
  BallnoseTool,
  RadialTool,
  SpecialTool,
  DoorMachiningProfile,
  ToolOperation,
  ToolGeometry
} from '@/types'
import * as THREE from 'three'

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

    // Check for prohibited layers first
    if (this.isProhibitedLayer(layerName)) {
      return null
    }

    // Check for generic layers that should be prohibited
    if (this.isGenericLayer(layerName)) {
      return null
    }

    // Simple numeric patterns (20MM, 30MM, 5MM)
    const simpleNumericMatch = layer.match(/^(\d+)mm$/i)
    if (simpleNumericMatch) {
      const diameter = parseInt(simpleNumericMatch[1])
      return this.findToolByShapeAndDiameter('cylindrical', diameter)
    }

    // Cylindrical tools (Freze) - Enhanced patterns
    if (layer.includes('freze') || layer.includes('k_freze') ||
        layer.includes('roughing') || layer.includes('finishing')) {
      const diameterMatch = layer.match(/(\d+)mm/) || layer.match(/freze(\d+)/) || layer.match(/(\d+)mmfreze/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6
      return this.findToolByShapeAndDiameter('cylindrical', diameter)
    }

    // Ball nose tools (Ballnose) - Enhanced patterns
    if (layer.includes('ballnose') || layer.includes('k_ballnose')) {
      const diameterMatch = layer.match(/(\d+)mm/) || layer.match(/ballnose[_]?(\d+)/) || layer.match(/(\d+)/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6
      return this.findToolByShapeAndDiameter('ballnose', diameter)
    }

    // Special ballnose variants (K_BalikSirti, K_Desen)
    if (layer.includes('baliksırti') || layer.includes('baliksırti') ||
        layer.includes('balıksırtı') || layer.includes('k_baliksırti')) {
      const diameterMatch = layer.match(/(\d+)/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6
      return this.findToolByShapeAndDiameter('special', diameter) // Special tool as per feedback
    }

    if (layer.includes('k_desen') || layer.includes('desen')) {
      const diameterMatch = layer.match(/(\d+)/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 3
      return this.findToolByShapeAndDiameter('ballnose', diameter)
    }

    // Conical tools (V-bit, Acili) - Enhanced patterns
    if (layer.includes('aciliv') && layer.match(/\d+/)) { // Only if has specific angle
      const angleMatch = layer.match(/aciliv(\d+)/)
      if (angleMatch) {
        const angle = parseInt(angleMatch[1])
        return this.findToolByShapeAndAngle('conical', angle)
      }
    }

    if (layer.includes('vgroove') || layer.includes('v_oyuk45')) { // Specific V-groove patterns
      const angleMatch = layer.match(/(\d+)deg/) || layer.match(/v_oyuk(\d+)/)
      const angle = angleMatch ? parseInt(angleMatch[1]) : 90
      return this.findToolByShapeAndAngle('conical', angle)
    }

    // Special operations
    if (layer.includes('cep_acma') || layer.includes('cep') || layer.includes('pocket')) {
      return this.findToolByShapeAndDiameter('cylindrical', 10)
    }

    // Panel operations
    if (layer.includes('panel')) {
      return this.findToolByShapeAndDiameter('cylindrical', 6)
    }

    // Kanal operations
    if (layer.includes('k_kanal') || layer.includes('kanal')) {
      return this.findToolByShapeAndDiameter('cylindrical', 6)
    }

    // Form tools and special operations
    if (layer.includes('form') || layer.includes('k_form') || layer.includes('jnotch')) {
      return this.findToolByShapeAndDiameter('special', 6)
    }

    // Line/drawing operations
    if (layer.includes('cizgi') || layer.includes('line')) {
      return this.findToolByShapeAndDiameter('cylindrical', 3)
    }

    // Edge profiling - corrected radius interpretation
    if (layer.includes('edge') && layer.includes('radius')) {
      const radiusMatch = layer.match(/(\d+)mm/)
      const radius = radiusMatch ? parseInt(radiusMatch[1]) : 2
      return this.findToolByShapeAndDiameter('radial', radius) // Use radius directly as per feedback
    }

    // Oyuk30 special case - should be cylindrical for pocketing
    if (layer.includes('oyuk') && layer.match(/\d+/)) {
      const diameterMatch = layer.match(/(\d+)/)
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 30
      return this.findToolByShapeAndDiameter('cylindrical', diameter)
    }

    // Dovetail special case
    if (layer.includes('dovetail')) {
      return this.findToolByShapeAndDiameter('special', 10)
    }

    // Default fallback
    return this.findToolByShapeAndDiameter('cylindrical', 6)
  }

  // Check if layer should be prohibited from tool detection
  private isProhibitedLayer(layerName: string): boolean {
    const prohibitedPatterns = [
      'CLEANCORNERS', 'CLEANUP', 'DEEPEND', 'DEEPFRAME', 'THINFRAME',
      'V120PENCERE', 'VIOLIN', '_TN_', 'V120', 'V45'
    ]

    return prohibitedPatterns.some(pattern =>
      layerName.toUpperCase().includes(pattern.toUpperCase())
    )
  }

  // Check if layer is generic and should be prohibited
  private isGenericLayer(layerName: string): boolean {
    const genericPatterns = [
      'K_AciliV', 'V_Oyuk', 'K_toolType', 'AciliV120'
    ]

    // Generic layers are those without specific parameters
    return genericPatterns.some(pattern =>
      layerName === pattern
    )
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
    }, undefined as CNCTool | undefined)

    return tool || null
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
    }, undefined as CNCTool | undefined)

    return tool || null
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

  // Three.js tool geometry generation methods for CSG operations
  public createToolGeometry(tool: CNCTool, height: number = 50): ToolGeometry {
    let mesh: THREE.Mesh

    switch (tool.shape) {
      case 'cylindrical':
        mesh = this.createCylindricalToolMesh(tool as CylindricalTool, height)
        break
      case 'conical':
        mesh = this.createConicalToolMesh(tool as ConicalTool, height)
        break
      case 'ballnose':
        mesh = this.createBallnoseToolMesh(tool as BallnoseTool, height)
        break
      case 'radial':
        mesh = this.createRadialToolMesh(tool as RadialTool, height)
        break
      case 'special':
        mesh = this.createSpecialToolMesh(tool as SpecialTool, height)
        break
      default:
        mesh = this.createCylindricalToolMesh(tool as CylindricalTool, height)
    }

    const boundingBox = new THREE.Box3().setFromObject(mesh)

    return {
      mesh,
      tool,
      boundingBox
    }
  }

  private createCylindricalToolMesh(tool: CylindricalTool, height: number): THREE.Mesh {
    const radius = tool.diameter / 2
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32)
    const material = new THREE.MeshLambertMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.7
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'cylindrical' }
    return mesh
  }

  private createConicalToolMesh(tool: ConicalTool, height: number): THREE.Mesh {
    const topRadius = tool.diameter / 2
    const tipRadius = (tool.tipDiameter || 0.1) / 2
    const geometry = new THREE.CylinderGeometry(tipRadius, topRadius, height, 32)
    const material = new THREE.MeshLambertMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.7
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'conical' }
    return mesh
  }

  private createBallnoseToolMesh(tool: BallnoseTool, height: number): THREE.Mesh {
    const radius = tool.diameter / 2
    const ballRadius = tool.ballRadius

    // Create cylinder for shaft
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height - ballRadius, 32)
    const cylinderMaterial = new THREE.MeshLambertMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0.7
    })
    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinderMesh.position.y = ballRadius / 2

    // Create sphere for ball end
    const sphereGeometry = new THREE.SphereGeometry(ballRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0.7
    })
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphereMesh.position.y = -(height - ballRadius) / 2

    // Combine into group
    const group = new THREE.Group()
    group.add(cylinderMesh)
    group.add(sphereMesh)

    // Convert group to mesh for consistency
    const combinedGeometry = new THREE.BufferGeometry()
    const material = new THREE.MeshLambertMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0.7
    })

    const mesh = new THREE.Mesh(combinedGeometry, material)
    mesh.userData = { tool, toolType: 'ballnose' }
    return mesh
  }

  private createRadialToolMesh(tool: RadialTool, height: number): THREE.Mesh {
    const radius = tool.diameter / 2
    const cornerRadius = tool.cornerRadius

    // Simplified as cylinder with rounded edges (complex geometry would need custom shape)
    const geometry = new THREE.CylinderGeometry(radius - cornerRadius, radius, height, 32)
    const material = new THREE.MeshLambertMaterial({
      color: 0x777777,
      transparent: true,
      opacity: 0.7
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'radial' }
    return mesh
  }

  private createSpecialToolMesh(tool: SpecialTool, height: number): THREE.Mesh {
    // Default to cylindrical shape for special tools
    const radius = tool.diameter / 2
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32)
    const material = new THREE.MeshLambertMaterial({
      color: 0x555555,
      transparent: true,
      opacity: 0.7
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'special' }
    return mesh
  }

  // Create tool path geometry from draw commands
  public createToolPathFromCommands(commands: any[], tool: CNCTool, thickness: number = 5): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = []
    const toolGeometry = this.createToolGeometry(tool, thickness)

    commands.forEach((command, index) => {
      if (command.command_type === 'line' || command.command_type === 'rectangle' || command.command_type === 'circle') {
        const toolMesh = toolGeometry.mesh.clone()

        // Position tool based on command coordinates
        if (command.command_type === 'line') {
          const midX = (command.x1 + command.x2) / 2
          const midY = (command.y1 + command.y2) / 2
          toolMesh.position.set(midX, 0, midY)
        } else if (command.command_type === 'rectangle') {
          const centerX = (command.x1 + command.x2) / 2
          const centerY = (command.y1 + command.y2) / 2
          toolMesh.position.set(centerX, 0, centerY)
        } else if (command.command_type === 'circle') {
          toolMesh.position.set(command.x1, 0, command.y1)
        }

        // Set depth based on thickness or command thickness
        const depth = command.thickness || thickness
        toolMesh.position.y = -depth / 2

        toolMesh.userData = {
          command,
          tool,
          index,
          operation: 'subtract' // Default to subtraction for CNC operations
        }

        meshes.push(toolMesh)
      }
    })

    return meshes
  }

  // Test method to verify tool geometry creation
  public testToolCreation(): void {
    console.log('Testing CNC tool geometry creation...')

    const testTools = [
      this.getToolById('cyl-6mm'),
      this.getToolById('con-90deg'),
      this.getToolById('ball-6mm')
    ]

    testTools.forEach(tool => {
      if (tool) {
        try {
          const geometry = this.createToolGeometry(tool, 10)
          console.log(`✓ Successfully created geometry for ${tool.name}:`, {
            toolType: tool.shape,
            diameter: tool.diameter,
            boundingBox: geometry.boundingBox
          })
        } catch (error) {
          console.error(`✗ Failed to create geometry for ${tool.name}:`, error)
        }
      }
    })
  }
}

export const cncToolService = CNCToolService.getInstance()
