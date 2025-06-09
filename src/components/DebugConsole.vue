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
        <div v-else-if="lastExecutionTime" class="text-xs text-gray-500">
          {{ $t('debugConsole.executionTime', { time: lastExecutionTime }) }}
        </div>
      </div>
      <div class="flex items-center space-x-1">
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
      <div ref="outputContainer" class="output-container">
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
import { Terminal, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-vue-next'

interface DebugOutput {
  type: 'info' | 'success' | 'error'
  content: string
  timestamp: Date
}

interface Props {
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true
})

defineEmits<{
  'toggle-visibility': []
}>()

const isCollapsed = ref(false)
const isExecuting = ref(false)
const lastExecutionTime = ref<number | null>(null)
const outputs = ref<DebugOutput[]>([])
const outputContainer = ref<HTMLElement>()

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

// Watch for visibility changes
watch(() => props.isVisible, (visible) => {
  if (!visible) {
    isCollapsed.value = true
  }
})

// Expose methods for parent component
defineExpose({
  addOutput,
  clearConsole,
  setExecuting,
  setExecutionTime
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

.output-container {
  @apply flex-1 overflow-y-auto p-2 font-mono text-sm;
  background-color: #1e1e1e;
  color: #d4d4d4;
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
