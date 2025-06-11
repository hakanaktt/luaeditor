<template>
  <div class="auto-tool-detector">
    <div class="detector-header">
      <h3>{{ $t('autoTool.title') }}</h3>
      <p class="detector-description">{{ $t('autoTool.description') }}</p>
    </div>

    <!-- Layer Input for Testing -->
    <div class="layer-input-section">
      <h4>{{ $t('autoTool.testDetection') }}</h4>
      <div class="input-group">
        <input 
          v-model="testLayerName" 
          type="text" 
          class="form-input"
          :placeholder="$t('autoTool.enterLayerName')"
          @input="analyzeTestLayer"
        />
        <button @click="analyzeTestLayer" class="btn btn-primary">
          {{ $t('autoTool.analyze') }}
        </button>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="testAnalysis" class="analysis-results">
      <h4>{{ $t('autoTool.analysisResults') }}</h4>
      
      <div class="result-grid">
        <!-- Tool Information -->
        <div class="result-card">
          <h5>{{ $t('autoTool.detectedTool') }}</h5>
          <div v-if="testAnalysis.tool" class="tool-info">
            <div class="tool-icon">
              <component :is="getToolIcon(testAnalysis.tool.shape)" :size="24" />
            </div>
            <div class="tool-details">
              <div class="tool-name">
                {{ testAnalysis.tool.name }}
                <span v-if="testAnalysis.tool.id.includes('virtual')" class="virtual-badge">
                  {{ $t('autoTool.virtual') }}
                </span>
              </div>
              <div class="tool-specs">
                <span>⌀{{ testAnalysis.tool.diameter }}mm</span>
                <span>L{{ testAnalysis.tool.length }}mm</span>
                <span>{{ $t(`cncTools.${testAnalysis.tool.shape}`) }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="testAnalysis.operation === 'non-machinable'" class="non-machinable">
            {{ $t('autoTool.nonMachinable') }}
          </div>
          <div v-else class="no-tool">
            {{ $t('autoTool.noToolDetected') }}
          </div>
        </div>

        <!-- Operation Details -->
        <div class="result-card">
          <h5>{{ $t('autoTool.operation') }}</h5>
          <div class="operation-info">
            <div class="operation-type">{{ testAnalysis.operation }}</div>
            <div class="operation-details">
              <span class="surface">{{ $t(`autoTool.${testAnalysis.surface}Surface`) }}</span>
              <span class="tool-type">{{ $t(`cncTools.${testAnalysis.toolType}`) }}</span>
            </div>
          </div>
        </div>

        <!-- Parameters -->
        <div class="result-card">
          <h5>{{ $t('autoTool.parameters') }}</h5>
          <div class="parameters-list">
            <div v-if="testAnalysis.diameter" class="parameter">
              <span class="param-label">{{ $t('cncTools.diameter') }}:</span>
              <span class="param-value">{{ testAnalysis.diameter }}mm</span>
            </div>
            <div v-if="testAnalysis.angle" class="parameter">
              <span class="param-label">{{ $t('cncTools.tipAngle') }}:</span>
              <span class="param-value">{{ testAnalysis.angle }}°</span>
            </div>
            <div v-if="testAnalysis.isInner" class="parameter">
              <span class="param-label">{{ $t('autoTool.contourType') }}:</span>
              <span class="param-value">{{ $t('autoTool.inner') }}</span>
            </div>
            <div v-if="testAnalysis.isOuter" class="parameter">
              <span class="param-label">{{ $t('autoTool.contourType') }}:</span>
              <span class="param-value">{{ $t('autoTool.outer') }}</span>
            </div>
          </div>
        </div>

        <!-- Cutting Parameters -->
        <div v-if="recommendedParams" class="result-card">
          <h5>{{ $t('autoTool.cuttingParameters') }}</h5>
          <div class="cutting-params">
            <div class="parameter">
              <span class="param-label">{{ $t('cncTools.feedRate') }}:</span>
              <span class="param-value">{{ recommendedParams.feedRate }} mm/min</span>
            </div>
            <div class="parameter">
              <span class="param-label">{{ $t('cncTools.spindleSpeed') }}:</span>
              <span class="param-value">{{ recommendedParams.spindleSpeed }} RPM</span>
            </div>
            <div class="parameter">
              <span class="param-label">{{ $t('cncTools.stepDown') }}:</span>
              <span class="param-value">{{ recommendedParams.stepDown }}mm</span>
            </div>
            <div class="parameter">
              <span class="param-label">{{ $t('cncTools.stepOver') }}:</span>
              <span class="param-value">{{ recommendedParams.stepOver }}mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Layer Naming Convention Guide -->
    <div class="naming-guide">
      <h4>{{ $t('autoTool.namingConventions') }}</h4>
      <div class="convention-grid">
        <div class="convention-item">
          <h5>K = {{ $t('autoTool.kanal') }}</h5>
          <p>{{ $t('autoTool.kanalDescription') }}</p>
          <div class="examples">
            <code>K_Freze10mm</code>
            <code>K_Ballnose6mm</code>
            <code>K_AciliV90</code>
          </div>
        </div>

        <div class="convention-item">
          <h5>H = {{ $t('autoTool.contour') }}</h5>
          <p>{{ $t('autoTool.contourDescription') }}</p>
          <div class="examples">
            <code>H_Freze20mm_DIS</code>
            <code>H_Ballnose6mm_IC</code>
            <code>H_Freze10mm_IC_SF</code>
          </div>
        </div>

        <div class="convention-item">
          <h5>V = {{ $t('autoTool.vTool') }}</h5>
          <p>{{ $t('autoTool.vToolDescription') }}</p>
          <div class="examples">
            <code>V_Oyuk45</code>
            <code>K_AciliV90</code>
            <code>V_Groove60</code>
          </div>
        </div>

        <div class="convention-item">
          <h5>{{ $t('autoTool.suffixes') }}</h5>
          <p>{{ $t('autoTool.suffixDescription') }}</p>
          <div class="examples">
            <code>_SF = {{ $t('autoTool.bottomSurface') }}</code>
            <code>_DIS = {{ $t('autoTool.outer') }}</code>
            <code>_IC = {{ $t('autoTool.inner') }}</code>
          </div>
        </div>

        <div class="convention-item non-machinable-info">
          <h5>{{ $t('autoTool.nonMachinableLayers') }}</h5>
          <p>{{ $t('autoTool.nonMachinableDescription') }}</p>
          <div class="examples">
            <code>LUA</code>
            <code>LMM*</code>
            <code>ANNOTATION</code>
            <code>TEXT</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Common Layer Examples -->
    <div class="examples-section">
      <h4>{{ $t('autoTool.commonExamples') }}</h4>
      <div class="examples-list">
        <div 
          v-for="example in commonExamples" 
          :key="example.layer"
          class="example-item"
          @click="testLayerName = example.layer; analyzeTestLayer()"
        >
          <div class="example-layer">{{ example.layer }}</div>
          <div class="example-description">{{ example.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Circle, Triangle, Zap, CornerDownRight, Star } from 'lucide-vue-next'
import { layerToolDetector } from '@/services/layerToolDetector'
import type { LayerAnalysis } from '@/services/layerToolDetector'

// Reactive data
const testLayerName = ref('')
const testAnalysis = ref<LayerAnalysis | null>(null)

// Computed properties
const recommendedParams = computed(() => {
  if (!testAnalysis.value) return null
  return layerToolDetector.getRecommendedParameters(testAnalysis.value)
})

// Common layer examples
const commonExamples = [
  { layer: 'K_Freze10mm', description: 'Groove with 10mm cylindrical end mill' },
  { layer: 'K_Ballnose6mm', description: 'Groove with 6mm ball nose end mill' },
  { layer: 'K_AciliV90', description: 'V-groove with 90° conical bit' },
  { layer: 'H_Freze20mm_DIS', description: 'Outer contour with 20mm end mill' },
  { layer: 'H_Ballnose6mm_IC', description: 'Inner contour with 6mm ball nose' },
  { layer: 'H_Freze10mm_IC_SF', description: 'Inner contour on bottom surface' },
  { layer: 'PANEL', description: 'General panel machining' },
  { layer: 'CEP_ACMA', description: 'Pocket clearing operation' },
  { layer: 'V_Oyuk45', description: 'V-groove with 45° angle' },
  { layer: 'Freze3mm', description: '3mm end mill (diameter from layer)' },
  { layer: '20mmFreze', description: '20mm end mill (diameter from layer)' },
  { layer: 'Ballnose_12', description: '12mm ball nose (virtual tool)' },
  { layer: 'V45', description: '45° V-bit (angle from layer)' },
  { layer: 'AciliV120', description: '120° V-bit (virtual tool)' },
  { layer: 'Oyuk30', description: '30° V-bit (virtual tool)' },
  { layer: 'LUA', description: 'Script layer (non-machinable)' },
  { layer: 'LMM_Dimensions', description: 'Measurement layer (non-machinable)' }
]

// Methods
const analyzeTestLayer = () => {
  if (!testLayerName.value.trim()) {
    testAnalysis.value = null
    return
  }
  
  testAnalysis.value = layerToolDetector.analyzeLayer(testLayerName.value)
}

const getToolIcon = (shape: string) => {
  const icons = {
    cylindrical: Circle,
    conical: Triangle,
    ballnose: Zap,
    radial: CornerDownRight,
    special: Star
  }
  return icons[shape as keyof typeof icons] || Circle
}
</script>

<style scoped>
.auto-tool-detector {
  padding: 16px;
  background: var(--vscode-editor-background);
  color: var(--vscode-foreground);
}

.detector-header h3 {
  margin: 0 0 8px 0;
  color: var(--vscode-foreground);
}

.detector-description {
  margin: 0 0 16px 0;
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
}

.layer-input-section {
  margin-bottom: 24px;
}

.layer-input-section h4 {
  margin: 0 0 8px 0;
  color: var(--vscode-foreground);
  font-size: 14px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.form-input {
  flex: 1;
  padding: 6px 8px;
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border);
  border-radius: 2px;
  color: var(--vscode-input-foreground);
  font-size: 12px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid var(--vscode-button-border);
  border-radius: 2px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  cursor: pointer;
  font-size: 12px;
}

.btn:hover {
  background: var(--vscode-button-hoverBackground);
}

.analysis-results {
  margin-bottom: 24px;
}

.analysis-results h4 {
  margin: 0 0 12px 0;
  color: var(--vscode-foreground);
  font-size: 14px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.result-card {
  background: var(--vscode-editor-inactiveSelectionBackground);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 12px;
}

.result-card h5 {
  margin: 0 0 8px 0;
  color: var(--vscode-foreground);
  font-size: 12px;
  font-weight: 600;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-icon {
  color: var(--vscode-symbolIcon-functionForeground);
}

.tool-details {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: var(--vscode-foreground);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.virtual-badge {
  background: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 600;
  text-transform: uppercase;
}

.tool-specs {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

.no-tool {
  color: var(--vscode-descriptionForeground);
  font-style: italic;
  font-size: 12px;
}

.non-machinable {
  color: var(--vscode-errorForeground);
  font-style: italic;
  font-size: 12px;
  font-weight: 500;
}

.operation-info {
  text-align: center;
}

.operation-type {
  font-weight: 500;
  color: var(--vscode-foreground);
  margin-bottom: 4px;
  text-transform: capitalize;
}

.operation-details {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

.parameters-list,
.cutting-params {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.parameter {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.param-label {
  color: var(--vscode-descriptionForeground);
}

.param-value {
  color: var(--vscode-foreground);
  font-weight: 500;
}

.naming-guide {
  margin-bottom: 24px;
}

.naming-guide h4 {
  margin: 0 0 12px 0;
  color: var(--vscode-foreground);
  font-size: 14px;
}

.convention-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.convention-item {
  background: var(--vscode-editor-inactiveSelectionBackground);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 12px;
}

.convention-item h5 {
  margin: 0 0 4px 0;
  color: var(--vscode-foreground);
  font-size: 12px;
}

.convention-item p {
  margin: 0 0 8px 0;
  color: var(--vscode-descriptionForeground);
  font-size: 11px;
}

.non-machinable-info {
  border-left: 3px solid var(--vscode-errorForeground);
  background: var(--vscode-inputValidation-errorBackground);
}

.non-machinable-info h5 {
  color: var(--vscode-errorForeground);
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.examples code {
  background: var(--vscode-textCodeBlock-background);
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 10px;
  color: var(--vscode-textPreformat-foreground);
}

.examples-section h4 {
  margin: 0 0 12px 0;
  color: var(--vscode-foreground);
  font-size: 14px;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.example-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--vscode-editor-inactiveSelectionBackground);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.example-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.example-layer {
  font-family: monospace;
  font-weight: 500;
  color: var(--vscode-foreground);
}

.example-description {
  color: var(--vscode-descriptionForeground);
  font-size: 11px;
}
</style>
