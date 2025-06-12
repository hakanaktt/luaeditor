<template>
  <div class="three-canvas-container">
    <div class="three-toolbar">
      <div class="flex items-center space-x-2">
        <div class="text-xs text-gray-500">
          {{ $t('threeCanvas.csgOperations') }}
        </div>
      </div>
      <div class="flex items-center space-x-1">
        <!-- CSG Operation Tools -->
        <button
          @click="setOperation('union')"
          :class="['operation-btn', { 'active': currentOperation === 'union' }]"
          :title="$t('threeCanvas.union')"
        >
          <Plus :size="14" />
        </button>
        <button
          @click="setOperation('subtract')"
          :class="['operation-btn', { 'active': currentOperation === 'subtract' }]"
          :title="$t('threeCanvas.subtract')"
        >
          <Minus :size="14" />
        </button>
        <button
          @click="setOperation('intersect')"
          :class="['operation-btn', { 'active': currentOperation === 'intersect' }]"
          :title="$t('threeCanvas.intersect')"
        >
          <Scissors :size="14" />
        </button>
        <div class="separator"></div>
        <!-- View Controls -->
        <button
          @click="resetCamera"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('threeCanvas.resetView')"
        >
          <RotateCcw :size="14" />
        </button>
        <button
          @click="fitToView"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('threeCanvas.fitToView')"
        >
          <Maximize2 :size="14" />
        </button>
        <button
          @click="toggleWireframe"
          :class="['p-1 hover:bg-gray-100 rounded', wireframeMode ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          :title="$t('threeCanvas.wireframe')"
        >
          <Grid3x3 :size="14" />
        </button>
        <button
          @click="toggleOrthographic"
          :class="['p-1 hover:bg-gray-100 rounded', isOrthographic ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          :title="$t('threeCanvas.orthographic')"
        >
          <Square :size="14" />
        </button>
        <div class="separator"></div>
        <!-- Predefined Views -->
        <div class="view-buttons">
          <button
            @click="setView('front')"
            class="view-btn"
            :title="$t('threeCanvas.frontView')"
          >
            F
          </button>
          <button
            @click="setView('back')"
            class="view-btn"
            :title="$t('threeCanvas.backView')"
          >
            B
          </button>
          <button
            @click="setView('top')"
            class="view-btn"
            :title="$t('threeCanvas.topView')"
          >
            T
          </button>
          <button
            @click="setView('right')"
            class="view-btn"
            :title="$t('threeCanvas.rightView')"
          >
            R
          </button>
          <button
            @click="setView('iso')"
            class="view-btn"
            :title="$t('threeCanvas.isometricView')"
          >
            ISO
          </button>
        </div>
      </div>
    </div>
    
    <div ref="canvasContainer" class="three-canvas-wrapper">
      <!-- Three.js canvas will be inserted here -->

      <!-- Camera Controls Help -->
      <div class="camera-help">
        <div class="help-item">
          <span class="help-label">{{ $t('threeCanvas.rotate') }}:</span>
          <span class="help-text">{{ $t('threeCanvas.leftClick') }}</span>
        </div>
        <div class="help-item">
          <span class="help-label">{{ $t('threeCanvas.zoom') }}:</span>
          <span class="help-text">{{ $t('threeCanvas.mouseWheel') }}</span>
        </div>
        <div class="help-item">
          <span class="help-label">{{ $t('threeCanvas.pan') }}:</span>
          <span class="help-text">{{ $t('threeCanvas.rightClick') }}</span>
        </div>
      </div>
    </div>
    
    <!-- Tool Analysis Panel -->
    <div class="tool-analysis-panel">
      <div class="panel-header">
        <span class="text-xs font-medium text-gray-700">{{ $t('autoTool.detectedTools') }}</span>
      </div>
      <div class="tool-layers-list">
        <div
          v-for="toolLayer in detectedToolLayers"
          :key="toolLayer.layerName"
          class="tool-layer-item"
        >
          <div class="tool-layer-info">
            <div class="layer-name">{{ toolLayer.layerName }}</div>
            <div v-if="toolLayer.analysis.tool" class="tool-info">
              <component :is="getToolIcon(toolLayer.analysis.tool.shape)" :size="12" />
              <span class="tool-name">{{ toolLayer.analysis.tool.name }}</span>
              <span class="tool-diameter">⌀{{ toolLayer.analysis.tool.diameter }}mm</span>
            </div>
            <div v-else class="no-tool">{{ $t('autoTool.noToolDetected') }}</div>
            <div class="operation-info">
              <span class="operation">{{ toolLayer.analysis.operation }}</span>
              <span class="surface">{{ $t(`autoTool.${toolLayer.analysis.surface}Surface`) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Plus, Minus, Scissors, RotateCcw, Grid3x3, X, Maximize2, Square, Circle, Triangle, Zap, CornerDownRight, Star } from 'lucide-vue-next'
import * as THREE from 'three'
import { CSG } from 'three-csg-ts'
import { OrbitControls } from '../utils/OrbitControls'
import { layerToolDetector } from '@/services/layerToolDetector'
import type { LayerAnalysis } from '@/services/layerToolDetector'
import { cncToolService } from '@/services/cncToolService'
import type { CNCTool } from '@/types'

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

interface OperationLayer {
  id: string
  name: string
  operation: 'union' | 'subtract' | 'intersect'
  visible: boolean
  mesh?: THREE.Mesh
}

interface ToolLayer {
  layerName: string
  analysis: LayerAnalysis
  commands: DrawCommand[]
}

interface Props {
  drawCommands: DrawCommand[]
}

const props = withDefaults(defineProps<Props>(), {
  drawCommands: () => []
})

// Three.js scene setup
const canvasContainer = ref<HTMLDivElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
let perspectiveCamera: THREE.PerspectiveCamera
let orthographicCamera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number

// Door dimensions from TurtleCanvas.vue
const DOOR_WIDTH = 500
const DOOR_HEIGHT = 700
const DOOR_THICKNESS = 18

// CSG operations state
const currentOperation = ref<'union' | 'subtract' | 'intersect'>('subtract')
const wireframeMode = ref(false)
const isOrthographic = ref(false)
const operationLayers = ref<OperationLayer[]>([
  {
    id: 'base',
    name: 'Door Base',
    operation: 'union',
    visible: true
  }
])
const activeLayerId = ref('base')

// Tool analysis state
const detectedToolLayers = computed(() => {
  const layerMap = new Map<string, ToolLayer>()

  props.drawCommands.forEach(command => {
    const layerName = command.layer_name
    if (!layerName) return

    if (!layerMap.has(layerName)) {
      const analysis = layerToolDetector.analyzeLayer(layerName)
      layerMap.set(layerName, {
        layerName,
        analysis,
        commands: []
      })
    }

    layerMap.get(layerName)!.commands.push(command)
  })

  // Filter out non-machinable layers (LUA, LMM, etc.)
  return Array.from(layerMap.values()).filter(toolLayer =>
    toolLayer.analysis.operation !== 'non-machinable'
  )
})

// Initialize Three.js scene
const initThreeJS = () => {
  if (!canvasContainer.value) return

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f5f5)

  // Cameras
  const aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight

  // Perspective Camera
  perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000)
  perspectiveCamera.position.set(400, 300, 400)
  perspectiveCamera.lookAt(0, 0, 0)

  // Orthographic Camera
  const frustumSize = 800
  orthographicCamera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    0.1, 2000
  )
  orthographicCamera.position.set(400, 300, 400)
  orthographicCamera.lookAt(0, 0, 0)

  // Set initial camera
  camera = perspectiveCamera

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  canvasContainer.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera as THREE.PerspectiveCamera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.enableRotate = true
  controls.enablePan = true

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(100, 100, 50)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // Create door base geometry
  createDoorBase()

  // Add grid helper
  const gridHelper = new THREE.GridHelper(1000, 50, 0x888888, 0xcccccc)
  scene.add(gridHelper)

  // Add axes helper
  const axesHelper = new THREE.AxesHelper(100)
  scene.add(axesHelper)

  // Start render loop
  animate()
}

