<template>
  <div class="turtle-canvas-container">
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'


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

  // Set up coordinate system (ADekoLib-compatible origin)
  ctx.save()

  // Check if we have ADekoLib-style face layout (door schemas)
  const hasADekoLibLayout = props.drawCommands.some(cmd =>
    cmd.command_type === 'text' &&
    ['Left', 'Right', 'Top', 'Bottom', 'Front', 'Rear'].includes(cmd.text)
  )

  if (hasADekoLibLayout) {
    // Use top-left origin for ADekoLib face layout compatibility
    ctx.translate(offsetX.value, offsetY.value)
    ctx.scale(scale.value, scale.value)
    console.log('Canvas transform applied (ADekoLib mode): translate', offsetX.value, offsetY.value, 'scale', scale.value)
  } else {
    // Use center origin for simple turtle graphics
    ctx.translate(canvas.width / 2 + offsetX.value, canvas.height / 2 + offsetY.value)
    ctx.scale(scale.value, scale.value)
    console.log('Canvas transform applied (center mode): translate', canvas.width / 2 + offsetX.value, canvas.height / 2 + offsetY.value, 'scale', scale.value)
  }

  // Draw grid
  drawGrid(ctx, canvas.width, canvas.height)

  // Draw face layout guides (ZeroBrane-style)
  drawFaceLayoutGuides(ctx)

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

  // Check if we have ADekoLib-style face layout
  const hasADekoLibLayout = props.drawCommands.some(cmd =>
    cmd.command_type === 'text' &&
    ['Left', 'Right', 'Top', 'Bottom', 'Front', 'Rear'].includes(cmd.text)
  )

  let centerX, centerY, halfWidth, halfHeight

  if (hasADekoLibLayout) {
    // Top-left origin coordinate system
    centerX = -offsetX.value / scale.value
    centerY = -offsetY.value / scale.value
    halfWidth = width / scale.value
    halfHeight = height / scale.value
  } else {
    // Center origin coordinate system
    centerX = -offsetX.value / scale.value
    centerY = -offsetY.value / scale.value
    halfWidth = width / (2 * scale.value)
    halfHeight = height / (2 * scale.value)
  }

  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 0.5

  // Vertical lines
  const startX = hasADekoLibLayout ? centerX : centerX - halfWidth
  const endX = hasADekoLibLayout ? centerX + halfWidth : centerX + halfWidth
  const startY = hasADekoLibLayout ? centerY : centerY - halfHeight
  const endY = hasADekoLibLayout ? centerY + halfHeight : centerY + halfHeight

  for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
    ctx.stroke()
  }

  // Draw axes with different colors for better visibility
  // X-axis (red)
  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(startX, 0)
  ctx.lineTo(endX, 0)
  ctx.stroke()

  // Y-axis (teal)
  ctx.strokeStyle = '#4ecdc4'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, startY)
  ctx.lineTo(0, endY)
  ctx.stroke()

  // Add axis labels if scale is appropriate
  if (scale.value > 0.3) {
    ctx.fillStyle = '#666'
    ctx.font = `${Math.max(10, 12 / scale.value)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // X-axis label
    ctx.fillText('X', endX - 20, -15)

    // Y-axis label
    ctx.save()
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Y', 15, -endY + 20)
    ctx.restore()

    // Origin marker
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(0, 0, 3, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillText('(0,0)', 10, -10)
  }
}

const drawFaceLayoutGuides = (ctx: CanvasRenderingContext2D) => {
  // Draw ZeroBrane-style face layout guides if we detect face layout commands
  const hasTextCommands = props.drawCommands.some(cmd =>
    cmd.command_type === 'text' &&
    ['Left', 'Right', 'Top', 'Bottom', 'Front', 'Rear'].includes(cmd.text)
  )

  if (hasTextCommands) {
    ctx.strokeStyle = '#ffd93d'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    // Draw face boundary indicators based on ADekoDebugMode.lua layout
    // Using the exact coordinates from ADekoDebugMode.lua with offset=20, materialThickness=18
    const offset = 20
    const materialThickness = 18
    const X = 500  // Default cabinet width
    const Y = 700  // Default cabinet height

    const faceRegions = [
      { name: 'Left', x: 20 + offset, y: offset, width: materialThickness, height: Y },
      { name: 'Rear', x: 20 + offset, y: 2 * offset + materialThickness, width: X, height: materialThickness },
      { name: 'Front', x: 20 + 3 * offset + X + materialThickness, y: 3 * offset + 2 * materialThickness, width: materialThickness, height: X },
      { name: 'Right', x: 20 + 2 * offset + X, y: 3 * offset + 2 * materialThickness, width: materialThickness, height: Y },
      { name: 'Top', x: 20 + offset, y: 3 * offset + 2 * materialThickness, width: X, height: Y },
      { name: 'Bottom', x: 20 + 4 * offset + X + 2 * materialThickness, y: 3 * offset + 2 * materialThickness, width: X, height: Y }
    ]

    faceRegions.forEach(face => {
      ctx.strokeRect(face.x, face.y, face.width, face.height)
    })

    ctx.setLineDash([]) // Reset line dash
  }
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

// Expose functions for parent component
defineExpose({
  resetView,
  zoomIn,
  zoomOut
})

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
  @apply h-full relative overflow-hidden;
}

.turtle-canvas {
  @apply w-full h-full cursor-grab;
}

.turtle-canvas:active {
  @apply cursor-grabbing;
}
</style>
