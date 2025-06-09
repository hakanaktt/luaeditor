<template>
  <div class="turtle-canvas-container">
    <div class="canvas-header">
      <div class="flex items-center space-x-2">
        <Palette :size="16" class="text-blue-600" />
        <span class="text-sm font-medium text-gray-700">{{ $t('turtleCanvas.title') }}</span>
        <span class="text-xs text-gray-500">{{ drawCommands.length }} {{ $t('turtleCanvas.commands') }}</span>
      </div>
      <div class="flex items-center space-x-1">
        <button
          @click="resetView"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.resetView')"
        >
          <RotateCcw :size="14" />
        </button>
        <button
          @click="zoomIn"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.zoomIn')"
        >
          <ZoomIn :size="14" />
        </button>
        <button
          @click="zoomOut"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('turtleCanvas.zoomOut')"
        >
          <ZoomOut :size="14" />
        </button>
      </div>
    </div>
    <div class="canvas-content">
      <canvas
        ref="canvasRef"
        class="turtle-canvas"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Palette, RotateCcw, ZoomIn, ZoomOut } from 'lucide-vue-next'

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
  drawCommands: DrawCommand[]
}

const props = defineProps<Props>()

const canvasRef = ref<HTMLCanvasElement>()
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

const resetView = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
  drawCanvas()
}

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5)
  drawCanvas()
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.1)
  drawCanvas()
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  scale.value = Math.max(0.1, Math.min(5, scale.value * delta))
  drawCanvas()
}

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastMouseX.value
  const deltaY = event.clientY - lastMouseY.value
  
  offsetX.value += deltaX
  offsetY.value += deltaY
  
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
  
  drawCanvas()
}

const handleMouseUp = () => {
  isDragging.value = false
}

const parseColor = (colorStr: string): string => {
  if (!colorStr) return '#000000'
  
  // Handle rgb() format
  if (colorStr.startsWith('rgb(')) {
    return colorStr
  }
  
  // Handle named colors
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#00ff00',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
    'gray': '#808080',
    'grey': '#808080'
  }
  
  return colorMap[colorStr.toLowerCase()] || colorStr
}

const drawCanvas = () => {
  console.log('drawCanvas called with', props.drawCommands.length, 'commands')
  const canvas = canvasRef.value
  if (!canvas) {
    console.log('No canvas ref, retrying in 100ms...')
    // Retry after a short delay to allow the canvas to mount
    setTimeout(() => {
      if (canvasRef.value) {
        drawCanvas()
      } else {
        console.log('Canvas ref still not available after retry')
      }
    }, 100)
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.log('No canvas context')
    return
  }

  // Set canvas size
  const rect = canvas.parentElement?.getBoundingClientRect()
  if (rect) {
    canvas.width = rect.width
    canvas.height = rect.height
    console.log('Canvas size set to:', rect.width, 'x', rect.height)
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Set up coordinate system (center origin)
  ctx.save()
  ctx.translate(canvas.width / 2 + offsetX.value, canvas.height / 2 + offsetY.value)
  ctx.scale(scale.value, scale.value)
  console.log('Canvas transform applied: translate', canvas.width / 2 + offsetX.value, canvas.height / 2 + offsetY.value, 'scale', scale.value)

  // Draw grid
  drawGrid(ctx, canvas.width, canvas.height)

  // Draw commands
  console.log('Drawing', props.drawCommands.length, 'commands')
  props.drawCommands.forEach(command => {
    drawCommand(ctx, command)
  })

  ctx.restore()
  console.log('drawCanvas completed')
}

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const gridSize = 20
  const centerX = -offsetX.value / scale.value
  const centerY = -offsetY.value / scale.value
  const halfWidth = width / (2 * scale.value)
  const halfHeight = height / (2 * scale.value)
  
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 0.5
  
  // Vertical lines
  for (let x = Math.floor((centerX - halfWidth) / gridSize) * gridSize; x <= centerX + halfWidth; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, centerY - halfHeight)
    ctx.lineTo(x, centerY + halfHeight)
    ctx.stroke()
  }
  
  // Horizontal lines
  for (let y = Math.floor((centerY - halfHeight) / gridSize) * gridSize; y <= centerY + halfHeight; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(centerX - halfWidth, y)
    ctx.lineTo(centerX + halfWidth, y)
    ctx.stroke()
  }
  
  // Draw axes
  ctx.strokeStyle = '#c0c0c0'
  ctx.lineWidth = 1
  
  // X-axis
  ctx.beginPath()
  ctx.moveTo(centerX - halfWidth, 0)
  ctx.lineTo(centerX + halfWidth, 0)
  ctx.stroke()
  
  // Y-axis
  ctx.beginPath()
  ctx.moveTo(0, centerY - halfHeight)
  ctx.lineTo(0, centerY + halfHeight)
  ctx.stroke()
}

const drawCommand = (ctx: CanvasRenderingContext2D, command: DrawCommand) => {
  console.log('Drawing command:', command)
  ctx.strokeStyle = parseColor(command.color)
  ctx.lineWidth = Math.max(1, command.size)
  ctx.fillStyle = parseColor(command.color)

  console.log('Canvas context settings:', {
    strokeStyle: ctx.strokeStyle,
    lineWidth: ctx.lineWidth,
    fillStyle: ctx.fillStyle
  })

  switch (command.command_type) {
    case 'line':
      console.log('Drawing line from', command.x1, -command.y1, 'to', command.x2, -command.y2)
      ctx.beginPath()
      ctx.moveTo(command.x1, -command.y1) // Flip Y coordinate
      ctx.lineTo(command.x2, -command.y2)
      ctx.stroke()
      console.log('Line drawn')
      break
      
    case 'circle':
      ctx.beginPath()
      ctx.arc(command.x1, -command.y1, command.radius, 0, 2 * Math.PI)
      ctx.stroke()
      break
      
    case 'rectangle':
      const width = command.x2 - command.x1
      const height = command.y2 - command.y1
      if (command.radius > 0) {
        // Rounded rectangle
        const radius = Math.min(command.radius, Math.abs(width) / 2, Math.abs(height) / 2)
        ctx.beginPath()
        ctx.roundRect(command.x1, -command.y2, width, height, radius)
        ctx.stroke()
      } else {
        ctx.strokeRect(command.x1, -command.y2, width, height)
      }
      break
      
    case 'text':
      ctx.font = `${command.size || 12}px Arial`
      ctx.fillText(command.text, command.x1, -command.y1)
      break
  }
}

// Watch for draw commands changes
watch(() => props.drawCommands, (newCommands) => {
  console.log('TurtleCanvas received draw commands:', JSON.stringify(newCommands, null, 2))
  nextTick(() => {
    drawCanvas()
  })
}, { immediate: true })

// Redraw on mount
onMounted(() => {
  nextTick(() => {
    drawCanvas()
    
    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      drawCanvas()
    })
    
    if (canvasRef.value?.parentElement) {
      resizeObserver.observe(canvasRef.value.parentElement)
    }
  })
})
</script>

<style scoped>
.turtle-canvas-container {
  @apply h-full flex flex-col bg-white border border-gray-200 rounded;
}

.canvas-header {
  @apply flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200;
  height: 40px;
}

.canvas-content {
  @apply flex-1 relative overflow-hidden;
}

.turtle-canvas {
  @apply w-full h-full cursor-grab;
}

.turtle-canvas:active {
  @apply cursor-grabbing;
}
</style>
