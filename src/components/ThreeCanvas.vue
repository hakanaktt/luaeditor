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
        <!-- CSG Apply Button -->
        <button
          @click="applyCSGOperations"
          class="p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 hover:text-blue-900 font-medium border border-blue-300"
          title="Apply CSG Operations - Subtract tools from door"
        >
          <Zap :size="16" />
          <span class="ml-1 text-xs">CSG</span>
        </button>
        <!-- Advanced Toolpath CSG Button -->
        <button
          @click="applyToolpathCSG"
          class="p-2 bg-green-100 hover:bg-green-200 rounded text-green-700 hover:text-green-900 font-medium border border-green-300"
          title="Advanced Toolpath CSG - Progressive material removal"
        >
          <CornerDownRight :size="16" />
          <span class="ml-1 text-xs">Advanced</span>
        </button>

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
              <component :is="getToolIcon(toolLayer.analysis.tool.shape || 'cylindrical')" :size="12" />
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
import { SUBTRACTION, ADDITION, INTERSECTION, Brush, Evaluator } from 'three-bvh-csg'
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

// CSG evaluator instance
const csgEvaluator = new Evaluator()

// Test CSG functionality
const testCSGOperations = () => {
  console.log('Testing three-bvh-csg functionality...')

  try {
    // Create two simple test geometries
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2)
    const sphereGeometry = new THREE.SphereGeometry(1.5, 16, 16)

    // Create brushes
    const boxBrush = new Brush(boxGeometry)
    boxBrush.updateMatrixWorld()

    const sphereBrush = new Brush(sphereGeometry)
    sphereBrush.position.set(1, 0, 0)
    sphereBrush.updateMatrixWorld()

    // Test subtraction operation
    const result = csgEvaluator.evaluate(boxBrush, sphereBrush, SUBTRACTION)

    console.log('✅ CSG test successful! Result geometry:', {
      vertices: result.geometry.attributes.position.count,
      faces: result.geometry.index ? result.geometry.index.count / 3 : 0
    })

    return true
  } catch (error) {
    console.error('❌ CSG test failed:', error)
    return false
  }
}

// Group tool objects by layer for organized processing
const groupToolObjectsByLayer = (): Map<string, THREE.Mesh[]> => {
  const toolObjectsByLayer = new Map<string, THREE.Mesh[]>()

  const toolObjects = scene.children.filter(child => child.userData?.isToolObject) as THREE.Mesh[]
  console.log(`🔍 Found ${toolObjects.length} tool objects in scene (total children: ${scene.children.length})`)

  toolObjects.forEach((toolMesh, index) => {
    const layerName = toolMesh.userData.layerName || 'unknown'
    console.log(`  Tool ${index + 1}: layer="${layerName}", position=(${toolMesh.position.x.toFixed(1)}, ${toolMesh.position.y.toFixed(1)}, ${toolMesh.position.z.toFixed(1)})`)

    if (!toolObjectsByLayer.has(layerName)) {
      toolObjectsByLayer.set(layerName, [])
    }
    toolObjectsByLayer.get(layerName)!.push(toolMesh)
  })

  console.log(`📊 Grouped into ${toolObjectsByLayer.size} layers:`, Array.from(toolObjectsByLayer.keys()))

  return toolObjectsByLayer
}

// Determine the appropriate CSG operation for a layer
const getOperationForLayer = (layerName: string, defaultOperation: string = 'subtract'): 'union' | 'subtract' | 'intersect' => {
  const lowerLayer = layerName.toLowerCase()

  // Bottom face operations (SF suffix) are typically additive
  if (lowerLayer.includes('sf')) {
    return 'union'
  }

  // Most CNC operations are subtractive
  if (lowerLayer.includes('roughing') ||
      lowerLayer.includes('finishing') ||
      lowerLayer.includes('drilling') ||
      lowerLayer.includes('pocketing') ||
      lowerLayer.includes('profiling')) {
    return 'subtract'
  }

  // Use provided operation or default to subtract
  return (defaultOperation as 'union' | 'subtract' | 'intersect') || 'subtract'
}

