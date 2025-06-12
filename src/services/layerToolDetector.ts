import type { CNCTool } from '@/types'
import { cncToolService } from './cncToolService'

export interface LayerAnalysis {
  tool: CNCTool | null
  operation: string
  surface: string
  toolType: string
  diameter?: number
  angle?: number
  depth?: number
  isInner?: boolean
  isOuter?: boolean
}

export class LayerToolDetector {
  private static instance: LayerToolDetector

  private constructor() {}

  public static getInstance(): LayerToolDetector {
    if (!LayerToolDetector.instance) {
      LayerToolDetector.instance = new LayerToolDetector()
    }
    return LayerToolDetector.instance
  }

  /**
   * Analyze layer name and automatically detect appropriate tool
   * Based on AdekoCAM layer naming conventions:
   * K = Kanal (Groove from center)
   * H = Contour (DIS/dis = outer, IC/ic = inner)
   * V = Conical tool operations
   *
   * Excludes non-machinable layers:
   * - LUA layers (script-related)
   * - LMM layers (measurement/markup)
   */
  public analyzeLayer(layerName: string): LayerAnalysis {
    if (!layerName) {
      return this.getDefaultAnalysis()
    }

    const layer = layerName.trim()
    const lowerLayer = layer.toLowerCase()

    // Check if layer should be excluded from tool detection
    if (this.isNonMachinableLayer(layer)) {
      return {
        tool: null,
        operation: 'non-machinable',
        surface: 'none',
        toolType: 'none'
      }
    }

    // Check for prohibited layers based on user feedback
    if (this.isProhibitedLayer(layer)) {
      return {
        tool: null,
        operation: 'prohibited',
        surface: 'none',
        toolType: 'none'
      }
    }

    // Check for generic layers that should be prohibited
    if (this.isGenericLayer(layer)) {
      return {
        tool: null,
        operation: 'prohibited',
        surface: 'none',
        toolType: 'none'
      }
    }

    // Determine surface (top/bottom)
    const surface = this.detectSurface(lowerLayer)

    // Parse layer prefix and determine operation type
    const prefix = this.extractPrefix(layer)
    const toolInfo = this.analyzeByPrefix(prefix, layer)

    // Extract numeric parameters
    const diameter = this.extractDiameter(layer)
    const angle = this.extractAngle(layer)
    const depth = this.extractDepth(layer)

    // Determine if it's inner or outer contour
    const isInner = lowerLayer.includes('ic') || lowerLayer.includes('inner')
    const isOuter = lowerLayer.includes('dis') || lowerLayer.includes('outer')

    // Find appropriate tool
    const tool = this.findTool(toolInfo.toolType, diameter, angle, toolInfo.operation)

    return {
      tool,
      operation: toolInfo.operation,
      surface,
      toolType: toolInfo.toolType,
      diameter,
      angle,
      depth,
      isInner,
      isOuter
    }
  }

  private detectSurface(lowerLayer: string): string {
    // Check for bottom surface indicators
    if (lowerLayer.includes('_sf') || 
        lowerLayer.includes('bottom') || 
        lowerLayer.includes('alt') ||
        lowerLayer.includes('_ic_sf') ||
        lowerLayer.includes('_dis_sf')) {
      return 'bottom'
    }
    return 'top'
  }

  private extractPrefix(layer: string): string {
    // Extract the first part before underscore or the first letter(s)
    const match = layer.match(/^([A-Z]+)_?/)
    return match ? match[1] : ''
  }

