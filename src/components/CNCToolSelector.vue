<template>
  <div class="cnc-tool-selector">
    <div class="tool-selector-header">
      <h3>{{ $t('cncTools.title') }}</h3>
      <div class="tool-actions">
        <button 
          @click="showAddTool = true" 
          class="btn btn-primary btn-sm"
          :title="$t('cncTools.addTool')"
        >
          <Plus :size="16" />
          {{ $t('cncTools.addTool') }}
        </button>
        <button 
          @click="showProfiles = !showProfiles" 
          class="btn btn-secondary btn-sm"
          :title="$t('cncTools.profiles')"
        >
          <Settings :size="16" />
          {{ $t('cncTools.profiles') }}
        </button>
      </div>
    </div>

    <!-- Tool Shape Filter -->
    <div class="tool-filters">
      <label>{{ $t('cncTools.filterByShape') }}:</label>
      <select v-model="selectedShape" @change="filterTools" class="form-select">
        <option value="">{{ $t('cncTools.allShapes') }}</option>
        <option value="cylindrical">{{ $t('cncTools.cylindrical') }}</option>
        <option value="conical">{{ $t('cncTools.conical') }}</option>
        <option value="ballnose">{{ $t('cncTools.ballnose') }}</option>
        <option value="radial">{{ $t('cncTools.radial') }}</option>
        <option value="special">{{ $t('cncTools.special') }}</option>
      </select>
    </div>

    <!-- Tool List -->
    <div class="tool-list">
      <div 
        v-for="tool in filteredTools" 
        :key="tool.id"
        class="tool-item"
        :class="{ 'selected': selectedTool?.id === tool.id }"
        @click="selectTool(tool)"
      >
        <div class="tool-icon">
          <component :is="getToolIcon(tool.shape)" :size="24" />
        </div>
        <div class="tool-info">
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-details">
            <span class="tool-diameter">⌀{{ tool.diameter }}mm</span>
            <span class="tool-length">L{{ tool.length }}mm</span>
            <span class="tool-shape">{{ $t(`cncTools.${tool.shape}`) }}</span>
          </div>
          <div v-if="tool.description" class="tool-description">
            {{ tool.description }}
          </div>
        </div>
        <div class="tool-actions">
          <button 
            @click.stop="editTool(tool)" 
            class="btn btn-sm btn-outline"
            :title="$t('cncTools.editTool')"
          >
            <Edit :size="14" />
          </button>
          <button 
            @click.stop="deleteTool(tool.id)" 
            class="btn btn-sm btn-danger"
            :title="$t('cncTools.deleteTool')"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Tool Details -->
    <div v-if="selectedTool" class="selected-tool-details">
      <h4>{{ $t('cncTools.toolDetails') }}</h4>
      <div class="tool-parameters">
        <div class="parameter">
          <label>{{ $t('cncTools.diameter') }}:</label>
          <span>{{ selectedTool.diameter }}mm</span>
        </div>
        <div class="parameter">
          <label>{{ $t('cncTools.length') }}:</label>
          <span>{{ selectedTool.length }}mm</span>
        </div>
        <div class="parameter">
          <label>{{ $t('cncTools.material') }}:</label>
          <span>{{ selectedTool.material || 'N/A' }}</span>
        </div>
        <div class="parameter">
          <label>{{ $t('cncTools.coating') }}:</label>
          <span>{{ selectedTool.coating || 'N/A' }}</span>
        </div>
        
        <!-- Shape-specific parameters -->
        <template v-if="selectedTool.shape === 'conical'">
          <div class="parameter">
            <label>{{ $t('cncTools.tipAngle') }}:</label>
            <span>{{ (selectedTool as ConicalTool).tipAngle }}°</span>
          </div>
        </template>
        
        <template v-if="selectedTool.shape === 'ballnose'">
          <div class="parameter">
            <label>{{ $t('cncTools.ballRadius') }}:</label>
            <span>{{ (selectedTool as BallnoseTool).ballRadius }}mm</span>
          </div>
        </template>
        
        <template v-if="selectedTool.shape === 'radial'">
          <div class="parameter">
            <label>{{ $t('cncTools.cornerRadius') }}:</label>
            <span>{{ (selectedTool as RadialTool).cornerRadius }}mm</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Operation Assignment -->
    <div class="operation-assignment">
      <h4>{{ $t('cncTools.assignOperation') }}</h4>
      <div class="operation-controls">
        <select v-model="selectedOperation" class="form-select">
          <option value="">{{ $t('cncTools.selectOperation') }}</option>
          <option value="roughing">{{ $t('cncTools.roughing') }}</option>
          <option value="finishing">{{ $t('cncTools.finishing') }}</option>
          <option value="profiling">{{ $t('cncTools.profiling') }}</option>
          <option value="drilling">{{ $t('cncTools.drilling') }}</option>
          <option value="pocketing">{{ $t('cncTools.pocketing') }}</option>
        </select>
        
        <select v-model="selectedSurface" class="form-select">
          <option value="">{{ $t('cncTools.selectSurface') }}</option>
          <option value="top">{{ $t('cncTools.topSurface') }}</option>
          <option value="bottom">{{ $t('cncTools.bottomSurface') }}</option>
          <option value="both">{{ $t('cncTools.bothSurfaces') }}</option>
        </select>
        
        <button 
          @click="assignOperation" 
          :disabled="!selectedTool || !selectedOperation || !selectedSurface"
          class="btn btn-primary"
        >
          {{ $t('cncTools.assign') }}
        </button>
      </div>
    </div>

    <!-- Machining Profiles Modal -->
    <div v-if="showProfiles" class="modal-overlay" @click="showProfiles = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('cncTools.machiningProfiles') }}</h3>
          <button @click="showProfiles = false" class="btn btn-sm">
            <X :size="16" />
          </button>
        </div>
        <div class="modal-body">
          <div v-for="profile in machiningProfiles" :key="profile.id" class="profile-item">
            <h4>{{ profile.name }}</h4>
            <p>{{ profile.description }}</p>
            <div class="profile-operations">
              <div class="surface-operations">
                <h5>{{ $t('cncTools.topOperations') }} ({{ profile.topSurfaceOperations.length }})</h5>
                <h5>{{ $t('cncTools.bottomOperations') }} ({{ profile.bottomSurfaceOperations.length }})</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Settings, Edit, Trash2, X, Circle, Triangle, Zap, CornerDownRight, Star } from 'lucide-vue-next'