// Enhanced operation detection with more specific patterns
const detectOperationFromLayer = (layerName: string): string => {
  const lowerLayer = layerName.toLowerCase()

  // ADekoLib specific patterns (Turkish CNC software)
  if (lowerLayer.includes('cep_acma') || lowerLayer.includes('cep')) {
    return 'pocketing'
  }
  if (lowerLayer.includes('freze') && lowerLayer.includes('dis')) {
    return 'profiling' // External milling
  }
  if (lowerLayer.includes('freze') && lowerLayer.includes('ic')) {
    return 'pocketing' // Internal milling
  }
  if (lowerLayer.includes('aciliv') || lowerLayer.includes('v')) {
    return 'profiling' // V-groove operations
  }
  if (lowerLayer.includes('freze')) {
    return 'roughing' // General milling
  }
  if (lowerLayer.includes('panel')) {
    return 'roughing' // Panel cutting
  }

  // Standard patterns
  if (lowerLayer.includes('kaba') || lowerLayer.includes('roughing')) {
    return 'roughing'
  }
  if (lowerLayer.includes('son') || lowerLayer.includes('finishing')) {
    return 'finishing'
  }
  if (lowerLayer.includes('pocket')) {
    return 'pocketing'
  }
  if (lowerLayer.includes('delme') || lowerLayer.includes('drilling') || lowerLayer.includes('drill')) {
    return 'drilling'
  }
  if (lowerLayer.includes('profil') || lowerLayer.includes('profile') || lowerLayer.includes('profiling')) {
    return 'profiling'
  }

  // Default based on common patterns
  if (lowerLayer.includes('hole') || lowerLayer.includes('delik')) {
    return 'drilling'
  }
  if (lowerLayer.includes('groove') || lowerLayer.includes('oluk')) {
    return 'profiling'
  }
  if (lowerLayer.includes('frame') || lowerLayer.includes('cerceve')) {
    return 'profiling'
  }

  return 'roughing' // Default operation
}

// Apply toolpath-specific CSG operations with progress tracking
const applyToolpathCSG = async () => {
  console.log('🚀 Starting advanced toolpath CSG processing...')

  const baseLayer = operationLayers.value.find(l => l.id === 'base')
  if (!baseLayer || !baseLayer.mesh) {
    console.error('❌ No base mesh found for toolpath CSG operations')
    return
  }

  const toolObjectsByLayer = groupToolObjectsByLayer()
  console.log(`📊 Found ${toolObjectsByLayer.size} layers with tool objects`)

  if (toolObjectsByLayer.size === 0) {
    console.warn('⚠️ No tool objects found for CSG operations')
    console.log('🔧 Creating tool objects from draw commands first...')
    createToolObjects()

    // Try again after creating tool objects
    const newToolObjectsByLayer = groupToolObjectsByLayer()
    console.log(`📊 After creation: Found ${newToolObjectsByLayer.size} layers with tool objects`)

    if (newToolObjectsByLayer.size === 0) {
      console.warn('⚠️ Still no tool objects found after creation attempt')
      return
    }
    console.log(`✅ Created tool objects for ${newToolObjectsByLayer.size} layers`)
  }

  let workpiece = baseLayer.mesh.clone()
  let totalOperations = 0
  let successfulOperations = 0

  // Count total operations
  toolObjectsByLayer.forEach(toolObjects => {
    totalOperations += toolObjects.length
  })

  console.log(`📊 Processing ${totalOperations} operations across ${toolObjectsByLayer.size} layers`)

  // Process operations in realistic machining order
  const processingOrder = [
    { type: 'drilling', priority: 1 },
    { type: 'roughing', priority: 2 },
    { type: 'pocketing', priority: 3 },
    { type: 'profiling', priority: 4 },
    { type: 'finishing', priority: 5 }
  ]

  for (const { type: operationType } of processingOrder) {
    for (const [layerName, toolObjects] of toolObjectsByLayer) {
      const layerOperation = detectOperationFromLayer(layerName)

      if (layerOperation === operationType) {
        console.log(`🔧 Processing ${layerName} (${operationType}) - ${toolObjects.length} operations`)

        for (let i = 0; i < toolObjects.length; i++) {
          const toolMesh = toolObjects[i]
          const operation = getOperationForLayer(layerName, toolMesh.userData.operation)

          console.log(`  ⚙️ ${successfulOperations + 1}/${totalOperations}: ${operation} with ${toolMesh.userData.tool?.name || 'unknown tool'}`)

          try {
            const result = performCSGOperation(workpiece, toolMesh, operation)
            if (result) {
              // Remove old workpiece from scene if it's not the original
              if (workpiece !== baseLayer.mesh) {
                scene.remove(workpiece)
              }
              workpiece = result
              successfulOperations++

              // Add progress indicator
              const progress = Math.round((successfulOperations / totalOperations) * 100)
              console.log(`    ✅ Success! Progress: ${progress}%`)
            } else {
              console.warn(`    ❌ CSG operation failed for ${layerName}`)
            }
          } catch (error) {
            console.error(`    💥 CSG operation error for ${layerName}:`, error)
          }

          // Small delay to prevent UI blocking
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }
      }
    }
  }

  // Finalize the result
  if (workpiece !== baseLayer.mesh && successfulOperations > 0) {
    scene.remove(baseLayer.mesh)
    scene.add(workpiece)
    baseLayer.mesh = workpiece

    // Update material to show machined surface
    workpiece.material = new THREE.MeshLambertMaterial({
      color: 0xDEB887, // Machined wood color
      transparent: true,
      opacity: 0.95
    })

    // Hide tool objects
    scene.children.filter(child => child.userData?.isToolObject).forEach(toolMesh => {
      toolMesh.visible = false
    })

    console.log(`🎉 Toolpath CSG completed! ${successfulOperations}/${totalOperations} operations successful`)
  } else {
    console.log('ℹ️ No toolpath CSG operations were applied')
  }
}