  private analyzeByPrefix(prefix: string, fullLayer: string): { toolType: string; operation: string } {
    const lowerLayer = fullLayer.toLowerCase()

    switch (prefix.toUpperCase()) {
      case 'K':
        // Kanal (Groove from center)
        if (lowerLayer.includes('freze')) {
          return { toolType: 'cylindrical', operation: 'grooving' }
        } else if (lowerLayer.includes('ballnose')) {
          return { toolType: 'ballnose', operation: 'grooving' }
        } else if (lowerLayer.includes('aciliv')) {
          return { toolType: 'conical', operation: 'v-grooving' }
        }
        return { toolType: 'cylindrical', operation: 'grooving' }

      case 'H':
        // Contour operations - distinguish inner/outer
        const isInnerContour = lowerLayer.includes('ic') || lowerLayer.includes('inner')
        const isOuterContour = lowerLayer.includes('dis') || lowerLayer.includes('outer')

        if (lowerLayer.includes('freze')) {
          const operation = isInnerContour ? 'inner-contouring' : isOuterContour ? 'outer-contouring' : 'contouring'
          return { toolType: 'cylindrical', operation }
        } else if (lowerLayer.includes('ballnose')) {
          const operation = isInnerContour ? 'inner-contouring' : isOuterContour ? 'outer-contouring' : 'contouring'
          return { toolType: 'ballnose', operation }
        } else if (lowerLayer.includes('desen')) {
          const operation = isOuterContour ? 'outer-contouring' : 'contouring'
          return { toolType: 'special', operation } // As per user feedback
        }
        return { toolType: 'cylindrical', operation: 'contouring' }

      case 'V':
        // Conical tool operations
        return { toolType: 'conical', operation: 'v-cutting' }

      case 'CEP':
        // Pocket operations
        return { toolType: 'cylindrical', operation: 'pocketing' }

      case 'PANEL':
        // Panel operations (general machining)
        return { toolType: 'cylindrical', operation: 'profiling' }

      default:
        // Simple numeric patterns (20MM, 30MM, 5MM)
        const simpleNumericMatch = fullLayer.match(/^(\d+)MM$/i)
        if (simpleNumericMatch) {
          return { toolType: 'cylindrical', operation: 'machining' }
        }

        // Analyze by tool type keywords - Enhanced patterns
        if (lowerLayer.includes('freze') || lowerLayer.includes('roughing') || lowerLayer.includes('finishing')) {
          return { toolType: 'cylindrical', operation: 'machining' }
        } else if (lowerLayer.includes('ballnose')) {
          return { toolType: 'ballnose', operation: 'machining' } // Changed from finishing per feedback
        } else if (lowerLayer.includes('baliksırti') || lowerLayer.includes('balıksırtı') || lowerLayer.includes('baliksırti')) {
          return { toolType: 'special', operation: 'machining' } // Changed to special per feedback
        } else if (lowerLayer.includes('aciliv') && lowerLayer.match(/\d+/)) {
          return { toolType: 'conical', operation: 'machining' } // Changed from v-cutting per feedback
        } else if (lowerLayer.includes('vgroove') || lowerLayer.includes('v_oyuk45')) {
          return { toolType: 'conical', operation: 'v-cutting' }
        } else if (lowerLayer.includes('oyuk') && lowerLayer.match(/\d+/)) {
          return { toolType: 'cylindrical', operation: 'pocketing' } // Special case per feedback
        } else if (lowerLayer.includes('form') || lowerLayer.includes('jnotch') || lowerLayer.includes('dovetail')) {
          return { toolType: 'special', operation: 'machining' }
        } else if (lowerLayer.includes('desen') || lowerLayer.includes('pattern')) {
          return { toolType: 'ballnose', operation: 'machining' } // Changed from pattern per feedback
        } else if (lowerLayer.includes('kanal')) {
          return { toolType: 'cylindrical', operation: 'machining' } // Changed from grooving per feedback
        } else if (lowerLayer.includes('cizgi') || lowerLayer.includes('line')) {
          return { toolType: 'cylindrical', operation: 'machining' } // Changed from line-cutting per feedback
        } else if (lowerLayer.includes('edge') && lowerLayer.includes('radius')) {
          return { toolType: 'radial', operation: 'edge-profiling' }
        }
        return { toolType: 'cylindrical', operation: 'machining' }
    }
  }

