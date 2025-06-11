<template>
  <div class="visualization-panel">
    <!-- Toolbar -->
    <div v-if="drawCommands.length > 0" class="panel-toolbar">
      <div class="flex items-center space-x-2">
        <div class="text-xs text-gray-500">
          {{ drawCommands.length }} {{ $t('visualization.commands') }}
        </div>
      </div>
      <div class="flex items-center space-x-1">
        <!-- Turtle Graphics Controls -->
        <button
          v-if="!isTurtleCanvasMinimized"
          @click="resetView"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.resetView')"
        >
          <RotateCcw :size="14" />
        </button>
        <button
          v-if="!isTurtleCanvasMinimized"
          @click="zoomIn"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.zoomIn')"
        >
          <ZoomIn :size="14" />
        </button>
        <button
          v-if="!isTurtleCanvasMinimized"
          @click="zoomOut"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.zoomOut')"
        >
          <ZoomOut :size="14" />
        </button>

        <!-- Separator -->
        <div v-if="!isTurtleCanvasMinimized" class="w-px h-4 bg-gray-300"></div>

        <!-- Panel Controls -->
        <button
          v-if="!isTurtleCanvasMinimized"
          @click="minimizeTurtleCanvas"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.minimize')"
        >
          <Minimize2 :size="14" />
        </button>
        <button
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
      <div v-else-if="isTurtleCanvasMinimized" class="minimized-turtle-canvas">
        <div class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
          <div class="flex items-center space-x-2">
            <Palette :size="16" class="text-blue-600" />
            <span class="text-sm font-medium text-gray-700">{{ $t('visualization.turtleGraphicsMinimized') }}</span>
            <span class="text-xs text-gray-500">{{ drawCommands.length }} {{ $t('turtleCanvas.commands') }}</span>
          </div>
          <button
            @click="restoreTurtleCanvas"
            class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            :title="$t('visualization.restore')"
          >
            <Maximize2 :size="14" />
          </button>
        </div>
      </div>
      <div v-else class="turtle-graphics-container">
        <TurtleCanvas ref="turtleCanvasRef" :draw-commands="drawCommands" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Palette, Trash2, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-vue-next'
import TurtleCanvas from './TurtleCanvas.vue'

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
  layer_name: string
}

interface Props {
  drawCommands?: DrawCommand[]
}

const props = withDefaults(defineProps<Props>(), {
  drawCommands: () => []
})

const emit = defineEmits<{
  'clear-visualization': []
  'toggle-expanded': [expanded: boolean]
}>()

const drawCommands = ref<DrawCommand[]>([])
const isExpanded = ref(true)  // Start maximized
const isTurtleCanvasMinimized = ref(false)
const turtleCanvasRef = ref<InstanceType<typeof TurtleCanvas> | null>(null)

const clearVisualization = () => {
  drawCommands.value = []
  emit('clear-visualization')
}

const minimizeTurtleCanvas = () => {
  isTurtleCanvasMinimized.value = true
}

const restoreTurtleCanvas = () => {
  isTurtleCanvasMinimized.value = false
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  emit('toggle-expanded', isExpanded.value)
}

// Turtle graphics control functions
const resetView = () => {
  if (turtleCanvasRef.value) {
    turtleCanvasRef.value.resetView()
  }
}

const zoomIn = () => {
  if (turtleCanvasRef.value) {
    turtleCanvasRef.value.zoomIn()
  }
}

const zoomOut = () => {
  if (turtleCanvasRef.value) {
    turtleCanvasRef.value.zoomOut()
  }
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

.panel-toolbar {
  @apply flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200;
  height: 40px;
}

.panel-content {
  @apply flex-1 overflow-hidden;
  transition: all 0.3s ease;
}

.panel-content.expanded {
  @apply flex-1;
  /* Cover the whole available area, not modal */
}

.no-visualization {
  @apply h-full flex items-center justify-center;
}

.turtle-graphics-container {
  @apply h-full;
}

.minimized-turtle-canvas {
  @apply p-2;
}
</style>