// Create the base door geometry
const createDoorBase = () => {
  const geometry = new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICKNESS)
  const material = new THREE.MeshLambertMaterial({ 
    color: 0x8B4513,
    transparent: true,
    opacity: 0.8
  })
  
  const doorMesh = new THREE.Mesh(geometry, material)
  doorMesh.position.set(0, DOOR_HEIGHT / 2, 0)
  doorMesh.castShadow = true
  doorMesh.receiveShadow = true
  
  scene.add(doorMesh)
  
  // Store in base layer
  const baseLayer = operationLayers.value.find(l => l.id === 'base')
  if (baseLayer) {
    baseLayer.mesh = doorMesh
  }
}

// Animation loop
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // Update controls
  if (controls) {
    controls.update()
  }

  renderer.render(scene, camera)
}

// CSG operation methods
const setOperation = (operation: 'union' | 'subtract' | 'intersect') => {
  currentOperation.value = operation
}

const addLayer = () => {
  const layerId = `layer_${Date.now()}`
  operationLayers.value.push({
    id: layerId,
    name: `Layer ${operationLayers.value.length}`,
    operation: currentOperation.value,
    visible: true
  })
  activeLayerId.value = layerId
}

const removeLayer = (layerId: string) => {
  if (layerId === 'base') return // Don't remove base layer
  
  const layerIndex = operationLayers.value.findIndex(l => l.id === layerId)
  if (layerIndex > -1) {
    const layer = operationLayers.value[layerIndex]
    if (layer.mesh) {
      scene.remove(layer.mesh)
    }
    operationLayers.value.splice(layerIndex, 1)
    
    if (activeLayerId.value === layerId) {
      activeLayerId.value = 'base'
    }
  }
}