  private extractDiameter(layer: string): number | undefined {
    // Simple numeric patterns first (20MM, 30MM, 5MM)
    const simpleNumericMatch = layer.match(/^(\d+)MM$/i)
    if (simpleNumericMatch) {
      return parseInt(simpleNumericMatch[1])
    }

    // Look for patterns like "20mm", "Freze20mm", "Ballnose6mm"
    const diameterMatch = layer.match(/(\d+)mm/i)
    if (diameterMatch) {
      return parseInt(diameterMatch[1])
    }

    // Look for patterns like "TN_20" (Tool Number)
    const toolNumberMatch = layer.match(/TN_(\d+)/i)
    if (toolNumberMatch) {
      return parseInt(toolNumberMatch[1])
    }

    // Enhanced patterns for better detection
    const enhancedMatches = [
      layer.match(/(freze|ballnose|aciliv)(\d+)/i),
      layer.match(/(\d+)(freze|ballnose)/i),
      layer.match(/ballnose[_]?(\d+)/i), // Ballnose_12
      layer.match(/freze(\d+)mm/i), // Freze3mm
      layer.match(/(\d+)mmfreze/i), // 20mmFreze
      layer.match(/roughing[_]?(\d+)mm/i), // TOP_Roughing_10mm
      layer.match(/finishing[_]?(\d+)mm/i), // TOP_Finishing_6mm
      layer.match(/ballnose[_]?(\d+)mm/i), // TOP_Ballnose_6mm
      layer.match(/radius[_]?(\d+)mm/i), // EDGE_Profile_2mm_Radius
      layer.match(/oyuk(\d+)/i), // Oyuk30
      layer.match(/[_\s](\d+)[_\s]/i),
      layer.match(/^(\d+)/i), // Number at start
      layer.match(/(\d+)$/i)  // Number at end
    ]

    for (const match of enhancedMatches) {
      if (match) {
        const diameter = parseInt(match[1] || match[2])
        // Only accept reasonable tool diameters (1-50mm)
        if (diameter >= 1 && diameter <= 50) {
          return diameter
        }
      }
    }

    return undefined
  }

  private extractAngle(layer: string): number | undefined {
    // Enhanced V-bit angle detection patterns
    const angleMatches = [
      layer.match(/aciliv(\d+)/i), // K_AciliV90
      layer.match(/v_?oyuk(\d+)/i), // V_Oyuk45
      layer.match(/oyuk(\d+)/i), // Oyuk30
      layer.match(/vgroove[_]?(\d+)(?:deg)?/i), // TOP_VGroove_90deg
      layer.match(/^v(\d+)$/i), // V45, V120
      layer.match(/(\d+)(?:deg|°)/i), // 90deg
      layer.match(/v(\d+)/i), // General V pattern
      layer.match(/(\d+)v/i) // Reverse V pattern
    ]

    for (const match of angleMatches) {
      if (match) {
        const angle = parseInt(match[1])
        // Only accept reasonable V-bit angles (15-180 degrees)
        if (angle >= 15 && angle <= 180) {
          return angle
        }
      }
    }

    return undefined
  }

  private extractDepth(layer: string): number | undefined {
    // Look for depth indicators (this might be in thickness settings rather than layer name)
    const depthMatch = layer.match(/d(\d+)/i)
    if (depthMatch) {
      return parseInt(depthMatch[1])
    }
    return undefined
  }

