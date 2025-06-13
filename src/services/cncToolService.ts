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
  public getRecommendedToolsForOperation(operation: string, _surface: string = 'top'): CNCTool[] {
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

  // Enhanced tool mesh creation for CSG operations
  public createCSGToolMesh(tool: CNCTool, _operation: string, depth: number = 5, _stepDown: number = 1): THREE.Mesh {
    const segments = Math.max(16, Math.min(64, tool.diameter * 4)) // Adaptive segment count

    switch (tool.shape) {
      case 'cylindrical':
        return this.createCSGCylindricalMesh(tool as CylindricalTool, depth, segments)
      case 'conical':
        return this.createCSGConicalMesh(tool as ConicalTool, depth, segments)
      case 'ballnose':
        return this.createCSGBallnoseMesh(tool as BallnoseTool, depth, segments)
      case 'radial':
        return this.createCSGRadialMesh(tool as RadialTool, depth, segments)
      case 'special':
        return this.createCSGSpecialMesh(tool as SpecialTool, depth, segments)
      default:
        return this.createCSGCylindricalMesh(tool as CylindricalTool, depth, segments)
    }
  }

  // Create tool sweep mesh along a path for realistic material removal
  public createToolSweepMesh(tool: CNCTool, path: THREE.Vector3[], operation: string): THREE.Mesh {
    const toolProfile = this.getToolProfile(tool)
    const sweepGeometry = this.createSweepGeometry(toolProfile, path)

    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor(tool.shape),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(sweepGeometry, material)
    mesh.userData = {
      tool,
      operation,
      toolType: 'sweep',
      isCSGTool: true
    }

    return mesh
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

  // CSG-specific tool mesh creation methods
  private createCSGCylindricalMesh(tool: CylindricalTool, depth: number, segments: number): THREE.Mesh {
    const radius = tool.diameter / 2
    const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor('cylindrical'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'cylindrical', isCSGTool: true }
    return mesh
  }

  private createCSGConicalMesh(tool: ConicalTool, depth: number, segments: number): THREE.Mesh {
    const topRadius = tool.diameter / 2
    const tipRadius = (tool.tipDiameter || 0.1) / 2

    // Calculate bottom radius based on depth and tip angle
    const halfAngle = (tool.tipAngle * Math.PI) / 360 // Convert to radians and half angle
    const bottomRadius = Math.max(tipRadius, topRadius - (depth * Math.tan(halfAngle)))

    const geometry = new THREE.CylinderGeometry(bottomRadius, topRadius, depth, segments)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor('conical'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'conical', isCSGTool: true }
    return mesh
  }

  private createCSGBallnoseMesh(tool: BallnoseTool, depth: number, segments: number): THREE.Mesh {
    const radius = tool.diameter / 2
    const ballRadius = tool.ballRadius

    // Create compound geometry: cylinder + hemisphere
    const cylinderHeight = Math.max(0, depth - ballRadius)
    const group = new THREE.Group()

    // Add cylinder part if needed
    if (cylinderHeight > 0) {
      const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, segments)
      const cylinderMesh = new THREE.Mesh(cylinderGeometry, new THREE.MeshLambertMaterial({
        color: this.getToolColor('ballnose'),
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      }))
      cylinderMesh.position.y = ballRadius / 2
      group.add(cylinderMesh)
    }

    // Add ball end
    const sphereGeometry = new THREE.SphereGeometry(ballRadius, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI / 2)
    const sphereMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshLambertMaterial({
      color: this.getToolColor('ballnose'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    }))
    sphereMesh.position.y = -(depth - ballRadius) / 2
    group.add(sphereMesh)

    // Convert group to single mesh for CSG operations
    const combinedGeometry = this.mergeGroupGeometries(group)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor('ballnose'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(combinedGeometry, material)
    mesh.userData = { tool, toolType: 'ballnose', isCSGTool: true }
    return mesh
  }

  private createCSGRadialMesh(tool: RadialTool, depth: number, segments: number): THREE.Mesh {
    const radius = tool.diameter / 2
    const cornerRadius = tool.cornerRadius

    // Create cylinder with rounded bottom edge (simplified)
    const geometry = new THREE.CylinderGeometry(radius - cornerRadius, radius, depth, segments)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor('radial'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'radial', isCSGTool: true }
    return mesh
  }

  private createCSGSpecialMesh(tool: SpecialTool, depth: number, segments: number): THREE.Mesh {
    // For special tools, check if there's a custom profile
    if (tool.profile && tool.specialType === 'custom') {
      return this.createCustomProfileMesh(tool, depth, segments)
    }

    // Default to cylindrical for unknown special tools
    const radius = tool.diameter / 2
    const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor('special'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'special', isCSGTool: true }
    return mesh
  }

  // Helper methods for tool mesh creation
  private getToolColor(shape: string): number {
    const colors = {
      cylindrical: 0x888888,
      conical: 0x666666,
      ballnose: 0x999999,
      radial: 0x777777,
      special: 0x555555
    }
    return colors[shape as keyof typeof colors] || 0x888888
  }

  private mergeGroupGeometries(group: THREE.Group): THREE.BufferGeometry {
    const geometries: THREE.BufferGeometry[] = []

    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry.clone()
        geometry.applyMatrix4(child.matrixWorld)
        geometries.push(geometry)
      }
    })

    if (geometries.length === 0) {
      return new THREE.CylinderGeometry(1, 1, 1, 8)
    }

    if (geometries.length === 1) {
      return geometries[0]
    }

    // Merge multiple geometries
    const mergedGeometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []

    geometries.forEach(geometry => {
      const positionAttribute = geometry.getAttribute('position')
      const normalAttribute = geometry.getAttribute('normal')
      const uvAttribute = geometry.getAttribute('uv')

      if (positionAttribute) {
        positions.push(...Array.from(positionAttribute.array))
      }
      if (normalAttribute) {
        normals.push(...Array.from(normalAttribute.array))
      }
      if (uvAttribute) {
        uvs.push(...Array.from(uvAttribute.array))
      }
    })

    mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    if (normals.length > 0) {
      mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    }
    if (uvs.length > 0) {
      mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    }

    mergedGeometry.computeBoundingBox()
    mergedGeometry.computeBoundingSphere()

    return mergedGeometry
  }

  private createCustomProfileMesh(tool: SpecialTool, depth: number, segments: number): THREE.Mesh {
    // For now, default to cylindrical - can be enhanced later with SVG path parsing
    const radius = tool.diameter / 2
    const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor('special'),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { tool, toolType: 'custom', isCSGTool: true }
    return mesh
  }

  private getToolProfile(tool: CNCTool): THREE.Shape {
    const radius = tool.diameter / 2
    const shape = new THREE.Shape()

    switch (tool.shape) {
      case 'cylindrical':
        // Rectangular profile for cylindrical tools
        shape.moveTo(-radius, 0)
        shape.lineTo(radius, 0)
        shape.lineTo(radius, -radius * 0.1) // Small chamfer
        shape.lineTo(-radius, -radius * 0.1)
        shape.closePath()
        break

      case 'conical':
        const conicalTool = tool as ConicalTool
        const tipRadius = (conicalTool.tipDiameter || 0.1) / 2
        shape.moveTo(-tipRadius, 0)
        shape.lineTo(tipRadius, 0)
        shape.lineTo(radius, -radius)
        shape.lineTo(-radius, -radius)
        shape.closePath()
        break

      case 'ballnose':
        const ballTool = tool as BallnoseTool
        const ballRadius = ballTool.ballRadius
        // Simplified ball profile
        shape.moveTo(-radius, 0)
        shape.lineTo(radius, 0)
        shape.quadraticCurveTo(radius, -ballRadius / 2, 0, -ballRadius)
        shape.quadraticCurveTo(-radius, -ballRadius / 2, -radius, 0)
        break

      default:
        // Default cylindrical profile
        shape.moveTo(-radius, 0)
        shape.lineTo(radius, 0)
        shape.lineTo(radius, -radius * 0.1)
        shape.lineTo(-radius, -radius * 0.1)
        shape.closePath()
    }

    return shape
  }

  private createSweepGeometry(profile: THREE.Shape, path: THREE.Vector3[]): THREE.BufferGeometry {
    if (path.length < 2) {
      // Fallback to simple extrusion
      const extrudeSettings = {
        depth: 10,
        bevelEnabled: false
      }
      return new THREE.ExtrudeGeometry(profile, extrudeSettings)
    }

    // Create curve from path points
    const curve = new THREE.CatmullRomCurve3(path)

    // Create tube geometry along the curve
    const tubeGeometry = new THREE.TubeGeometry(curve, path.length * 2, profile.getPoints().length, 8, false)

    return tubeGeometry
  }

  // Create tool path geometry from draw commands
  public createToolPathFromCommands(commands: any[], tool: CNCTool, thickness: number = 5): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = []
    const toolGeometry = this.createToolGeometry(tool, thickness)

    commands.forEach((command, index) => {
      if (command.command_type === 'line' || command.command_type === 'rectangle' || command.command_type === 'circle') {
        const toolMesh = toolGeometry.mesh.clone()

        // Position tool based on command coordinates (use 3D converted coordinates if available)
        if (command.command_type === 'line') {
          const midX = command.x1_3d !== undefined ? (command.x1_3d + command.x2_3d) / 2 : (command.x1 + command.x2) / 2
          const midY = command.y1_3d !== undefined ? (command.y1_3d + command.y2_3d) / 2 : (command.y1 + command.y2) / 2
          // Position on the door surface (Y=0 for center, adjust for surface contact)
          const surfaceY = command.isBottomFace ? -thickness/2 : thickness/2  // Position on door surface
          toolMesh.position.set(midX, surfaceY, midY)
          console.log(`🔧 Positioned line tool at (${midX.toFixed(1)}, ${surfaceY}, ${midY.toFixed(1)}) - ${command.isBottomFace ? 'Bottom' : 'Top'} face`)
        } else if (command.command_type === 'rectangle') {
          const centerX = command.x1_3d !== undefined ? (command.x1_3d + command.x2_3d) / 2 : (command.x1 + command.x2) / 2
          const centerY = command.y1_3d !== undefined ? (command.y1_3d + command.y2_3d) / 2 : (command.y1 + command.y2) / 2
          const surfaceY = command.isBottomFace ? -thickness/2 : thickness/2
          toolMesh.position.set(centerX, surfaceY, centerY)
          console.log(`🔧 Positioned rectangle tool at (${centerX.toFixed(1)}, ${surfaceY}, ${centerY.toFixed(1)}) - ${command.isBottomFace ? 'Bottom' : 'Top'} face`)
        } else if (command.command_type === 'circle') {
          const centerX = command.x1_3d !== undefined ? command.x1_3d : command.x1
          const centerY = command.y1_3d !== undefined ? command.y1_3d : command.y1
          const surfaceY = command.isBottomFace ? -thickness/2 : thickness/2
          toolMesh.position.set(centerX, surfaceY, centerY)
          console.log(`🔧 Positioned circle tool at (${centerX.toFixed(1)}, ${surfaceY}, ${centerY.toFixed(1)}) - ${command.isBottomFace ? 'Bottom' : 'Top'} face`)
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

  // Enhanced tool path creation with operation-specific meshes
  public createOperationToolMeshes(commands: any[], tool: CNCTool, operation: string, depth: number = 5): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = []

    commands.forEach((command, index) => {
      let toolMesh: THREE.Mesh | null = null

      switch (command.command_type) {
        case 'line':
          toolMesh = this.createLineToolMesh(command, tool, operation, depth)
          break
        case 'rectangle':
          toolMesh = this.createRectangleToolMesh(command, tool, operation, depth)
          break
        case 'circle':
          toolMesh = this.createCircleToolMesh(command, tool, operation, depth)
          break
        case 'arc':
          toolMesh = this.createArcToolMesh(command, tool, operation, depth)
          break
        default:
          return // Skip unsupported command types
      }

      if (toolMesh) {
        toolMesh.userData = {
          command,
          tool,
          operation,
          index,
          isOperationMesh: true
        }

        meshes.push(toolMesh)
      }
    })

    return meshes
  }

  // Create tool mesh for line operations
  private createLineToolMesh(command: any, tool: CNCTool, operation: string, depth: number): THREE.Mesh {
    // Use 3D coordinates if available, otherwise fall back to 2D
    const x1 = command.x1_3d !== undefined ? command.x1_3d : command.x1
    const y1 = command.y1_3d !== undefined ? command.y1_3d : command.y1
    const x2 = command.x2_3d !== undefined ? command.x2_3d : command.x2
    const y2 = command.y2_3d !== undefined ? command.y2_3d : command.y2

    const startPoint = new THREE.Vector3(x1, 0, y1)
    const endPoint = new THREE.Vector3(x2, 0, y2)
    const path = [startPoint, endPoint]

    // For line operations, create a swept tool mesh
    if (operation === 'profiling' || operation === 'finishing') {
      return this.createToolSweepMesh(tool, path, operation)
    }

    // For other operations, use CSG tool mesh positioned at line center
    const toolMesh = this.createCSGToolMesh(tool, operation, depth)
    const midX = (x1 + x2) / 2
    const midZ = (y1 + y2) / 2
    // Position tool to intersect with door surface (door is at Y = -9, surface at Y = 0)
    const surfaceY = command.isBottomFace ? -depth / 2 - 9 : -depth / 2
    toolMesh.position.set(midX, surfaceY, midZ)

    // Rotate tool to align with line direction
    const direction = endPoint.clone().sub(startPoint).normalize()
    const angle = Math.atan2(direction.x, direction.z)
    toolMesh.rotation.y = angle

    return toolMesh
  }

  // Create tool mesh for rectangle operations
  private createRectangleToolMesh(command: any, tool: CNCTool, operation: string, depth: number): THREE.Mesh {
    // Use 3D coordinates if available, otherwise fall back to 2D
    const x1 = command.x1_3d !== undefined ? command.x1_3d : command.x1
    const y1 = command.y1_3d !== undefined ? command.y1_3d : command.y1
    const x2 = command.x2_3d !== undefined ? command.x2_3d : command.x2
    const y2 = command.y2_3d !== undefined ? command.y2_3d : command.y2

    const centerX = (x1 + x2) / 2
    const centerZ = (y1 + y2) / 2
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    if (operation === 'pocketing') {
      // For pocketing, create a mesh that covers the entire rectangle
      return this.createPocketingMesh(tool, width, height, depth, centerX, centerZ)
    }

    // For other operations, use standard tool mesh
    const toolMesh = this.createCSGToolMesh(tool, operation, depth)
    // Position tool to intersect with door surface (door is at Y = -9, surface at Y = 0)
    const surfaceY = command.isBottomFace ? -depth / 2 - 9 : -depth / 2
    toolMesh.position.set(centerX, surfaceY, centerZ)
    return toolMesh
  }

  // Create tool mesh for circle operations
  private createCircleToolMesh(command: any, tool: CNCTool, operation: string, depth: number): THREE.Mesh {
    // Use 3D coordinates if available, otherwise fall back to 2D
    const centerX = command.x1_3d !== undefined ? command.x1_3d : command.x1
    const centerZ = command.y1_3d !== undefined ? command.y1_3d : command.y1
    const radius = command.radius

    if (operation === 'drilling') {
      // For drilling, create a cylindrical mesh at the circle center
      const drillMesh = this.createCSGToolMesh(tool, operation, depth)
      // Position tool to intersect with door surface (door is at Y = -9, surface at Y = 0)
      const surfaceY = command.isBottomFace ? -depth / 2 - 9 : -depth / 2
      drillMesh.position.set(centerX, surfaceY, centerZ)
      return drillMesh
    }

    if (operation === 'pocketing') {
      // For circular pocketing, create a cylindrical pocket
      return this.createCircularPocketMesh(tool, radius, depth, centerX, centerZ)
    }

    // For profiling, create a torus-like mesh following the circle
    return this.createCircularProfileMesh(tool, radius, depth, centerX, centerZ)
  }

  // Create tool mesh for arc operations
  private createArcToolMesh(command: any, tool: CNCTool, operation: string, depth: number): THREE.Mesh {
    const centerX = command.x1
    const centerY = command.y1
    const radius = command.radius

    // For arcs, create a swept tool mesh along the arc path
    const arcPath = this.generateArcPath(centerX, centerY, radius, command.startAngle || 0, command.endAngle || Math.PI)

    if (operation === 'profiling' || operation === 'finishing') {
      return this.createToolSweepMesh(tool, arcPath, operation)
    }

    // For other operations, use tool mesh at arc center
    const toolMesh = this.createCSGToolMesh(tool, operation, depth)
    toolMesh.position.set(centerX, -depth / 2, centerY)
    return toolMesh
  }

  // Create pocketing mesh for rectangular areas
  private createPocketingMesh(tool: CNCTool, width: number, height: number, depth: number, centerX: number, centerZ: number): THREE.Mesh {
    // Create a box geometry that represents the material to be removed
    const geometry = new THREE.BoxGeometry(width, depth, height)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor(tool.shape),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(centerX, -depth / 2, centerZ)
    mesh.userData = { tool, toolType: 'pocketing', isCSGTool: true }
    return mesh
  }

  // Create circular pocket mesh
  private createCircularPocketMesh(tool: CNCTool, radius: number, depth: number, centerX: number, centerZ: number): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(radius, radius, depth, 32)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor(tool.shape),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(centerX, -depth / 2, centerZ)
    mesh.userData = { tool, toolType: 'circular-pocket', isCSGTool: true }
    return mesh
  }

  // Create circular profile mesh (torus-like for profiling operations)
  private createCircularProfileMesh(tool: CNCTool, radius: number, depth: number, centerX: number, centerZ: number): THREE.Mesh {
    const toolRadius = tool.diameter / 2
    const geometry = new THREE.TorusGeometry(radius, toolRadius, 8, 32)
    const material = new THREE.MeshLambertMaterial({
      color: this.getToolColor(tool.shape),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(centerX, -depth / 2, centerZ)
    mesh.rotation.x = Math.PI / 2 // Rotate to lie flat
    mesh.userData = { tool, toolType: 'circular-profile', isCSGTool: true }
    return mesh
  }

  // Generate path points for arc operations
  private generateArcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = []
    const segments = Math.max(8, Math.floor(Math.abs(endAngle - startAngle) * radius / 5)) // Adaptive segments

    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments)
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      points.push(new THREE.Vector3(x, 0, y))
    }

    return points
  }

  // Tool mesh caching for performance optimization
  private toolMeshCache = new Map<string, THREE.Mesh>()

  public getCachedToolMesh(tool: CNCTool, operation: string, depth: number): THREE.Mesh | null {
    const cacheKey = `${tool.id}-${operation}-${depth}-${tool.diameter}`
    return this.toolMeshCache.get(cacheKey) || null
  }

  public cacheToolMesh(tool: CNCTool, operation: string, depth: number, mesh: THREE.Mesh): void {
    const cacheKey = `${tool.id}-${operation}-${depth}-${tool.diameter}`
    this.toolMeshCache.set(cacheKey, mesh.clone())
  }

  public clearToolMeshCache(): void {
    this.toolMeshCache.clear()
  }

  // Batch tool mesh creation for multiple operations
  public createBatchToolMeshes(operations: Array<{
    commands: any[]
    tool: CNCTool
    operation: string
    depth: number
  }>): THREE.Mesh[] {
    const allMeshes: THREE.Mesh[] = []

    operations.forEach(({ commands, tool, operation, depth }) => {
      const meshes = this.createOperationToolMeshes(commands, tool, operation, depth)
      allMeshes.push(...meshes)
    })

    return allMeshes
  }

  // Create optimized tool mesh for CSG operations with reduced geometry complexity
  public createOptimizedCSGMesh(tool: CNCTool, operation: string, depth: number, lodLevel: number = 1): THREE.Mesh {
    const cachedMesh = this.getCachedToolMesh(tool, operation, depth)
    if (cachedMesh) {
      return cachedMesh.clone()
    }

    // Create mesh with LOD consideration (could be enhanced to use different geometries based on lodLevel)
    const mesh = this.createCSGToolMesh(tool, operation, depth)

    // Apply LOD optimizations if needed
    if (lodLevel < 1) {
      this.optimizeMeshForLOD(mesh, lodLevel)
    }

    this.cacheToolMesh(tool, operation, depth, mesh)

    return mesh
  }

  // Optimize mesh geometry for lower LOD levels
  private optimizeMeshForLOD(mesh: THREE.Mesh, lodLevel: number): void {
    if (lodLevel >= 1) return

    const geometry = mesh.geometry
    if (geometry instanceof THREE.BufferGeometry) {
      // Reduce vertex count for lower LOD
      const positionAttribute = geometry.getAttribute('position')
      if (positionAttribute && positionAttribute.count > 100) {
        // Simple decimation - could be enhanced with proper mesh simplification
        const reductionFactor = Math.max(0.1, lodLevel)
        const targetVertexCount = Math.floor(positionAttribute.count * reductionFactor)

        // For now, just mark the mesh as optimized
        mesh.userData.optimizedLOD = lodLevel
        mesh.userData.originalVertexCount = positionAttribute.count
        mesh.userData.targetVertexCount = targetVertexCount
      }
    }
  }

  // Validate tool mesh for CSG operations
  public validateToolMesh(mesh: THREE.Mesh): boolean {
    if (!mesh || !mesh.geometry) {
      return false
    }

    const geometry = mesh.geometry

    // Check if geometry has valid attributes
    if (!geometry.getAttribute('position')) {
      return false
    }

    // Check if geometry is not empty
    const positionAttribute = geometry.getAttribute('position')
    if (positionAttribute.count === 0) {
      return false
    }

    // Check bounding box
    geometry.computeBoundingBox()
    if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) {
      return false
    }

    return true
  }

  // Get tool mesh statistics for debugging
  public getToolMeshStats(mesh: THREE.Mesh): {
    vertices: number
    faces: number
    boundingBox: THREE.Box3 | null
    volume: number
  } {
    const geometry = mesh.geometry
    const positionAttribute = geometry.getAttribute('position')
    const vertices = positionAttribute ? positionAttribute.count : 0
    const faces = geometry.index ? geometry.index.count / 3 : vertices / 3

    geometry.computeBoundingBox()
    const boundingBox = geometry.boundingBox

    let volume = 0
    if (boundingBox) {
      const size = boundingBox.getSize(new THREE.Vector3())
      volume = size.x * size.y * size.z
    }

    return {
      vertices,
      faces,
      boundingBox,
      volume
    }
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

  // Enhanced test method for new CSG tool mesh creation
  public testCSGToolMeshCreation(): void {
    console.log('Testing enhanced CSG tool mesh creation...')

    const testOperations = ['roughing', 'finishing', 'profiling', 'drilling', 'pocketing']
    const testTools = [
      this.getToolById('cyl-6mm'),
      this.getToolById('con-90deg'),
      this.getToolById('ball-6mm')
    ]

    testTools.forEach(tool => {
      if (tool) {
        testOperations.forEach(operation => {
          try {
            const mesh = this.createCSGToolMesh(tool, operation, 5)
            const stats = this.getToolMeshStats(mesh)
            const isValid = this.validateToolMesh(mesh)

            console.log(`✓ ${tool.name} - ${operation}:`, {
              valid: isValid,
              vertices: stats.vertices,
              faces: stats.faces,
              volume: stats.volume.toFixed(2)
            })
          } catch (error) {
            console.error(`✗ Failed to create CSG mesh for ${tool.name} - ${operation}:`, error)
          }
        })
      }
    })

    // Test tool path creation with sample commands
    const sampleCommands = [
      { command_type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, radius: 0, color: '#000', size: 1, text: '', layer_name: 'test', thickness: 5 },
      { command_type: 'circle', x1: 50, y1: 50, x2: 0, y2: 0, radius: 25, color: '#000', size: 1, text: '', layer_name: 'test', thickness: 5 },
      { command_type: 'rectangle', x1: 0, y1: 0, x2: 50, y2: 30, radius: 0, color: '#000', size: 1, text: '', layer_name: 'test', thickness: 5 }
    ]

    const testTool = this.getToolById('cyl-6mm')
    if (testTool) {
      try {
        const operationMeshes = this.createOperationToolMeshes(sampleCommands, testTool, 'pocketing', 5)
        console.log(`✓ Created ${operationMeshes.length} operation meshes for sample commands`)

        operationMeshes.forEach((mesh, index) => {
          const stats = this.getToolMeshStats(mesh)
          console.log(`  Mesh ${index + 1}: ${stats.vertices} vertices, ${stats.faces} faces`)
        })
      } catch (error) {
        console.error('✗ Failed to create operation meshes:', error)
      }
    }

    console.log('CSG tool mesh creation test completed.')
  }

  // Create realistic toolpath for CSG testing
  public createTestToolpath(): any[] {
    return [
      // Drilling operations
      { command_type: 'circle', x1: 50, y1: 50, x2: 0, y2: 0, radius: 3, color: '#ff0000', size: 1, text: '', layer_name: 'drilling_6mm', thickness: 10 },
      { command_type: 'circle', x1: 150, y1: 50, x2: 0, y2: 0, radius: 3, color: '#ff0000', size: 1, text: '', layer_name: 'drilling_6mm', thickness: 10 },

      // Roughing operations
      { command_type: 'rectangle', x1: 20, y1: 20, x2: 80, y2: 80, radius: 0, color: '#00ff00', size: 1, text: '', layer_name: 'roughing_8mm', thickness: 5 },
      { command_type: 'rectangle', x1: 120, y1: 20, x2: 180, y2: 80, radius: 0, color: '#00ff00', size: 1, text: '', layer_name: 'roughing_8mm', thickness: 5 },

      // Pocketing operations
      { command_type: 'rectangle', x1: 30, y1: 30, x2: 70, y2: 70, radius: 0, color: '#0000ff', size: 1, text: '', layer_name: 'pocketing_6mm', thickness: 8 },

      // Profiling operations
      { command_type: 'line', x1: 10, y1: 10, x2: 190, y2: 10, radius: 0, color: '#ff00ff', size: 1, text: '', layer_name: 'profiling_4mm', thickness: 3 },
      { command_type: 'line', x1: 10, y1: 90, x2: 190, y2: 90, radius: 0, color: '#ff00ff', size: 1, text: '', layer_name: 'profiling_4mm', thickness: 3 },

      // Finishing operations
      { command_type: 'circle', x1: 100, y1: 50, x2: 0, y2: 0, radius: 15, color: '#ffff00', size: 1, text: '', layer_name: 'finishing_2mm', thickness: 1 }
    ]
  }

  // Get appropriate tool for layer
  public getToolForLayer(layerName: string): CNCTool | null {
    const layer = layerName.toLowerCase()

    // Extract diameter from layer name
    const diameterMatch = layer.match(/(\d+)mm/)
    if (diameterMatch) {
      const diameter = parseInt(diameterMatch[1])
      return this.getToolById(`cyl-${diameter}mm`) || this.getToolById('cyl-6mm') || null
    }

    // Default tools based on operation type
    if (layer.includes('drilling') || layer.includes('delme')) {
      return this.getToolById('cyl-6mm') || null
    }
    if (layer.includes('roughing') || layer.includes('kaba')) {
      return this.getToolById('cyl-8mm') || null
    }
    if (layer.includes('finishing') || layer.includes('son')) {
      return this.getToolById('cyl-2mm') || this.getToolById('ball-2mm') || null
    }
    if (layer.includes('profiling') || layer.includes('profil')) {
      return this.getToolById('cyl-4mm') || null
    }
    if (layer.includes('pocketing') || layer.includes('cep')) {
      return this.getToolById('cyl-6mm') || null
    }

    return this.getToolById('cyl-6mm') || null // Default tool
  }
}

export const cncToolService = CNCToolService.getInstance()

// Auto-run enhanced test on service initialization (development only)
if (process.env.NODE_ENV === 'development') {
  // Delay test to ensure Three.js is loaded
  setTimeout(() => {
    try {
      cncToolService.testCSGToolMeshCreation()
    } catch (error) {
      console.warn('CSG tool mesh test failed:', error)
    }
  }, 1000)
}