const setActiveLayer = (layerId: string) => {
  activeLayerId.value = layerId
}

// View controls
const resetCamera = () => {
  camera.position.set(400, 300, 400)
  camera.lookAt(0, 0, 0)
  if (controls) {
    controls.reset()
  }
}

const fitToView = () => {
  // Calculate bounding box of all objects
  const box = new THREE.Box3()
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      box.expandByObject(object)
    }
  })

  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov * (Math.PI / 180) : 0.5
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))

    cameraZ *= 1.5 // Add some padding

    camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ)
    camera.lookAt(center)

    if (controls) {
      controls.target.copy(center)
      controls.update()
    }
  }
}

const toggleWireframe = () => {
  wireframeMode.value = !wireframeMode.value

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material instanceof THREE.Material) {
      object.material.wireframe = wireframeMode.value
    }
  })
}

const toggleOrthographic = () => {
  isOrthographic.value = !isOrthographic.value

  // Store current position and target
  const currentPosition = camera.position.clone()
  const currentTarget = controls ? controls.target.clone() : new THREE.Vector3()

  // Switch camera
  if (isOrthographic.value) {
    camera = orthographicCamera
  } else {
    camera = perspectiveCamera
  }

  // Restore position and target
  camera.position.copy(currentPosition)
  camera.lookAt(currentTarget)

  // Update controls
  if (controls) {
    controls.dispose()
    controls = new OrbitControls(camera as THREE.PerspectiveCamera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.copy(currentTarget)
    controls.update()
  }
}

// Predefined view positions
const setView = (viewType: 'front' | 'back' | 'top' | 'right' | 'iso') => {
  const distance = 600
  const center = new THREE.Vector3(0, DOOR_HEIGHT / 2, 0)

  let position: THREE.Vector3

  switch (viewType) {
    case 'front':
      position = new THREE.Vector3(0, DOOR_HEIGHT / 2, distance)
      break
    case 'back':
      position = new THREE.Vector3(0, DOOR_HEIGHT / 2, -distance)
      break
    case 'top':
      position = new THREE.Vector3(0, distance + DOOR_HEIGHT / 2, 0)
      break
    case 'right':
      position = new THREE.Vector3(distance, DOOR_HEIGHT / 2, 0)
      break
    case 'iso':
    default:
      position = new THREE.Vector3(distance * 0.7, distance * 0.7, distance * 0.7)
      break
  }

  camera.position.copy(position)
  camera.lookAt(center)

  if (controls) {
    controls.target.copy(center)
    controls.update()
  }
}

// Handle window resize
const handleResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return

  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  const aspect = width / height

  // Update both cameras
  if (perspectiveCamera) {
    perspectiveCamera.aspect = aspect
    perspectiveCamera.updateProjectionMatrix()
  }

  if (orthographicCamera) {
    const frustumSize = 800
    orthographicCamera.left = frustumSize * aspect / -2
    orthographicCamera.right = frustumSize * aspect / 2
    orthographicCamera.top = frustumSize / 2
    orthographicCamera.bottom = frustumSize / -2
    orthographicCamera.updateProjectionMatrix()
  }

  renderer.setSize(width, height)
}

// Lifecycle
onMounted(() => {
  initThreeJS()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)

  if (controls) {
    controls.dispose()
  }

  if (renderer) {
    renderer.dispose()
  }
})

// Watch for draw commands changes and create tool objects for CSG operations
watch(() => props.drawCommands, (newCommands) => {
  console.log('ThreeCanvas received draw commands:', newCommands.length)
  if (scene) {
    createToolObjects()
  }
}, { immediate: true })

