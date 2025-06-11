<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? $t('cncTools.editTool') : $t('cncTools.newTool') }}</h3>
        <button @click="$emit('close')" class="btn btn-sm">
          <X :size="16" />
        </button>
      </div>
      
      <form @submit.prevent="saveTool" class="modal-body">
        <!-- Basic Tool Information -->
        <div class="form-section">
          <h4>{{ $t('cncTools.toolDetails') }}</h4>
          
          <div class="form-group">
            <label for="toolName">{{ $t('cncTools.toolName') }} *</label>
            <input 
              id="toolName"
              v-model="toolData.name" 
              type="text" 
              class="form-input"
              :class="{ 'error': errors.name }"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="toolShape">{{ $t('cncTools.filterByShape') }} *</label>
            <select 
              id="toolShape"
              v-model="toolData.shape" 
              class="form-select"
              :class="{ 'error': errors.shape }"
              @change="onShapeChange"
              required
            >
              <option value="">{{ $t('cncTools.selectOperation') }}</option>
              <option value="cylindrical">{{ $t('cncTools.cylindrical') }}</option>
              <option value="conical">{{ $t('cncTools.conical') }}</option>
              <option value="ballnose">{{ $t('cncTools.ballnose') }}</option>
              <option value="radial">{{ $t('cncTools.radial') }}</option>
              <option value="special">{{ $t('cncTools.special') }}</option>
            </select>
            <span v-if="errors.shape" class="error-message">{{ errors.shape }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="toolDiameter">{{ $t('cncTools.diameter') }} (mm) *</label>
              <input 
                id="toolDiameter"
                v-model.number="toolData.diameter" 
                type="number" 
                step="0.1"
                min="0.1"
                class="form-input"
                :class="{ 'error': errors.diameter }"
                required
              />
              <span v-if="errors.diameter" class="error-message">{{ errors.diameter }}</span>
            </div>

            <div class="form-group">
              <label for="toolLength">{{ $t('cncTools.length') }} (mm) *</label>
              <input 
                id="toolLength"
                v-model.number="toolData.length" 
                type="number" 
                step="0.1"
                min="1"
                class="form-input"
                :class="{ 'error': errors.length }"
                required
              />
              <span v-if="errors.length" class="error-message">{{ errors.length }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="toolDescription">{{ $t('cncTools.toolDescription') }}</label>
            <textarea 
              id="toolDescription"
              v-model="toolData.description" 
              class="form-textarea"
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- Shape-specific Parameters -->
        <div v-if="toolData.shape" class="form-section">
          <h4>{{ $t('cncTools.customParameters') }}</h4>

          <!-- Cylindrical Tool Parameters -->
          <template v-if="toolData.shape === 'cylindrical'">
            <div class="form-row">
              <div class="form-group">
                <label for="flutes">{{ $t('cncTools.flutes') }}</label>
                <input 
                  id="flutes"
                  v-model.number="toolData.flutes" 
                  type="number" 
                  min="1"
                  max="8"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="helixAngle">{{ $t('cncTools.helixAngle') }} (°)</label>
                <input 
                  id="helixAngle"
                  v-model.number="toolData.helixAngle" 
                  type="number" 
                  min="0"
                  max="60"
                  step="1"
                  class="form-input"
                />
              </div>
            </div>
          </template>

          <!-- Conical Tool Parameters -->
          <template v-if="toolData.shape === 'conical'">
            <div class="form-row">
              <div class="form-group">
                <label for="tipAngle">{{ $t('cncTools.tipAngle') }} (°) *</label>
                <input 
                  id="tipAngle"
                  v-model.number="toolData.tipAngle" 
                  type="number" 
                  min="1"
                  max="180"
                  step="1"
                  class="form-input"
                  :class="{ 'error': errors.tipAngle }"
                  required
                />
                <span v-if="errors.tipAngle" class="error-message">{{ errors.tipAngle }}</span>
              </div>
              <div class="form-group">
                <label for="tipDiameter">Tip {{ $t('cncTools.diameter') }} (mm)</label>
                <input 
                  id="tipDiameter"
                  v-model.number="toolData.tipDiameter" 
                  type="number" 
                  min="0"
                  step="0.01"
                  class="form-input"
                />
              </div>
            </div>
          </template>

          <!-- Ballnose Tool Parameters -->
          <template v-if="toolData.shape === 'ballnose'">
            <div class="form-row">
              <div class="form-group">
                <label for="ballRadius">{{ $t('cncTools.ballRadius') }} (mm) *</label>
                <input 
                  id="ballRadius"
                  v-model.number="toolData.ballRadius" 
                  type="number" 
                  min="0.1"
                  step="0.1"
                  class="form-input"
                  :class="{ 'error': errors.ballRadius }"
                  required
                />
                <span v-if="errors.ballRadius" class="error-message">{{ errors.ballRadius }}</span>
              </div>
              <div class="form-group">
                <label for="ballFlutes">{{ $t('cncTools.flutes') }}</label>
                <input 
                  id="ballFlutes"
                  v-model.number="toolData.flutes" 
                  type="number" 
                  min="1"
                  max="8"
                  class="form-input"
                />
              </div>
            </div>
          </template>

          <!-- Radial Tool Parameters -->
          <template v-if="toolData.shape === 'radial'">
            <div class="form-row">
              <div class="form-group">
                <label for="cornerRadius">{{ $t('cncTools.cornerRadius') }} (mm) *</label>
                <input 
                  id="cornerRadius"
                  v-model.number="toolData.cornerRadius" 
                  type="number" 
                  min="0.1"
                  step="0.1"
                  class="form-input"
                  :class="{ 'error': errors.cornerRadius }"
                  required
                />
                <span v-if="errors.cornerRadius" class="error-message">{{ errors.cornerRadius }}</span>
              </div>
              <div class="form-group">
                <label for="radialFlutes">{{ $t('cncTools.flutes') }}</label>
                <input 
                  id="radialFlutes"
                  v-model.number="toolData.flutes" 
                  type="number" 
                  min="1"
                  max="8"
                  class="form-input"
                />
              </div>
            </div>
          </template>

          <!-- Special Tool Parameters -->
          <template v-if="toolData.shape === 'special'">
            <div class="form-group">
              <label for="specialType">{{ $t('cncTools.specialType') }} *</label>
              <input 
                id="specialType"
                v-model="toolData.specialType" 
                type="text" 
                class="form-input"
                :class="{ 'error': errors.specialType }"
                placeholder="e.g., dovetail, keyhole, custom"
                required
              />
              <span v-if="errors.specialType" class="error-message">{{ errors.specialType }}</span>
            </div>
          </template>
        </div>

        <!-- Additional Information -->
        <div class="form-section">
          <h4>{{ $t('cncTools.material') }} & {{ $t('cncTools.manufacturer') }}</h4>
          
          <div class="form-row">
            <div class="form-group">
              <label for="material">{{ $t('cncTools.material') }}</label>
              <select id="material" v-model="toolData.material" class="form-select">
                <option value="">Select material</option>
                <option value="HSS">HSS (High Speed Steel)</option>
                <option value="Carbide">Carbide</option>
                <option value="Ceramic">Ceramic</option>
                <option value="Diamond">Diamond</option>
                <option value="CBN">CBN (Cubic Boron Nitride)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="coating">{{ $t('cncTools.coating') }}</label>
              <select id="coating" v-model="toolData.coating" class="form-select">
                <option value="">No coating</option>
                <option value="TiN">TiN (Titanium Nitride)</option>
                <option value="TiAlN">TiAlN (Titanium Aluminum Nitride)</option>
                <option value="TiCN">TiCN (Titanium Carbonitride)</option>
                <option value="AlCrN">AlCrN (Aluminum Chromium Nitride)</option>
                <option value="DLC">DLC (Diamond-Like Carbon)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="manufacturer">{{ $t('cncTools.manufacturer') }}</label>
              <input 
                id="manufacturer"
                v-model="toolData.manufacturer" 
                type="text" 
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="partNumber">{{ $t('cncTools.partNumber') }}</label>
              <input 
                id="partNumber"
                v-model="toolData.partNumber" 
                type="text" 
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            {{ $t('cncTools.cancelTool') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
            {{ $t('cncTools.saveTool') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { CNCTool, ToolShape } from '@/types'

interface Props {
  tool?: CNCTool | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [tool: CNCTool]
}>()

// Form data
const toolData = ref({
  id: '',
  name: '',
  shape: '' as ToolShape | '',
  units: 'metric' as const,
  diameter: 0,
  length: 0,
  description: '',
  material: '',
  coating: '',
  manufacturer: '',
  partNumber: '',
  // Shape-specific properties
  flutes: undefined as number | undefined,
  helixAngle: undefined as number | undefined,
  tipAngle: undefined as number | undefined,
  tipDiameter: undefined as number | undefined,
  ballRadius: undefined as number | undefined,
  cornerRadius: undefined as number | undefined,
  specialType: '',
  customParameters: {}
})

const errors = ref<Record<string, string>>({})

// Computed properties
const isEditing = computed(() => !!props.tool)

const isFormValid = computed(() => {
  return toolData.value.name && 
         toolData.value.shape && 
         toolData.value.diameter > 0 && 
         toolData.value.length > 0 &&
         Object.keys(errors.value).length === 0
})

// Methods
const initializeForm = () => {
  if (props.tool) {
    // Edit mode - populate form with existing tool data
    Object.assign(toolData.value, props.tool)
  } else {
    // New tool mode - reset form
    toolData.value = {
      id: `tool_${Date.now()}`,
      name: '',
      shape: '' as ToolShape | '',
      units: 'metric',
      diameter: 0,
      length: 0,
      description: '',
      material: '',
      coating: '',
      manufacturer: '',
      partNumber: '',
      flutes: undefined,
      helixAngle: undefined,
      tipAngle: undefined,
      tipDiameter: undefined,
      ballRadius: undefined,
      cornerRadius: undefined,
      specialType: '',
      customParameters: {}
    }
  }
  errors.value = {}
}

const onShapeChange = () => {
  // Reset shape-specific properties when shape changes
  toolData.value.flutes = undefined
  toolData.value.helixAngle = undefined
  toolData.value.tipAngle = undefined
  toolData.value.tipDiameter = undefined
  toolData.value.ballRadius = undefined
  toolData.value.cornerRadius = undefined
  toolData.value.specialType = ''
  toolData.value.customParameters = {}
  
  // Set default values based on shape
  if (toolData.value.shape === 'ballnose') {
    toolData.value.ballRadius = toolData.value.diameter / 2
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!toolData.value.name) {
    errors.value.name = 'Tool name is required'
  }
  
  if (!toolData.value.shape) {
    errors.value.shape = 'Tool shape is required'
  }
  
  if (toolData.value.diameter <= 0) {
    errors.value.diameter = 'Diameter must be greater than 0'
  }
  
  if (toolData.value.length <= 0) {
    errors.value.length = 'Length must be greater than 0'
  }
  
  // Shape-specific validation
  if (toolData.value.shape === 'conical' && (!toolData.value.tipAngle || toolData.value.tipAngle <= 0)) {
    errors.value.tipAngle = 'Tip angle is required for conical tools'
  }
  
  if (toolData.value.shape === 'ballnose' && (!toolData.value.ballRadius || toolData.value.ballRadius <= 0)) {
    errors.value.ballRadius = 'Ball radius is required for ballnose tools'
  }
  
  if (toolData.value.shape === 'radial' && (!toolData.value.cornerRadius || toolData.value.cornerRadius <= 0)) {
    errors.value.cornerRadius = 'Corner radius is required for radial tools'
  }
  
  if (toolData.value.shape === 'special' && !toolData.value.specialType) {
    errors.value.specialType = 'Special type is required for special tools'
  }
  
  return Object.keys(errors.value).length === 0
}

const saveTool = () => {
  if (!validateForm()) return
  
  // Create tool object based on shape
  const baseTool = {
    id: toolData.value.id,
    name: toolData.value.name,
    shape: toolData.value.shape as ToolShape,
    units: toolData.value.units,
    diameter: toolData.value.diameter,
    length: toolData.value.length,
    description: toolData.value.description,
    material: toolData.value.material,
    coating: toolData.value.coating,
    manufacturer: toolData.value.manufacturer,
    partNumber: toolData.value.partNumber
  }
  
  let tool: CNCTool
  
  switch (toolData.value.shape) {
    case 'cylindrical':
      tool = {
        ...baseTool,
        shape: 'cylindrical',
        flutes: toolData.value.flutes,
        helixAngle: toolData.value.helixAngle
      }
      break
      
    case 'conical':
      tool = {
        ...baseTool,
        shape: 'conical',
        tipAngle: toolData.value.tipAngle!,
        tipDiameter: toolData.value.tipDiameter,
        flutes: toolData.value.flutes
      }
      break
      
    case 'ballnose':
      tool = {
        ...baseTool,
        shape: 'ballnose',
        ballRadius: toolData.value.ballRadius!,
        flutes: toolData.value.flutes,
        helixAngle: toolData.value.helixAngle
      }
      break
      
    case 'radial':
      tool = {
        ...baseTool,
        shape: 'radial',
        cornerRadius: toolData.value.cornerRadius!,
        flutes: toolData.value.flutes,
        helixAngle: toolData.value.helixAngle
      }
      break
      
    case 'special':
      tool = {
        ...baseTool,
        shape: 'special',
        specialType: toolData.value.specialType,
        customParameters: toolData.value.customParameters
      }
      break
      
    default:
      return
  }
  
  emit('save', tool)
}

// Watch for prop changes
watch(() => props.tool, initializeForm, { immediate: true })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--vscode-panel-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--vscode-foreground);
}

.modal-body {
  padding: 16px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 12px 0;
  color: var(--vscode-foreground);
  font-size: 14px;
  border-bottom: 1px solid var(--vscode-panel-border);
  padding-bottom: 4px;
}

.form-group {
  margin-bottom: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  color: var(--vscode-foreground);
  font-size: 12px;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 6px 8px;
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border);
  border-radius: 2px;
  color: var(--vscode-input-foreground);
  font-size: 12px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--vscode-focusBorder);
}

.form-input.error,
.form-select.error {
  border-color: var(--vscode-errorForeground);
}

.error-message {
  color: var(--vscode-errorForeground);
  font-size: 11px;
  margin-top: 2px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--vscode-panel-border);
}

.btn {
  padding: 8px 16px;
  border: 1px solid var(--vscode-button-border);
  border-radius: 2px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn:hover {
  background: var(--vscode-button-hoverBackground);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
}

.btn-secondary {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}
</style>
