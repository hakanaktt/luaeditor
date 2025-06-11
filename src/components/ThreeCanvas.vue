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
    
    <!-- Operation Layers Panel -->
    <div class="layers-panel">
      <div class="layers-header">
        <span class="text-xs font-medium text-gray-700">{{ $t('threeCanvas.layers') }}</span>
        <button
          @click="addLayer"
          class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          :title="$t('threeCanvas.addLayer')"
        >
          <Plus :size="12" />
        </button>
      </div>
      <div class="layers-list">
        <div
          v-for="layer in operationLayers"
          :key="layer.id"
          :class="['layer-item', { 'active': layer.id === activeLayerId }]"
          @click="setActiveLayer(layer.id)"
        >
          <div class="layer-info">
            <div class="layer-name">{{ layer.name }}</div>
            <div class="layer-operation">{{ layer.operation }}</div>
          </div>
          <button
            @click.stop="removeLayer(layer.id)"
            class="layer-remove"
            :title="$t('threeCanvas.removeLayer')"
          >
            <X :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Plus, Minus, Scissors, RotateCcw, Grid3x3, X, Maximize2, Square } from 'lucide-vue-next'
import * as THREE from 'three'
import { CSG } from 'three-csg-ts'
import { OrbitControls } from '../utils/OrbitControls'

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

interface OperationLayer {
  id: string
  name: string
  operation: 'union' | 'subtract' | 'intersect'
  visible: boolean
  mesh?: THREE.Mesh
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
const setView = (viewType: 'front' | 'top' | 'right' | 'iso') => {
  const distance = 600
  const center = new THREE.Vector3(0, DOOR_HEIGHT / 2, 0)

  let position: THREE.Vector3

  switch (viewType) {
    case 'front':
      position = new THREE.Vector3(0, DOOR_HEIGHT / 2, distance)
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

// Watch for draw commands changes (future CSG operations)
watch(() => props.drawCommands, (newCommands) => {
  // TODO: Convert turtle graphics commands to CSG operations
  console.log('ThreeCanvas received draw commands:', newCommands.length)
}, { immediate: true })

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

.layers-panel {
  @apply absolute top-40 right-2 w-48 bg-white border border-gray-200 rounded shadow-lg;
  max-height: 250px;
}

.layers-header {
  @apply flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200;
}

.layers-list {
  @apply max-h-48 overflow-y-auto;
}

.layer-item {
  @apply flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100;
}

.layer-item.active {
  @apply bg-blue-50 border-blue-200;
}

.layer-info {
  @apply flex-1;
}

.layer-name {
  @apply text-sm font-medium text-gray-700;
}

.layer-operation {
  @apply text-xs text-gray-500 capitalize;
}

.layer-remove {
  @apply p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600;
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
