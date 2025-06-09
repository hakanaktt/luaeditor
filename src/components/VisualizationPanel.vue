<template>
  <div class="visualization-panel">
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="flex items-center space-x-2">
        <Palette :size="16" class="text-blue-600" />
        <span class="text-sm font-medium text-gray-700">{{ $t('visualization.title') }}</span>
        <div v-if="drawCommands.length > 0" class="text-xs text-gray-500">
          {{ drawCommands.length }} {{ $t('visualization.commands') }}
        </div>
      </div>
      <div class="flex items-center space-x-1">
        <button
          v-if="drawCommands.length > 0"
          @click="clearVisualization"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('visualization.clear')"
        >
          <Trash2 :size="14" />
        </button>
        <button
          @click="toggleExpanded"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="isExpanded ? $t('visualization.collapse') : $t('visualization.expand')"
        >
          <Maximize2 v-if="!isExpanded" :size="14" />
          <Minimize2 v-else :size="14" />
        </button>
      </div>
    </div>

    <!-- Panel Content -->
    <div class="panel-content" :class="{ 'expanded': isExpanded }">
      <div v-if="drawCommands.length === 0" class="no-visualization">
        <div class="text-center py-8 text-gray-500">
          <Palette :size="32" class="mx-auto mb-2 text-gray-400" />
          <p class="text-sm">{{ $t('visualization.noData') }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ $t('visualization.runScriptHint') }}</p>
        </div>
      </div>
      <div v-else class="turtle-graphics-container">
        <TurtleCanvas :draw-commands="drawCommands" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Palette, Trash2, Maximize2, Minimize2 } from 'lucide-vue-next'
import TurtleCanvas from './TurtleCanvas.vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface DrawCommand {
  command_type: string
  x1: number
  y1: number
  x2: number
  y2: number
  radius: number
  color: string
  size: number
  text: string
}

interface Props {
  drawCommands?: DrawCommand[]
}

const props = withDefaults(defineProps<Props>(), {
  drawCommands: () => []
})

const emit = defineEmits<{
  'clear-visualization': []
}>()

const drawCommands = ref<DrawCommand[]>([])
const isExpanded = ref(false)

const clearVisualization = () => {
  drawCommands.value = []
  emit('clear-visualization')
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Watch for draw commands prop changes
watch(() => props.drawCommands, (newCommands) => {
  if (newCommands) {
    drawCommands.value = [...newCommands]
  }
}, { immediate: true })

// Expose methods for parent component
defineExpose({
  setDrawCommands: (commands: DrawCommand[]) => {
    drawCommands.value = [...commands]
  },
  clearVisualization
})
</script>

<style scoped>
.visualization-panel {
  @apply h-full flex flex-col bg-white;
}

.panel-header {
  @apply flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200;
  height: 40px;
}

.panel-content {
  @apply flex-1 overflow-hidden;
  transition: all 0.3s ease;
}

.panel-content.expanded {
  @apply fixed inset-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg;
}

.no-visualization {
  @apply h-full flex items-center justify-center;
}

.turtle-graphics-container {
  @apply h-full;
}
</style>