  private findTool(toolType: string, diameter?: number, angle?: number, operation?: string): CNCTool | null {
    const tools = cncToolService.getToolsByShape(toolType)

    // For conical tools, match by angle
    if (toolType === 'conical' && angle !== undefined) {
      const conicalTool = tools.find(tool =>
        tool.shape === 'conical' && (tool as any).tipAngle === angle
      )
      if (conicalTool) return conicalTool

      // Find closest angle
      const closestTool = tools.reduce((closest, current) => {
        if (current.shape !== 'conical') return closest
        if (!closest) return current

        const closestAngle = (closest as any).tipAngle || 90
        const currentAngle = (current as any).tipAngle || 90
        const closestDiff = Math.abs(closestAngle - angle)
        const currentDiff = Math.abs(currentAngle - angle)

        return currentDiff < closestDiff ? current : closest
      }, null as CNCTool | null)

      // If no close match found, create a virtual tool
      if (!closestTool || Math.abs((closestTool as any).tipAngle - angle) > 15) {
        return this.createVirtualTool(toolType, diameter, angle)
      }

      return closestTool
    }

    // For other tools, match by diameter
    if (diameter !== undefined) {
      const exactMatch = tools.find(tool => tool.diameter === diameter)
      if (exactMatch) return exactMatch

      // Find closest diameter
      const closestTool = tools.reduce((closest, current) => {
        if (!closest) return current
        const closestDiff = Math.abs(closest.diameter - diameter)
        const currentDiff = Math.abs(current.diameter - diameter)
        return currentDiff < closestDiff ? current : closest
      }, null as CNCTool | null)

      // If no close match found (difference > 3mm), create a virtual tool
      if (!closestTool || Math.abs(closestTool.diameter - diameter) > 3) {
        return this.createVirtualTool(toolType, diameter, angle)
      }

      return closestTool
    }

    // Default selection based on operation
    if (tools.length > 0) {
      if (operation === 'roughing' || operation === 'pocketing') {
        // Prefer larger tools for roughing
        return tools.reduce((largest, current) =>
          !largest || current.diameter > largest.diameter ? current : largest
        )
      } else if (operation === 'finishing' || operation === 'v-cutting') {
        // Prefer smaller tools for finishing
        return tools.reduce((smallest, current) =>
          !smallest || current.diameter < smallest.diameter ? current : smallest
        )
      }

      // Return first available tool
      return tools[0]
    }

    // If no tools of this type exist, create a virtual tool
    return this.createVirtualTool(toolType, diameter, angle)
  }

  private createVirtualTool(toolType: string, diameter?: number, angle?: number): CNCTool | null {
    const defaultDiameter = diameter || 6
    const defaultAngle = angle || 90

    switch (toolType) {
      case 'cylindrical':
        return {
          id: `virtual-cyl-${defaultDiameter}mm`,
          name: `${defaultDiameter}mm End Mill (Virtual)`,
          shape: 'cylindrical',
          units: 'metric',
          diameter: defaultDiameter,
          length: Math.max(defaultDiameter * 5, 30),
          flutes: defaultDiameter <= 6 ? 2 : defaultDiameter <= 12 ? 3 : 4,
          helixAngle: 30,
          description: `Virtual ${defaultDiameter}mm cylindrical end mill`,
          material: 'Carbide'
        } as CNCTool

      case 'ballnose':
        return {
          id: `virtual-ball-${defaultDiameter}mm`,
          name: `${defaultDiameter}mm Ball End Mill (Virtual)`,
          shape: 'ballnose',
          units: 'metric',
          diameter: defaultDiameter,
          length: Math.max(defaultDiameter * 5, 30),
          ballRadius: defaultDiameter / 2,
          flutes: defaultDiameter <= 6 ? 2 : 3,
          helixAngle: 30,
          description: `Virtual ${defaultDiameter}mm ball end mill`,
          material: 'Carbide'
        } as CNCTool

      case 'conical':
        return {
          id: `virtual-con-${defaultAngle}deg`,
          name: `${defaultAngle}° V-Bit (Virtual)`,
          shape: 'conical',
          units: 'metric',
          diameter: Math.max(defaultAngle / 5, 10),
          length: 40,
          tipAngle: defaultAngle,
          tipDiameter: 0.1,
          flutes: 2,
          description: `Virtual ${defaultAngle}° V-bit`,
          material: 'Carbide'
        } as CNCTool

      case 'radial':
        return {
          id: `virtual-rad-${defaultDiameter}mm`,
          name: `${defaultDiameter}mm Corner Radius (Virtual)`,
          shape: 'radial',
          units: 'metric',
          diameter: defaultDiameter + 4,
          length: Math.max(defaultDiameter * 5, 30),
          cornerRadius: defaultDiameter,
          flutes: 2,
          helixAngle: 30,
          description: `Virtual ${defaultDiameter}mm corner radius tool`,
          material: 'Carbide'
        } as CNCTool

      default:
        return null
    }
  }

  private getDefaultAnalysis(): LayerAnalysis {
    return {
      tool: null,
      operation: 'machining',
      surface: 'top',
      toolType: 'cylindrical'
    }
  }