// Create 3D tool objects from draw commands for CSG subtraction
const createToolObjects = () => {
  if (!props.drawCommands || props.drawCommands.length === 0) {
    return
  }

  // Clear existing tool objects
  const existingTools = scene.children.filter(child => child.userData?.isToolObject)
  existingTools.forEach(tool => scene.remove(tool))

  // Group commands by layer and create tool objects
  const layerGroups = new Map<string, DrawCommand[]>()

  props.drawCommands.forEach(command => {
    if (!layerGroups.has(command.layer_name)) {
      layerGroups.set(command.layer_name, [])
    }
    layerGroups.get(command.layer_name)!.push(command)
  })

  layerGroups.forEach((commands, layerName) => {
    // Skip non-machinable layers
    if (layerName.toLowerCase().includes('lua') ||
        layerName.toLowerCase().startsWith('lmm')) {
      return
    }

    // Detect tool for this layer
    const tool = cncToolService.detectToolFromLayerName(layerName)
    if (!tool) {
      console.warn(`No tool detected for layer: ${layerName}`)
      return
    }

    // Get thickness from commands (use first command with thickness, or default)
    const commandWithThickness = commands.find(cmd => cmd.thickness !== undefined && cmd.thickness !== null)
    const thickness = commandWithThickness?.thickness ? Math.abs(commandWithThickness.thickness) : 5

    console.log(`Creating tool objects for layer ${layerName} with tool ${tool.name} and thickness ${thickness}`)

    // Detect operation type from layer name
    const operation = detectOperationFromLayer(layerName)

    // Create enhanced tool meshes for operations
    const toolMeshes = cncToolService.createOperationToolMeshes(commands, tool, operation, thickness)

    toolMeshes.forEach((toolMesh, index) => {
      toolMesh.userData.isToolObject = true
      toolMesh.userData.layerName = layerName
      toolMesh.userData.toolIndex = index

      // Set material color based on tool type
      const material = toolMesh.material as THREE.MeshLambertMaterial
      switch (tool.shape) {
        case 'cylindrical':
          material.color.setHex(0x888888)
          break
        case 'conical':
          material.color.setHex(0x666666)
          break
        case 'ballnose':
          material.color.setHex(0x999999)
          break
        case 'radial':
          material.color.setHex(0x777777)
          break
        case 'special':
          material.color.setHex(0x555555)
          break
      }

      scene.add(toolMesh)
    })
  })
}

// Tool icon helper
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

// Detect operation type from layer name
const detectOperationFromLayer = (layerName: string): string => {
  const layer = layerName.toLowerCase()

  if (layer.includes('roughing') || layer.includes('kaba') || layer.includes('rough')) {
    return 'roughing'
  }
  if (layer.includes('finishing') || layer.includes('son') || layer.includes('finish')) {
    return 'finishing'
  }
  if (layer.includes('pocket') || layer.includes('cep') || layer.includes('oyuk')) {
    return 'pocketing'
  }
  if (layer.includes('drill') || layer.includes('delme') || layer.includes('hole')) {
    return 'drilling'
  }
  if (layer.includes('profile') || layer.includes('profil') || layer.includes('contour')) {
    return 'profiling'
  }
  if (layer.includes('v_') || layer.includes('v-') || layer.includes('groove')) {
    return 'profiling'
  }

  // Default operation based on layer prefix
  if (layer.startsWith('h_')) {
    return 'profiling' // Contour operations
  }
  if (layer.startsWith('k_')) {
    return 'profiling' // Groove operations
  }
  if (layer.startsWith('v_')) {
    return 'profiling' // V-groove operations
  }

  return 'roughing' // Default operation
}

// Expose methods for parent component
defineExpose({
  resetCamera,
  fitToView,
  toggleWireframe,
  toggleOrthographic,
  setView,
  setOperation,
  addLayer
})
</script>

<style scoped>
.three-canvas-container {
  @apply h-full flex flex-col bg-white;
}

.three-toolbar {
  @apply flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200;
  height: 40px;
}

.operation-btn {
  @apply p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors;
}

.operation-btn.active {
  @apply bg-blue-100 text-blue-600;
}

.separator {
  @apply w-px h-4 bg-gray-300 mx-1;
}

.three-canvas-wrapper {
  @apply flex-1 relative;
}

.tool-analysis-panel {
  @apply absolute top-40 right-2 w-64 bg-white border border-gray-200 rounded shadow-lg;
  max-height: 400px;
}

.panel-header {
  @apply flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200;
}

.tool-layers-list {
  @apply max-h-80 overflow-y-auto;
}

.tool-layer-item {
  @apply px-3 py-2 border-b border-gray-100;
}

.tool-layer-info {
  @apply space-y-1;
}

.layer-name {
  @apply text-sm font-medium text-gray-700 font-mono;
}

.tool-info {
  @apply flex items-center space-x-2 text-xs;
}

.tool-name {
  @apply text-gray-600;
}

.tool-diameter {
  @apply text-gray-500 font-mono;
}

.no-tool {
  @apply text-xs text-gray-400 italic;
}

.operation-info {
  @apply flex items-center space-x-2 text-xs;
}

.operation {
  @apply bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize;
}

.surface {
  @apply bg-green-100 text-green-800 px-2 py-1 rounded;
}

.view-buttons {
  @apply flex items-center space-x-1;
}

.view-btn {
  @apply px-2 py-1 text-xs font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-help {
  @apply absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs rounded p-2 space-y-1;
  backdrop-filter: blur(4px);
}

.help-item {
  @apply flex items-center space-x-2;
}

.help-label {
  @apply font-medium text-gray-300;
}

.help-text {
  @apply text-gray-100;
}
</style>