import { cncToolService } from '@/services/cncToolService'
import type { CNCTool, ConicalTool, BallnoseTool, RadialTool, DoorMachiningProfile } from '@/types'

// Reactive data
const tools = ref<CNCTool[]>([])
const machiningProfiles = ref<DoorMachiningProfile[]>([])
const selectedTool = ref<CNCTool | null>(null)
const selectedShape = ref<string>('')
const selectedOperation = ref<string>('')
const selectedSurface = ref<string>('')
const showAddTool = ref(false)
const showProfiles = ref(false)

// Computed properties
const filteredTools = computed(() => {
  if (!selectedShape.value) return tools.value
  return tools.value.filter(tool => tool.shape === selectedShape.value)
})

// Methods
const loadTools = () => {
  tools.value = cncToolService.getAllTools()
  machiningProfiles.value = cncToolService.getAllProfiles()
}

const selectTool = (tool: CNCTool) => {
  selectedTool.value = tool
}

const filterTools = () => {
  // Filtering is handled by computed property
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

const editTool = (tool: CNCTool) => {
  // TODO: Implement tool editing modal
  console.log('Edit tool:', tool)
}

const deleteTool = (toolId: string) => {
  if (confirm('Are you sure you want to delete this tool?')) {
    cncToolService.removeTool(toolId)
    loadTools()
    if (selectedTool.value?.id === toolId) {
      selectedTool.value = null
    }
  }
}

const assignOperation = () => {
  if (!selectedTool.value || !selectedOperation.value || !selectedSurface.value) return
  
  // Emit event to parent component
  emit('toolAssigned', {
    tool: selectedTool.value,
    operation: selectedOperation.value,
    surface: selectedSurface.value
  })
  
  // Reset selections
  selectedOperation.value = ''
  selectedSurface.value = ''
}

// Events
const emit = defineEmits<{
  toolAssigned: [data: { tool: CNCTool; operation: string; surface: string }]
}>()

// Lifecycle
onMounted(() => {
  loadTools()
})
</script>

<style scoped>
.cnc-tool-selector {
  padding: 16px;
  background: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
}

.tool-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tool-selector-header h3 {
  margin: 0;
  color: var(--vscode-foreground);
}

.tool-actions {
  display: flex;
  gap: 8px;
}

.tool-filters {
  margin-bottom: 16px;
}

.tool-filters label {
  display: block;
  margin-bottom: 4px;
  color: var(--vscode-foreground);
  font-size: 12px;
}

.form-select {
  width: 100%;
  padding: 6px 8px;
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border);
  border-radius: 2px;
  color: var(--vscode-input-foreground);
  font-size: 12px;
}

.tool-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tool-item:hover {
  background: var(--vscode-list-hoverBackground);
}

.tool-item.selected {
  background: var(--vscode-list-activeSelectionBackground);
  border-color: var(--vscode-focusBorder);
}

.tool-icon {
  margin-right: 12px;
  color: var(--vscode-symbolIcon-functionForeground);
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  color: var(--vscode-foreground);
  margin-bottom: 2px;
}

.tool-details {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}

.tool-description {
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
  margin-top: 2px;
}

.tool-actions {
  display: flex;
  gap: 4px;
}

.selected-tool-details {
  background: var(--vscode-editor-inactiveSelectionBackground);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.selected-tool-details h4 {
  margin: 0 0 8px 0;
  color: var(--vscode-foreground);
}

.tool-parameters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.parameter {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.parameter label {
  color: var(--vscode-descriptionForeground);
}

.parameter span {
  color: var(--vscode-foreground);
  font-weight: 500;
}

.operation-assignment h4 {
  margin: 0 0 8px 0;
  color: var(--vscode-foreground);
}

.operation-controls {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: end;
}

.btn {
  padding: 6px 12px;
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

.btn-danger {
  background: var(--vscode-errorForeground);
  color: white;
}

.btn-outline {
  background: transparent;
  border-color: var(--vscode-panel-border);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

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
  max-height: 80vh;
  overflow-y: auto;
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

.profile-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
}

.profile-item h4 {
  margin: 0 0 4px 0;
  color: var(--vscode-foreground);
}

.profile-item p {
  margin: 0 0 8px 0;
  color: var(--vscode-descriptionForeground);
  font-size: 12px;
}

.surface-operations {
  display: flex;
  gap: 16px;
}

.surface-operations h5 {
  margin: 0;
  font-size: 11px;
  color: var(--vscode-descriptionForeground);
}
</style>