// Door dimensions from TurtleCanvas.vue (actual model dimensions)
const DOOR_WIDTH = 500
const DOOR_HEIGHT = 700
const DOOR_THICKNESS = 18

// Coordinate conversion from 2D canvas to 3D scene
const convert2DTo3D = (command: DrawCommand) => {
  // Apply the same coordinate transformations as TurtleCanvas.vue
  const gridSize = 20
  const offset = 20
  const materialThickness = 18
  const X = 540 // Door width from ADekoLib
  const bottomFaceOriginX = 20 + 4 * offset + X + 2 * materialThickness // 616

  // Determine face type and apply appropriate offsets (matching TurtleCanvas.vue exactly)
  const hasSFSuffix = command.layer_name && command.layer_name.includes('_SF')
  const isBottomFaceCommand = command.x1 >= bottomFaceOriginX || hasSFSuffix

  let gridOffsetX = 0
  let gridOffsetY = 0

  if (isBottomFaceCommand) {
    // Bottom face operations (matching TurtleCanvas.vue)
    gridOffsetX = 620
    gridOffsetY = -100
  } else {
    // Top face operations (matching TurtleCanvas.vue)
    gridOffsetX = 1 * gridSize
    gridOffsetY = -5 * gridSize + 4
  }

  // Apply the same transformations as TurtleCanvas.vue
  const canvas_x1 = command.x1 + gridOffsetX
  const canvas_y1 = -command.y1 + gridOffsetY
  const canvas_x2 = command.x2 + gridOffsetX
  const canvas_y2 = -command.y2 + gridOffsetY

  // Convert from canvas coordinates to 3D world coordinates
  // Map canvas coordinates to door dimensions (DOOR_WIDTH x DOOR_HEIGHT)
  const scale = 1.0 // Use 1:1 scale for better precision
  const doorCenterX = DOOR_WIDTH / 2  // 250
  const doorCenterZ = DOOR_HEIGHT / 2 // 350

  const x1_3d = (canvas_x1 - doorCenterX) * scale  // Center around door center
  const y1_3d = (canvas_y1 - doorCenterZ) * scale  // Center around door center
  const x2_3d = (canvas_x2 - doorCenterX) * scale
  const y2_3d = (canvas_y2 - doorCenterZ) * scale

  // Debug logging for coordinate conversion (disabled for performance)
  // console.log(`🔄 Converting 2D to 3D coordinates:`, {
  //   layer: command.layer_name,
  //   original2D: `(${command.x1}, ${command.y1}) -> (${command.x2}, ${command.y2})`,
  //   canvas2D: `(${canvas_x1}, ${canvas_y1}) -> (${canvas_x2}, ${canvas_y2})`,
  //   converted3D: `(${x1_3d.toFixed(1)}, ${y1_3d.toFixed(1)}) -> (${x2_3d.toFixed(1)}, ${y2_3d.toFixed(1)})`,
  //   offsets: `(${gridOffsetX}, ${gridOffsetY})`,
  //   isBottomFace: isBottomFaceCommand
  // })

  return {
    x1: x1_3d,
    y1: y1_3d,
    x2: x2_3d,
    y2: y2_3d,
    isBottomFace: isBottomFaceCommand
  }
}

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

  // Start render loop
  animate()
}