  /**
   * Check if a layer should be excluded from tool detection
   * Non-machinable layers include:
   * - LUA: Script-related layers
   * - LMM: Measurement/markup layers
   */
  private isNonMachinableLayer(layerName: string): boolean {
    const upperLayer = layerName.toUpperCase()

    // Exclude LUA layers (script-related)
    if (upperLayer === 'LUA' || upperLayer.startsWith('LUA_')) {
      return true
    }

    // Exclude LMM layers (measurement/markup)
    if (upperLayer.startsWith('LMM')) {
      return true
    }

    // Add other non-machinable layer patterns here if needed
    // Examples: ANNOTATION, TEXT, DIMENSION, etc.
    const nonMachinablePatterns = [
      'ANNOTATION',
      'TEXT',
      'DIMENSION',
      'MARKUP',
      'REFERENCE',
      'GUIDE'
    ]

    return nonMachinablePatterns.some(pattern =>
      upperLayer.includes(pattern)
    )
  }

  /**
   * Check if layer should be prohibited from tool detection based on user feedback
   */
  private isProhibitedLayer(layerName: string): boolean {
    const prohibitedPatterns = [
      'CLEANCORNERS', 'CLEANUP', 'DEEPEND', 'DEEPFRAME', 'THINFRAME',
      'V120PENCERE', 'VIOLIN', '_TN_', 'V120', 'V45'
    ]

    return prohibitedPatterns.some(pattern =>
      layerName.toUpperCase().includes(pattern.toUpperCase())
    )
  }

  /**
   * Check if layer is generic and should be prohibited
   */
  private isGenericLayer(layerName: string): boolean {
    const genericPatterns = [
      'K_AciliV', 'V_Oyuk', 'K_toolType', 'AciliV120'
    ]

    return genericPatterns.some(pattern =>
      layerName === pattern
    )
  }

  /**
   * Get recommended cutting parameters based on layer analysis
   */
  public getRecommendedParameters(analysis: LayerAnalysis): {
    feedRate: number
    spindleSpeed: number
    stepDown: number
    stepOver: number
  } {
    const { tool, operation, toolType } = analysis

    if (!tool) {
      return {
        feedRate: 800,
        spindleSpeed: 15000,
        stepDown: 2,
        stepOver: 4
      }
    }

    const diameter = tool.diameter
    let feedRate = 800
    let spindleSpeed = 15000
    let stepDown = 2
    let stepOver = diameter * 0.6

    // Adjust parameters based on tool type
    switch (toolType) {
      case 'cylindrical':
        if (operation === 'roughing' || operation === 'pocketing') {
          feedRate = 1000 + (diameter * 50)
          spindleSpeed = Math.max(8000, 20000 - (diameter * 500))
          stepDown = Math.min(diameter * 0.5, 5)
        } else {
          feedRate = 600 + (diameter * 30)
          spindleSpeed = Math.max(12000, 25000 - (diameter * 600))
          stepDown = Math.min(diameter * 0.3, 3)
        }
        break

      case 'ballnose':
        feedRate = 400 + (diameter * 40)
        spindleSpeed = Math.max(15000, 30000 - (diameter * 800))
        stepDown = Math.min(diameter * 0.2, 2)
        stepOver = diameter * 0.3 // Smaller stepover for smooth finish
        break

      case 'conical':
        feedRate = 300 + (diameter * 20)
        spindleSpeed = Math.max(18000, 35000 - (diameter * 1000))
        stepDown = Math.min(diameter * 0.1, 1)
        stepOver = diameter * 0.4
        break

      case 'radial':
        feedRate = 500 + (diameter * 25)
        spindleSpeed = Math.max(12000, 22000 - (diameter * 500))
        stepDown = Math.min(diameter * 0.3, 2)
        break
    }

    return {
      feedRate: Math.round(feedRate),
      spindleSpeed: Math.round(spindleSpeed),
      stepDown: Math.round(stepDown * 10) / 10,
      stepOver: Math.round(stepOver * 10) / 10
    }
  }
}

export const layerToolDetector = LayerToolDetector.getInstance()
