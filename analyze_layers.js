const fs = require('fs');
const path = require('path');

// Layer analysis script to extract all setLayer calls from model scripts
class LayerAnalyzer {
  constructor() {
    this.layers = new Set();
    this.layersByModel = new Map();
    this.layerPatterns = new Map();
  }

  // Extract layer names from Lua script content
  extractLayers(content, modelName) {
    const layerRegex = /G\.setLayer\s*\(\s*["']([^"']+)["']\s*\)/g;
    const dynamicLayerRegex = /layerName\s*=\s*["']([^"']+)["']/g;
    const concatLayerRegex = /layerName\s*=\s*["']([^"']*)[^"']*\.\.\s*([^"'\s]+)/g;
    
    const modelLayers = [];
    let match;

    // Extract direct setLayer calls
    while ((match = layerRegex.exec(content)) !== null) {
      const layer = match[1];
      this.layers.add(layer);
      modelLayers.push({
        layer,
        type: 'direct',
        line: this.getLineNumber(content, match.index)
      });
    }

    // Extract dynamic layer assignments
    while ((match = dynamicLayerRegex.exec(content)) !== null) {
      const layer = match[1];
      this.layers.add(layer);
      modelLayers.push({
        layer,
        type: 'dynamic',
        line: this.getLineNumber(content, match.index)
      });
    }

    // Extract concatenated layer patterns
    while ((match = concatLayerRegex.exec(content)) !== null) {
      const baseLayer = match[1];
      const variable = match[2];
      const pattern = `${baseLayer}${variable}`;
      this.layers.add(pattern);
      modelLayers.push({
        layer: pattern,
        type: 'concatenated',
        line: this.getLineNumber(content, match.index),
        variable
      });
    }

    this.layersByModel.set(modelName, modelLayers);
    return modelLayers;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Analyze layer patterns and categorize them
  analyzePatterns() {
    const patterns = {
      kanal: [], // K_ prefix
      contour: [], // H_ prefix  
      vTool: [], // V_ prefix or AciliV
      pocket: [], // CEP_ or pocket operations
      panel: [], // PANEL operations
      special: [], // Other patterns
      dynamic: [] // Dynamic/concatenated layers
    };

    for (const layer of this.layers) {
      const upperLayer = layer.toUpperCase();
      
      if (upperLayer.startsWith('K_')) {
        patterns.kanal.push(layer);
      } else if (upperLayer.startsWith('H_')) {
        patterns.contour.push(layer);
      } else if (upperLayer.startsWith('V_') || upperLayer.includes('ACILIV')) {
        patterns.vTool.push(layer);
      } else if (upperLayer.includes('CEP') || upperLayer.includes('POCKET')) {
        patterns.pocket.push(layer);
      } else if (upperLayer.includes('PANEL')) {
        patterns.panel.push(layer);
      } else if (layer.includes('..') || layer.includes('TN_')) {
        patterns.dynamic.push(layer);
      } else {
        patterns.special.push(layer);
      }
    }

    this.layerPatterns = patterns;
    return patterns;
  }

  // Simulate our app's tool detection for each layer
  simulateToolDetection() {
    const results = [];
    
    for (const layer of this.layers) {
      const detection = this.detectTool(layer);
      results.push({
        layer,
        detected: detection
      });
    }
    
    return results;
  }

  // Simplified version of our tool detection logic
  detectTool(layerName) {
    const layer = layerName.toLowerCase();
    
    // Cylindrical tools (Freze)
    if (layer.includes('freze') || layer.includes('k_freze')) {
      const diameterMatch = layer.match(/(\d+)mm/);
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6;
      return { type: 'cylindrical', diameter, confidence: 'high' };
    }

    // Ball nose tools
    if (layer.includes('ballnose') || layer.includes('baliksırti')) {
      const diameterMatch = layer.match(/(\d+)mm/);
      const diameter = diameterMatch ? parseInt(diameterMatch[1]) : 6;
      return { type: 'ballnose', diameter, confidence: 'high' };
    }

    // Conical tools (V-bit)
    if (layer.includes('aciliv') || layer.includes('v_oyuk') || layer.includes('oyuk')) {
      const angleMatch = layer.match(/(\d+)/);
      const angle = angleMatch ? parseInt(angleMatch[1]) : 90;
      return { type: 'conical', angle, confidence: 'high' };
    }

    // Special operations
    if (layer.includes('cep_acma') || layer.includes('pocket')) {
      return { type: 'cylindrical', diameter: 10, operation: 'pocketing', confidence: 'medium' };
    }

    if (layer.includes('panel')) {
      return { type: 'cylindrical', diameter: 6, operation: 'profiling', confidence: 'medium' };
    }

    // Dynamic patterns
    if (layer.includes('tn_') || layer.includes('..')) {
      return { type: 'dynamic', confidence: 'low', note: 'Requires runtime analysis' };
    }

    return { type: 'unknown', confidence: 'none' };
  }

  // Generate analysis report
  generateReport() {
    const patterns = this.analyzePatterns();
    const detections = this.simulateToolDetection();
    
    return {
      summary: {
        totalLayers: this.layers.size,
        totalModels: this.layersByModel.size,
        patternBreakdown: Object.fromEntries(
          Object.entries(patterns).map(([key, value]) => [key, value.length])
        )
      },
      patterns,
      detections,
      modelBreakdown: Object.fromEntries(this.layersByModel)
    };
  }
}

// Export for use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayerAnalyzer;
}

// Browser/standalone usage
if (typeof window !== 'undefined') {
  window.LayerAnalyzer = LayerAnalyzer;
}
