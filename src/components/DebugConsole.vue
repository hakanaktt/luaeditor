<template>
  <div class="debug-console" :class="{ 'collapsed': isCollapsed }">
    <!-- Console Header -->
    <div class="console-header">
      <div class="flex items-center space-x-2">
        <Terminal :size="16" class="text-gray-600" />
        <span class="text-sm font-medium text-gray-700">{{ $t('debugConsole.title') }}</span>
        <div v-if="isExecuting" class="flex items-center space-x-1 text-blue-600">
          <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span class="text-xs">{{ $t('debugConsole.running') }}</span>
        </div>
        <div v-else-if="lastExecutionTime" class="flex items-center space-x-2 text-xs text-gray-500">
          <span>{{ $t('debugConsole.executionTime', { time: lastExecutionTime }) }}</span>
          <span v-if="drawCommands.length > 0" class="text-green-600">
            🎨 {{ drawCommands.length }} draw commands
          </span>
        </div>
      </div>
      <div class="flex items-center space-x-1">
        <button
          v-if="drawCommands.length > 0"
          @click="toggleTurtleGraphics"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :class="{ 'text-blue-600': showTurtleGraphics }"
          :title="$t('debugConsole.toggleTurtleGraphics')"
        >
          <Palette :size="14" />
        </button>
        <button
          @click="clearConsole"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('debugConsole.clearConsole')"
        >
          <Trash2 :size="14" />
        </button>
        <button
          @click="copyOutput"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('debugConsole.copyOutput')"
        >
          <Copy :size="14" />
        </button>
        <button
          @click="toggleCollapse"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
        >
          <ChevronDown v-if="isCollapsed" :size="14" />
          <ChevronUp v-else :size="14" />
        </button>
      </div>
    </div>

    <!-- Console Content -->
    <div v-if="!isCollapsed" class="console-content">
      <!-- Turtle Graphics Canvas -->
      <div v-if="showTurtleGraphics && drawCommands.length > 0" class="turtle-graphics-container">
        <TurtleCanvas :draw-commands="drawCommands" />
      </div>

      <!-- Text Output -->
      <div ref="outputContainer" class="output-container" :class="{ 'with-graphics': showTurtleGraphics && drawCommands.length > 0 }">
        <div v-if="outputs.length === 0" class="no-output">
          {{ $t('debugConsole.noOutput') }}
        </div>
        <div
          v-for="(output, index) in outputs"
          :key="index"
          class="output-line"
          :class="{
            'output-error': output.type === 'error',
            'output-success': output.type === 'success',
            'output-info': output.type === 'info'
          }"
        >
          <span class="timestamp">{{ formatTime(output.timestamp) }}</span>
          <span class="content">{{ output.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Terminal, Trash2, Copy, ChevronDown, ChevronUp, Palette } from 'lucide-vue-next'
import TurtleCanvas from './TurtleCanvas.vue'

interface DebugOutput {
  type: 'info' | 'success' | 'error'
  content: string
  timestamp: Date
}

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
  isVisible?: boolean
  drawCommands?: DrawCommand[]
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true,
  drawCommands: () => []
})

defineEmits<{
  'toggle-visibility': []
}>()

const isCollapsed = ref(false)
const isExecuting = ref(false)
const lastExecutionTime = ref<number | null>(null)
const outputs = ref<DebugOutput[]>([])
const outputContainer = ref<HTMLElement>()
const showTurtleGraphics = ref(true)
const drawCommands = ref<DrawCommand[]>([])

const toggleTurtleGraphics = () => {
  showTurtleGraphics.value = !showTurtleGraphics.value
}

const addOutput = (type: DebugOutput['type'], content: string) => {
  outputs.value.push({
    type,
    content,
    timestamp: new Date()
  })
  
  // Auto-scroll to bottom
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight
    }
  })
}

const clearConsole = () => {
  outputs.value = []
  lastExecutionTime.value = null
  drawCommands.value = []
}

const copyOutput = async () => {
  const text = outputs.value
    .map(output => `[${formatTime(output.timestamp)}] ${output.content}`)
    .join('\n')
  
  try {
    await navigator.clipboard.writeText(text)
    addOutput('info', 'Output copied to clipboard')
  } catch (error) {
    addOutput('error', 'Failed to copy output to clipboard')
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const setExecuting = (executing: boolean) => {
  isExecuting.value = executing
}

const setExecutionTime = (timeMs: number) => {
  lastExecutionTime.value = timeMs
}

const setDrawCommands = (commands: DrawCommand[]) => {
  console.log('DebugConsole setDrawCommands called with:', JSON.stringify(commands, null, 2))
  console.log('Stack trace:', new Error().stack)
  drawCommands.value = commands
  console.log('DebugConsole local drawCommands.value after setting:', JSON.stringify(drawCommands.value, null, 2))
  if (commands.length > 0) {
    showTurtleGraphics.value = true
    console.log('Showing turtle graphics because we have', commands.length, 'commands')
  } else {
    console.log('Not showing turtle graphics - no commands')
  }
}

// Watch for visibility changes
watch(() => props.isVisible, (visible) => {
  if (!visible) {
    isCollapsed.value = true
  }
})

// Watch for draw commands prop changes
watch(() => props.drawCommands, (newCommands) => {
  if (newCommands) {
    setDrawCommands(newCommands)
  }
}, { immediate: true })

// Expose methods for parent component
defineExpose({
  addOutput,
  clearConsole,
  setExecuting,
  setExecutionTime,
  setDrawCommands
})
</script>

<style scoped>
.debug-console {
  @apply border-t border-gray-200 bg-white;
  height: 300px;
  transition: height 0.3s ease;
}

.debug-console.collapsed {
  height: 40px;
}

.console-header {
  @apply flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200;
  height: 40px;
}

.console-content {
  @apply flex flex-col;
  height: calc(100% - 40px);
}

.turtle-graphics-container {
  @apply border-b border-gray-200;
  height: 300px;
  background-color: #f8f9fa;
}

.output-container {
  @apply flex-1 overflow-y-auto p-2 font-mono text-sm;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.output-container.with-graphics {
  height: calc(100% - 300px);
}

.no-output {
  @apply text-gray-500 italic text-center py-4;
}

.output-line {
  @apply flex space-x-2 py-1;
}

.output-line.output-error {
  @apply text-red-400;
}

.output-line.output-success {
  @apply text-green-400;
}

.output-line.output-info {
  @apply text-blue-400;
}

.timestamp {
  @apply text-gray-500 text-xs flex-shrink-0;
  min-width: 70px;
}

.content {
  @apply flex-1 whitespace-pre-wrap;
}
</style>