// Create the base door geometry
const createDoorBase = () => {
  // Create door geometry with correct orientation
  // In 3D: X = width, Y = thickness (depth), Z = height
  const geometry = new THREE.BoxGeometry(DOOR_WIDTH, DOOR_THICKNESS, DOOR_HEIGHT)
  const material = new THREE.MeshLambertMaterial({
    color: 0x8B4513,
    transparent: true,
    opacity: 0.8
  })

  const doorMesh = new THREE.Mesh(geometry, material)
  // Position door so the top surface is at Y=0 for easier tool positioning
  // Door extends from Y=0 (top surface) to Y=-18 (bottom surface)
  doorMesh.position.set(0, -DOOR_THICKNESS/2, 0)
  doorMesh.castShadow = true
  doorMesh.receiveShadow = true

  console.log(`🚪 Door positioned at Y=${doorMesh.position.y}, surface at Y=0, extends to Y=${-DOOR_THICKNESS}`)

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

// Convert operation string to CSG constant
const getCSGOperation = (operation: 'union' | 'subtract' | 'intersect') => {
  switch (operation) {
    case 'union':
      return ADDITION
    case 'subtract':
      return SUBTRACTION
    case 'intersect':
      return INTERSECTION
    default:
      return SUBTRACTION
  }
}

// Perform CSG operation between two meshes
const performCSGOperation = (meshA: THREE.Mesh, meshB: THREE.Mesh, operation: 'union' | 'subtract' | 'intersect'): THREE.Mesh | null => {
  try {
    // Create Brush objects from meshes
    const brushA = new Brush(meshA.geometry, meshA.material)
    brushA.position.copy(meshA.position)
    brushA.rotation.copy(meshA.rotation)
    brushA.scale.copy(meshA.scale)
    brushA.updateMatrixWorld()

    const brushB = new Brush(meshB.geometry, meshB.material)
    brushB.position.copy(meshB.position)
    brushB.rotation.copy(meshB.rotation)
    brushB.scale.copy(meshB.scale)
    brushB.updateMatrixWorld()

    // Perform CSG operation
    const csgOperation = getCSGOperation(operation)
    const result = csgEvaluator.evaluate(brushA, brushB, csgOperation)

    // Create result mesh
    const resultMesh = new THREE.Mesh(result.geometry, meshA.material)
    resultMesh.position.copy(meshA.position)
    resultMesh.rotation.copy(meshA.rotation)
    resultMesh.scale.copy(meshA.scale)
    resultMesh.castShadow = true
    resultMesh.receiveShadow = true

    return resultMesh
  } catch (error) {
    console.error('CSG operation failed:', error)
    return null
  }
}

// Apply CSG operations to all tool objects against the door base
const applyCSGOperations = () => {
  const baseLayer = operationLayers.value.find(l => l.id === 'base')
  if (!baseLayer || !baseLayer.mesh) {
    console.warn('No base mesh found for CSG operations')
    return
  }

  console.log('🔧 Starting toolpath CSG operations...')

  // Group tool objects by layer for organized processing
  const toolObjectsByLayer = groupToolObjectsByLayer()

  if (toolObjectsByLayer.size === 0) {
    console.log(' No tool objects found for CSG operations')
    console.log('🔧 Creating tool objects from draw commands first...')
    createToolObjects()

    // Try again after creating tool objects
    const newToolObjectsByLayer = groupToolObjectsByLayer()
    if (newToolObjectsByLayer.size === 0) {
      console.warn('⚠️ Still no tool objects found after creation attempt')
      return
    }
    console.log(`✅ Created tool objects for ${newToolObjectsByLayer.size} layers`)
  }

  let workpiece = baseLayer.mesh.clone()
  let operationCount = 0

  // Process each layer in order (roughing first, then finishing, etc.)
  const layerOrder = ['roughing', 'drilling', 'pocketing', 'profiling', 'finishing']

  layerOrder.forEach(operationType => {
    toolObjectsByLayer.forEach((toolObjects, layerName) => {
      const layerOperation = detectOperationFromLayer(layerName)

      if (layerOperation === operationType) {
        console.log(`🔨 Processing ${layerName} (${operationType}) - ${toolObjects.length} operations`)

        toolObjects.forEach((toolMesh, index) => {
          const operation = getOperationForLayer(layerName, toolMesh.userData.operation)

          console.log(`  ⚙️ Operation ${operationCount + 1}: ${operation} with ${toolMesh.userData.tool?.name || 'unknown tool'}`)

          const result = performCSGOperation(workpiece, toolMesh, operation)
          if (result) {
            // Remove old workpiece from scene if it's not the original
            if (workpiece !== baseLayer.mesh) {
              scene.remove(workpiece)
            }
            workpiece = result
            operationCount++
          } else {
            console.warn(`    ❌ CSG operation failed for ${layerName}`)
          }
        })
      }
    })
  })

  // Replace base mesh with final result
  if (workpiece !== baseLayer.mesh && operationCount > 0) {
    scene.remove(baseLayer.mesh)
    scene.add(workpiece)
    baseLayer.mesh = workpiece

    // Update workpiece material to show it's been machined
    if (workpiece.material instanceof THREE.Material) {
      workpiece.material = new THREE.MeshLambertMaterial({
        color: 0xDEB887, // Lighter wood color to show machining
        transparent: true,
        opacity: 0.9
      })
    }

    // Hide tool objects after CSG operations
    scene.children.filter(child => child.userData?.isToolObject).forEach(toolMesh => {
      toolMesh.visible = false
    })

    console.log(`✅ CSG operations completed! Applied ${operationCount} operations to workpiece`)
  } else {
    console.log('ℹ️ No CSG operations were applied')
  }
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
  const center = new THREE.Vector3(0, 0, 0)  // Door is now centered at origin

  let position: THREE.Vector3

  switch (viewType) {
    case 'front':
      position = new THREE.Vector3(0, 0, distance)
      break
    case 'back':
      position = new THREE.Vector3(0, 0, -distance)
      break
    case 'top':
      position = new THREE.Vector3(0, distance, 0)
      break
    case 'right':
      position = new THREE.Vector3(distance, 0, 0)
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

    // Convert 2D coordinates to 3D for all commands
    const convertedCommands = commands.map(cmd => {
      const coords3D = convert2DTo3D(cmd)
      return {
        ...cmd,
        x1_3d: coords3D.x1,
        y1_3d: coords3D.y1,
        x2_3d: coords3D.x2,
        y2_3d: coords3D.y2,
        isBottomFace: coords3D.isBottomFace
      }
    })

    // Create enhanced tool meshes for operations with converted coordinates
    const toolMeshes = cncToolService.createOperationToolMeshes(convertedCommands, tool, operation, thickness)

    toolMeshes.forEach((toolMesh, index) => {
      toolMesh.userData.isToolObject = true
      toolMesh.userData.layerName = layerName
      toolMesh.userData.toolIndex = index
      toolMesh.userData.tool = tool
      toolMesh.userData.operation = operation

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

      // Debug logging for tool positioning
      console.log(`  ➕ Added tool mesh ${index + 1}/${toolMeshes.length} for ${layerName}:`, {
        position: `(${toolMesh.position.x.toFixed(1)}, ${toolMesh.position.y.toFixed(1)}, ${toolMesh.position.z.toFixed(1)})`,
        tool: tool.name,
        operation: operation
      })

      scene.add(toolMesh)
    })
  })
}

// Tool icon helper
const getToolIcon = (shape: string | undefined | null) => {
  if (!shape) return Circle

  const icons = {
    cylindrical: Circle,
    conical: Triangle,
    ballnose: Zap,
    radial: CornerDownRight,
    special: Star
  }
  return icons[shape as keyof typeof icons] || Circle
}



// Expose methods for parent component
defineExpose({
  resetCamera,
  fitToView,
  toggleWireframe,
  toggleOrthographic,
  setView,
  setOperation,
  addLayer,
  applyCSGOperations,
  applyToolpathCSG,
  testCSGOperations
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
