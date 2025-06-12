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
  layer_name: string
  thickness?: number
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
  if (scale.value > 0.1) {
    ctx.fillStyle = '#666'
    ctx.font = `${Math.max(18, 24 / scale.value)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // X-axis label
    ctx.fillText('X', endX - 40, -30)

    // Y-axis label
    ctx.save()
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Y', 30, -endY + 40)
    ctx.restore()

    // Origin marker
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(0, 0, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillText('(0,0)', 20, -20)
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
      { name: 'Left', x: offset, y: offset, width: materialThickness, height: Y },
      { name: 'Rear', x: offset, y: 2 * offset + materialThickness, width: X, height: materialThickness },
      { name: 'Front', x: 3 * offset + X + materialThickness, y: 3 * offset + 2 * materialThickness, width: materialThickness, height: X },
      { name: 'Right', x: 2 * offset + X, y: 3 * offset + 2 * materialThickness, width: materialThickness, height: Y },
      { name: 'Top', x: offset, y: 3 * offset + 2 * materialThickness, width: X, height: Y },
      { name: 'Bottom', x: 4 * offset + X + 2 * materialThickness, y: 3 * offset + 2 * materialThickness, width: X, height: Y }
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

  // Check if this is a face layout command from ADekoDebugMode (should not be offset)
  const isFaceLayoutCommand = command.command_type === 'text' &&
    ['Left', 'Right', 'Top', 'Bottom', 'Front', 'Rear'].includes(command.text)

  // Check if this is part of the ADekoDebugMode face boundary system
  // ADekoDebugMode commands have black color and size 2.0, and are in specific coordinate ranges
  const isADekoDebugCommand = (command.color === 'black' && command.size === 2.0) ||
    (command.command_type === 'circle' && command.color === 'black' && command.size === 2.0) ||
    isFaceLayoutCommand

  // Check if this operation has 'SF' suffix in layer name (bottom face operations)
  const hasSFSuffix = command.layer_name && command.layer_name.includes('_SF')

  // Calculate positioning offsets based on face and operation type
  const gridSize = 20

  // Face positioning based on ADekoDebugMode layout and ADekoLib.moveToFace():
  // Using the exact coordinates from ADekoDebugMode.lua with offset=20, materialThickness=18
  const offset = 20
  const materialThickness = 18
  const X = 500  // Default cabinet width
  const Y = 700  // Default cabinet height

  // Face origins from ADekoLib.moveToFace():
  // Top face origin: zero(20+offset, 3*offset+2*mt) = zero(40, 96)
  // Bottom face origin: zero(20+4*offset+X+2*mt, 3*offset+2*mt) = zero(616, 96)
  const topFaceOriginX = 20 + offset  // 40
  const topFaceOriginY = 3 * offset + 2 * materialThickness  // 96
  const bottomFaceOriginX = 20 + 4 * offset + X + 2 * materialThickness  // 616
  const bottomFaceOriginY = 3 * offset + 2 * materialThickness  // 96

  // Determine if this command should be offset based on coordinate position and layer name
  // Bottom face operations appear at x >= bottomFaceOriginX (616) due to ADekoLib.moveToFace()
  // OR have 'SF' suffix in their layer name (which indicates bottom face operations)
  const isBottomFaceCommand = !isADekoDebugCommand && (command.x1 >= bottomFaceOriginX || hasSFSuffix)
  const isTopFaceCommand = !isADekoDebugCommand && !isBottomFaceCommand

  let gridOffsetX = 0
  let gridOffsetY = 0

  if (isADekoDebugCommand) {
    // ADekoDebugMode commands: no offset (they already have correct positioning)
    gridOffsetX = 0
    gridOffsetY = 0
  } else if (isBottomFaceCommand) {
    // Bottom face operations: commands come with coordinates like x=650-1040
    // The bottom face region in the visual layout starts at x=616
    // But the commands might need to be repositioned to appear correctly
    //
    // Looking at the console output, commands have coordinates like:
    // x=651-1041, which should be in the bottom face region (starts at x=616)
    // But they're appearing in the wrong visual position
    //
    // Let me try moving them to the correct visual position by applying
    // a negative offset to bring them back to the proper location
    //
    // Bottom face commands need to be positioned in the bottom-right area
    // Commands come with coordinates like x=650-1040 from ADekoLib.moveToFace()
    // The correct offset to position them in the bottom face region is:
    gridOffsetX = 620   // Move right to position in bottom face area
    gridOffsetY = -100  // Move up to align with bottom face region
  } else {
    // Top face operations: apply grid offset (1 grid right, 5 grids up, +4mm down)
    gridOffsetX = 1 * gridSize
    gridOffsetY = -5 * gridSize + 4
  }

  // Debug logging for bottom face positioning (can be removed in production)
  if (isBottomFaceCommand) {
    console.log('Bottom face command positioned:', {
      originalCoords: `(${command.x1}, ${command.y1})`,
      finalCoords: `(${command.x1 + gridOffsetX}, ${-command.y1 + gridOffsetY})`,
      offset: `(${gridOffsetX}, ${gridOffsetY})`
    })
  }

  console.log('Canvas context settings:', {
    strokeStyle: ctx.strokeStyle,
    lineWidth: ctx.lineWidth,
    fillStyle: ctx.fillStyle,
    isFaceLayout: isFaceLayoutCommand,
    isADekoDebug: isADekoDebugCommand,
    isTopFace: isTopFaceCommand,
    isBottomFace: isBottomFaceCommand,
    hasSFSuffix: hasSFSuffix,
    layerName: command.layer_name,
    originalX1: command.x1,
    originalY1: command.y1,
    finalX: command.x1 + gridOffsetX,
    finalY: -command.y1 + gridOffsetY,
    offsetX: gridOffsetX,
    offsetY: gridOffsetY,
    topFaceOrigin: `(${topFaceOriginX}, ${topFaceOriginY})`,
    bottomFaceOrigin: `(${bottomFaceOriginX}, ${bottomFaceOriginY})`
  })

  switch (command.command_type) {
    case 'line':
      const x1 = command.x1 + gridOffsetX
      const y1 = -command.y1 + gridOffsetY
      const x2 = command.x2 + gridOffsetX
      const y2 = -command.y2 + gridOffsetY
      console.log('Drawing line from', x1, y1, 'to', x2, y2)
      ctx.beginPath()
      ctx.moveTo(x1, y1) // Apply grid offset and flip Y coordinate
      ctx.lineTo(x2, y2)
      ctx.stroke()
      console.log('Line drawn')
      break

    case 'circle':
      ctx.beginPath()
      if (command.radius <= 2.0) {
        console.log('Drawing circle with negative radius. Skipping...')
        break
      }
      const cx = command.x1 + gridOffsetX
      const cy = -command.y1 + gridOffsetY
      ctx.arc(cx, cy, command.radius, 0, 2 * Math.PI)
      ctx.stroke()
      break

    case 'rectangle':
      const width = command.x2 - command.x1
      const height = command.y2 - command.y1
      const rx = command.x1 + gridOffsetX
      const ry = -command.y2 + gridOffsetY
      if (command.radius > 0) {
        // Rounded rectangle
        const radius = Math.min(command.radius, Math.abs(width) / 2, Math.abs(height) / 2)
        ctx.beginPath()
        ctx.roundRect(rx, ry, width, height, radius)
        ctx.stroke()
      } else {
        ctx.strokeRect(rx, ry, width, height)
      }
      break

    case 'text':
      // Make text much bigger - multiply by 4 and ensure minimum size of 32px
      const fontSize = Math.max(20, (command.size || 12) * 1.5)
      ctx.font = `${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const tx = command.x1 + gridOffsetX
      const ty = -command.y1 + gridOffsetY
      ctx.fillText(command.text, tx, ty)
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
