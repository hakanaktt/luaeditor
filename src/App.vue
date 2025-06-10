<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- Menu Bar -->
    <MenuBar
      :has-open-file="!!currentFile"
      @new-file="handleNewFile"
      @open-file="handleOpenFile"
      @save-file="handleSaveFile"
      @save-as="handleSaveAs"
      @undo="handleUndo"
      @redo="handleRedo"
      @cut="handleCut"
      @copy="handleCopy"
      @paste="handlePaste"
      @select-all="handleSelectAll"
      @find="handleFind"
      @replace="handleReplace"
      @toggle-sidebar="handleToggleSidebar"
      @toggle-function-browser="handleToggleFunctionBrowser"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @reset-zoom="handleResetZoom"
      @run-script="handleRunScript"
      @run-with-debug="handleRunWithDebug"
      @stop-execution="handleStopExecution"
      @toggle-debug-console="handleToggleDebugConsole"
      @clear-debug-console="handleClearDebugConsole"
      @toggle-settings="showSettingsModal = true"
      @show-function-browser="handleShowFunctionBrowser"
      @validate-lua="handleValidateLua"
      @format-code="handleFormatCode"
      @show-documentation="handleShowDocumentation"
      @show-keyboard-shortcuts="handleShowKeyboardShortcuts"
      @show-about="handleShowAbout"
    />

    <Toolbar
      :has-open-file="!!currentFile"
      :zoom-level="zoomLevel"
      :current-file-name="currentFileName"
      @new-file="handleNewFile"
      @open-file="handleOpenFile"
      @save-file="handleSaveFile"
      @undo="handleUndo"
      @redo="handleRedo"
      @run-script="handleRunScript"
      @run-with-debug="handleRunWithDebug"
      @stop-execution="handleStopExecution"
      @toggle-sidebar="handleToggleSidebar"
      @toggle-debug-console="handleToggleDebugConsole"
      @show-function-browser="handleShowFunctionBrowser"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
    />
    
    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Expanded Visualization Panel (covers whole area) -->
      <div v-if="isVisualizationExpanded && activeTab === 'visualization'" class="flex-1">
        <VisualizationPanel
          ref="visualizationPanelRef"
          :draw-commands="currentDrawCommands"
          @clear-visualization="handleClearVisualization"
          @toggle-expanded="handleToggleVisualizationExpanded"
        />
      </div>

      <!-- Normal Layout (when visualization is not expanded) -->
      <template v-else>
        <!-- Sidebar -->
        <div class="flex">
          <!-- Icon Bar -->
          <div class="w-12 bg-gray-800 border-r border-gray-600 flex flex-col">
            <!-- Navigation Icons -->
            <div class="flex flex-col">
              <button
                :class="['w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors',
                         activeTab === 'files' ? 'text-white bg-gray-700 border-r-2 border-blue-500' : '']"
                @click="activeTab = 'files'"
                :title="$t('tabs.files')"
              >
                <FolderOpen :size="20" />
              </button>
              <button
                :class="['w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors',
                         activeTab === 'functions' ? 'text-white bg-gray-700 border-r-2 border-blue-500' : '']"
                @click="activeTab = 'functions'"
                :title="$t('tabs.functions')"
              >
                <Code :size="20" />
              </button>
              <button
                :class="['w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors',
                         activeTab === 'visualization' ? 'text-white bg-gray-700 border-r-2 border-blue-500' : '']"
                @click="activeTab = 'visualization'"
                :title="$t('tabs.visualization')"
              >
                <BarChart3 :size="20" />
              </button>
            </div>
          </div>

          <!-- Content Panel -->
          <div
            v-if="sidebarWidth > 48"
            class="bg-gray-50 border-r border-gray-200 relative flex-shrink-0 transition-all duration-75"
            :class="{ 'select-none': isResizing }"
            :style="{ width: (sidebarWidth - 48) + 'px' }"
          >
            <div class="h-full flex flex-col">
              <!-- Panel Header -->
              <div class="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
                <span class="text-sm font-medium text-gray-700">
                  {{ activeTab === 'files' ? $t('tabs.files') :
                     activeTab === 'functions' ? $t('tabs.functions') :
                     $t('tabs.visualization') }}
                </span>
              </div>

              <!-- Panel Content -->
              <div class="flex-1 overflow-hidden">
                <FileExplorer
                  v-show="activeTab === 'files'"
                  :current-directory="currentDirectory"
                  :model-library-path="appSettings.model_library_path"
                  @file-selected="handleFileSelected"
                  @directory-changed="handleDirectoryChanged"
                />
                <FunctionBrowser
                  v-show="activeTab === 'functions'"
                  :on-insert-function="handleInsertFunction"
                  :editor-content="currentFileContent"
                />
                <VisualizationPanel
                  v-show="activeTab === 'visualization'"
                  ref="visualizationPanelRef"
                  :draw-commands="currentDrawCommands"
                  @clear-visualization="handleClearVisualization"
                  @toggle-expanded="handleToggleVisualizationExpanded"
                />
              </div>
            </div>

            <!-- Resize Handle -->
            <div
              class="sidebar-resize-handle"
              @mousedown="startResize"
            ></div>
          </div>
        </div>

        <!-- Editor Area -->
        <div class="flex-1 flex flex-col">
          <div class="flex-1 flex flex-col">
            <Editor
              v-if="currentFile"
              ref="editorRef"
              :file-content="currentFileContent"
              :file-path="currentFile"
              @content-changed="handleContentChanged"
              @cursor-position-changed="handleCursorPositionChanged"
            />
            <div v-else class="flex-1 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <h2 class="text-xl mb-2">{{ $t('app.welcome') }}</h2>
                <p>{{ $t('app.welcomeMessage') }}</p>
              </div>
            </div>
          </div>

          <!-- Debug Console -->
          <DebugConsole
            v-if="showDebugConsole"
            ref="debugConsoleRef"
            :is-visible="showDebugConsole"
            :draw-commands="currentDrawCommands"
            @toggle-visibility="handleToggleDebugConsole"
          />
        </div>
      </template>
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      :is-open="showSettingsModal"
      :settings="appSettings"
      @close="showSettingsModal = false"
      @settings-updated="handleSettingsUpdated"
    />

    <!-- Keyboard Shortcuts Modal -->
    <KeyboardShortcutsModal
      :is-visible="showKeyboardShortcutsModal"
      @close="showKeyboardShortcutsModal = false"
    />

    <!-- About Modal -->
    <AboutModal
      :is-visible="showAboutModal"
      @close="showAboutModal = false"
    />

    <!-- Status Bar -->
    <div class="h-6 bg-blue-600 text-white text-xs flex items-center px-2">
      <span v-if="currentFile">{{ currentFile }}</span>
      <span v-else>{{ $t('app.noFileOpen') }}</span>
      <div class="ml-auto flex items-center space-x-4">
        <span v-if="currentFile" class="flex items-center space-x-1">
          <span>{{ $t('status.line') }} {{ currentLine }}, {{ $t('status.column') }} {{ currentColumn }}</span>
        </span>
        <span v-if="isModified" class="mr-2">{{ $t('status.modified') }}</span>
        <span>{{ $t('status.luaMacroEditor') }}</span>
      </div>
    </div>

    <!-- Notification System -->
    <NotificationSystem ref="notificationSystemRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import MenuBar from './components/MenuBar.vue'
import Toolbar from './components/Toolbar.vue'
import FileExplorer from './components/FileExplorer.vue'
import Editor from './components/Editor.vue'
import SettingsModal from './components/SettingsModal.vue'
import FunctionBrowser from './components/FunctionBrowser.vue'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.vue'
import AboutModal from './components/AboutModal.vue'
import DebugConsole from './components/DebugConsole.vue'
import VisualizationPanel from './components/VisualizationPanel.vue'
import NotificationSystem from './components/NotificationSystem.vue'
import { FolderOpen, Code, BarChart3 } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useNotifications } from '@/composables/useNotifications'
import type { AppSettings } from './types'
import type { DrawCommand } from '@/utils/luaExecutor'

const { t, changeLanguage } = useI18n()
const { registerActions } = useKeyboardShortcuts()
const notifications = useNotifications()

const currentDirectory = ref<string>('')
const currentFile = ref<string | null>(null)
const currentFileContent = ref<string>('')
const isModified = ref<boolean>(false)
const showSettingsModal = ref<boolean>(false)
const showKeyboardShortcutsModal = ref<boolean>(false)
const showAboutModal = ref<boolean>(false)
const showDebugConsole = ref<boolean>(false)
const activeTab = ref<'files' | 'functions' | 'visualization'>('files')
const isVisualizationExpanded = ref<boolean>(false)
const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const debugConsoleRef = ref<InstanceType<typeof DebugConsole> | null>(null)
const visualizationPanelRef = ref<InstanceType<typeof VisualizationPanel> | null>(null)
const zoomLevel = ref<number>(100)
const currentFileName = ref<string>('')
const currentLine = ref<number>(1)
const currentColumn = ref<number>(1)
const appSettings = ref<AppSettings>({
  model_library_path: './LIBRARY/modelLibrary',
  language: 'en',
  sidebar_width: 596
})
const luaLibraryPath = ref<string>('./LIBRARY/luaLibrary')

// Draw commands for turtle graphics
const currentDrawCommands = ref<DrawCommand[]>([])

// Sidebar resize functionality
const sidebarWidth = ref<number>(596)
const previousSidebarWidth = ref<number>(596)
const isResizing = ref<boolean>(false)
const minSidebarWidth = 48  // Just the icon bar
const maxSidebarWidth = 800

const handleNewFile = (): void => {
  currentFile.value = null
  currentFileName.value = ''
  currentFileContent.value = t('files.newFileComment')
  isModified.value = true
  currentLine.value = 1
  currentColumn.value = 1
  notifications.info('New file created', 'File Operation')
}

const handleOpenFile = async (): Promise<void> => {
  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: t('files.luaFiles'),
        extensions: ['lua']
      }]
    })

    if (selected) {
      const content = await invoke<string>('read_file', { path: selected })
      currentFile.value = selected as string
      currentFileName.value = selected.split(/[/\\]/).pop() || ''
      currentFileContent.value = content
      isModified.value = false
      currentLine.value = 1
      currentColumn.value = 1
      notifications.fileOpened(currentFileName.value)
    }
  } catch (error) {
    console.error(t('errors.openingFile'), error)
    notifications.error('Failed to open file', 'File Operation', String(error))
  }
}

const handleSaveFile = async (): Promise<void> => {
  if (!currentFile.value) {
    await handleSaveAs()
    return
  }

  try {
    await invoke('write_file', {
      path: currentFile.value,
      content: currentFileContent.value
    })
    isModified.value = false
    notifications.fileSaved(currentFileName.value || currentFile.value)
  } catch (error) {
    console.error(t('errors.savingFile'), error)
    notifications.error('Failed to save file', 'File Operation', String(error))
  }
}

const handleSaveAs = async (): Promise<void> => {
  try {
    const filePath = await save({
      filters: [{
        name: t('files.luaFiles'),
        extensions: ['lua']
      }]
    })
    
    if (filePath) {
      await invoke('write_file', { 
        path: filePath, 
        content: currentFileContent.value 
      })
      currentFile.value = filePath
      isModified.value = false
    }
  } catch (error) {
    console.error(t('errors.savingFile'), error)
  }
}

const handleFileSelected = async (filePath: string): Promise<void> => {
  try {
    const content = await invoke<string>('read_file', { path: filePath })
    currentFile.value = filePath
    currentFileContent.value = content
    isModified.value = false
    currentLine.value = 1
    currentColumn.value = 1
  } catch (error) {
    console.error(t('errors.loadingFile'), error)
  }
}

const handleDirectoryChanged = (newDirectory: string): void => {
  currentDirectory.value = newDirectory
}

const handleContentChanged = (newContent: string): void => {
  currentFileContent.value = newContent
  isModified.value = true
}

const handleCursorPositionChanged = (line: number, column: number): void => {
  currentLine.value = line
  currentColumn.value = column
}

const handleInsertFunction = (functionCall: string): void => {
  if (editorRef.value) {
    editorRef.value.insertText(functionCall)
    // Switch to files tab to see the editor
    activeTab.value = 'files'
  }
}

// Menu action handlers
const handleUndo = (): void => {
  if (editorRef.value) {
    editorRef.value.undo()
  }
}

const handleRedo = (): void => {
  if (editorRef.value) {
    editorRef.value.redo()
  }
}

const handleCut = (): void => {
  if (editorRef.value) {
    editorRef.value.cut()
  }
}

const handleCopy = (): void => {
  if (editorRef.value) {
    editorRef.value.copy()
  }
}

const handlePaste = (): void => {
  if (editorRef.value) {
    editorRef.value.paste()
  }
}

const handleSelectAll = (): void => {
  if (editorRef.value) {
    editorRef.value.selectAll()
  }
}

const handleFind = (): void => {
  if (editorRef.value) {
    editorRef.value.showFindDialog()
  }
}

const handleReplace = (): void => {
  if (editorRef.value) {
    editorRef.value.showReplaceDialog()
  }
}

const handleToggleSidebar = (): void => {
  // Toggle sidebar between icon-only and full width
  if (sidebarWidth.value > 48) {
    previousSidebarWidth.value = sidebarWidth.value
    sidebarWidth.value = 48  // Show only icon bar
  } else {
    sidebarWidth.value = previousSidebarWidth.value || 320
  }
}

const handleToggleFunctionBrowser = (): void => {
  activeTab.value = activeTab.value === 'functions' ? 'files' : 'functions'
}

const handleZoomIn = (): void => {
  if (editorRef.value) {
    editorRef.value.zoomIn()
    zoomLevel.value = Math.min(zoomLevel.value + 10, 300)
  }
}

const handleZoomOut = (): void => {
  if (editorRef.value) {
    editorRef.value.zoomOut()
    zoomLevel.value = Math.max(zoomLevel.value - 10, 50)
  }
}

const handleResetZoom = (): void => {
  if (editorRef.value) {
    editorRef.value.resetZoom()
    zoomLevel.value = 100
  }
}

const handleShowFunctionBrowser = (): void => {
  activeTab.value = 'functions'
}

const handleValidateLua = async (): Promise<void> => {
  if (!currentFile.value || !currentFileContent.value) {
    notifications.warning(t('luaValidation.noFileOpen'), 'Lua Validation')
    return
  }

  notifications.info(t('luaValidation.validating'), 'Lua Validation')

  try {
    const { validateLuaSyntax } = await import('@/utils/luaExecutor')

    const result = await validateLuaSyntax(currentFileContent.value)

    if (result.is_valid) {
      notifications.success(t('luaValidation.valid'), 'Lua Validation')
    } else {
      // Show detailed error information
      const errorMessages = result.errors.map(error =>
        `${t('luaValidation.line')} ${error.line}, ${t('luaValidation.column')} ${error.column}: ${error.message}`
      ).join('\n')

      notifications.error(
        `${t('luaValidation.invalid')}\n\n${t('luaValidation.errors')}:\n${errorMessages}`,
        'Lua Validation'
      )
    }
  } catch (error) {
    notifications.error(`Failed to validate Lua syntax: ${error}`, 'Lua Validation')
  }
}

const handleFormatCode = (): void => {
  if (editorRef.value) {
    editorRef.value.formatCode()
  }
}

const handleShowDocumentation = (): void => {
  // TODO: Implement documentation modal
  console.log('Show documentation')
}

const handleShowKeyboardShortcuts = (): void => {
  showKeyboardShortcutsModal.value = true
}

const handleShowAbout = (): void => {
  showAboutModal.value = true
}

// Debug handlers
const handleRunScript = async (): Promise<void> => {
  if (!currentFile.value || !currentFileContent.value) {
    notifications.warning('No file open to execute', 'Script Execution')
    return
  }

  showDebugConsole.value = true
  notifications.scriptExecutionStarted(currentFileName.value || currentFile.value)

  if (debugConsoleRef.value) {
    debugConsoleRef.value.setExecuting(true)
    debugConsoleRef.value.addOutput('info', `Running script: ${currentFile.value}`)
  }

  try {
    const { executeLuaScript } = await import('@/utils/luaExecutor')

    const result = await executeLuaScript({
      scriptContent: currentFileContent.value,
      luaLibraryPath: luaLibraryPath.value,
      debugMode: false
    })

    if (debugConsoleRef.value) {
      debugConsoleRef.value.setExecuting(false)
      debugConsoleRef.value.setExecutionTime(result.execution_time_ms)

      if (result.success) {
        debugConsoleRef.value.addOutput('success', t('debugConsole.completed'))
        if (result.output) {
          debugConsoleRef.value.addOutput('info', result.output)
        }
        // Store draw commands for turtle graphics
        console.log('Full result object:', JSON.stringify(result, null, 2))
        currentDrawCommands.value = result.draw_commands || []
        console.log('Draw commands received:', JSON.stringify(currentDrawCommands.value, null, 2))

        // Auto-switch to visualization tab and expand if we have draw commands
        if (currentDrawCommands.value.length > 0) {
          activeTab.value = 'visualization'
          isVisualizationExpanded.value = true
        }
        notifications.scriptExecutionCompleted(
          currentFileName.value || currentFile.value,
          result.execution_time_ms
        )
      } else {
        debugConsoleRef.value.addOutput('error', t('debugConsole.failed'))
        if (result.error) {
          debugConsoleRef.value.addOutput('error', result.error)
        }
        notifications.scriptExecutionFailed(
          currentFileName.value || currentFile.value,
          result.error
        )
      }
    }
  } catch (error) {
    if (debugConsoleRef.value) {
      debugConsoleRef.value.setExecuting(false)
      debugConsoleRef.value.addOutput('error', `${t('debugConsole.failed')}: ${error}`)
    }
    notifications.scriptExecutionFailed(
      currentFileName.value || currentFile.value,
      String(error)
    )
  }
}

const handleRunWithDebug = async (): Promise<void> => {
  if (!currentFile.value || !currentFileContent.value) {
    notifications.warning('No file open to execute', 'Script Execution')
    return
  }

  showDebugConsole.value = true
  notifications.debugModeEnabled()
  notifications.scriptExecutionStarted(currentFileName.value || currentFile.value)

  if (debugConsoleRef.value) {
    debugConsoleRef.value.setExecuting(true)
    debugConsoleRef.value.addOutput('info', `Running script with debug mode: ${currentFile.value}`)
  }

  try {
    const { executeLuaScript } = await import('@/utils/luaExecutor')

    const result = await executeLuaScript({
      scriptContent: currentFileContent.value,
      luaLibraryPath: luaLibraryPath.value,
      debugMode: true
    })

    if (debugConsoleRef.value) {
      debugConsoleRef.value.setExecuting(false)
      debugConsoleRef.value.setExecutionTime(result.execution_time_ms)

      if (result.success) {
        debugConsoleRef.value.addOutput('success', t('debugConsole.completed'))
        if (result.output) {
          debugConsoleRef.value.addOutput('info', result.output)
        }
        // Store draw commands for turtle graphics
        console.log('Full result object (debug mode):', JSON.stringify(result, null, 2))
        currentDrawCommands.value = result.draw_commands || []
        console.log('Draw commands received (debug mode):', JSON.stringify(currentDrawCommands.value, null, 2))

        // Auto-switch to visualization tab and expand if we have draw commands
        if (currentDrawCommands.value.length > 0) {
          activeTab.value = 'visualization'
          isVisualizationExpanded.value = true
        }
        notifications.scriptExecutionCompleted(
          currentFileName.value || currentFile.value,
          result.execution_time_ms
        )
      } else {
        debugConsoleRef.value.addOutput('error', t('debugConsole.failed'))
        if (result.error) {
          debugConsoleRef.value.addOutput('error', result.error)
        }
        notifications.scriptExecutionFailed(
          currentFileName.value || currentFile.value,
          result.error
        )
      }
    }
  } catch (error) {
    if (debugConsoleRef.value) {
      debugConsoleRef.value.setExecuting(false)
      debugConsoleRef.value.addOutput('error', `${t('debugConsole.failed')}: ${error}`)
    }
    notifications.scriptExecutionFailed(
      currentFileName.value || currentFile.value,
      String(error)
    )
  }
}

const handleStopExecution = (): void => {
  // TODO: Implement script execution stopping
  if (debugConsoleRef.value) {
    debugConsoleRef.value.setExecuting(false)
    debugConsoleRef.value.addOutput('info', t('debugConsole.stopped'))
  }
}

const handleToggleDebugConsole = (): void => {
  showDebugConsole.value = !showDebugConsole.value
}

const handleClearDebugConsole = (): void => {
  if (debugConsoleRef.value) {
    debugConsoleRef.value.clearConsole()
  }
  currentDrawCommands.value = []
}

const handleClearVisualization = (): void => {
  currentDrawCommands.value = []
  if (debugConsoleRef.value) {
    debugConsoleRef.value.clearConsole()
  }
}

const handleToggleVisualizationExpanded = (expanded: boolean): void => {
  isVisualizationExpanded.value = expanded
  // If expanding, switch to visualization tab
  if (expanded) {
    activeTab.value = 'visualization'
  }
}

// Sidebar resize methods
const startResize = (event: MouseEvent): void => {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const handleResize = (event: MouseEvent): void => {
  if (!isResizing.value) return

  const newWidth = event.clientX
  // Ensure minimum width for content panel (48px icon bar + 200px content)
  const effectiveMinWidth = 248
  if (newWidth >= effectiveMinWidth && newWidth <= maxSidebarWidth) {
    sidebarWidth.value = newWidth
  } else if (newWidth < effectiveMinWidth && newWidth >= minSidebarWidth) {
    sidebarWidth.value = 48  // Snap to icon-only mode
  }
}

const stopResize = (): void => {
  if (isResizing.value) {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)

    // Save the new sidebar width to settings
    saveSidebarWidth()
  }
}

const saveSidebarWidth = async (): Promise<void> => {
  try {
    const updatedSettings = {
      ...appSettings.value,
      sidebar_width: sidebarWidth.value
    }
    await invoke('save_settings', { settings: updatedSettings })
    appSettings.value = updatedSettings
  } catch (error) {
    console.error('Error saving sidebar width:', error)
  }
}

const handleSettingsUpdated = async (newSettings: AppSettings): Promise<void> => {
  appSettings.value = { ...newSettings }

  // Update sidebar width if provided
  if (newSettings.sidebar_width) {
    sidebarWidth.value = newSettings.sidebar_width
  }

  // Calculate lua library path from model library path
  if (newSettings.model_library_path) {
    try {
      const calculatedLuaPath = await invoke<string>('get_lua_library_path', {
        modelLibraryPath: newSettings.model_library_path
      })
      luaLibraryPath.value = calculatedLuaPath

      // Update current directory to model library path
      currentDirectory.value = newSettings.model_library_path
    } catch (error) {
      console.error(t('errors.calculatingLuaPath'), error)
    }
  }
}

const loadSettings = async (): Promise<void> => {
  try {
    const settings = await invoke<AppSettings>('load_settings')
    appSettings.value = settings

    // Apply sidebar width setting
    if (settings.sidebar_width) {
      sidebarWidth.value = settings.sidebar_width
    }

    // Apply language setting
    if (settings.language) {
      changeLanguage(settings.language)
    }

    // Calculate lua library path from model library path
    if (settings.model_library_path) {
      try {
        const calculatedLuaPath = await invoke<string>('get_lua_library_path', {
          modelLibraryPath: settings.model_library_path
        })
        luaLibraryPath.value = calculatedLuaPath
        currentDirectory.value = settings.model_library_path

        // Verify the model library directory exists
        const dirExists = await invoke<boolean>('is_directory', { path: settings.model_library_path })
        if (!dirExists) {
          console.warn(`${t('status.directoryNotExist')} ${settings.model_library_path}`)
          currentDirectory.value = './LIBRARY/modelLibrary'
        }
      } catch (error) {
        console.error(t('errors.calculatingLuaPath'), error)
        currentDirectory.value = './LIBRARY/modelLibrary'
      }
    } else {
      currentDirectory.value = './LIBRARY/modelLibrary'
    }
  } catch (error) {
    console.error(t('errors.loadingSettings'), error)
    // Use default directory if settings can't be loaded
    currentDirectory.value = './LIBRARY/modelLibrary'
  }
}

onMounted(async () => {
  console.log(t('status.initialized'))
  await loadSettings()

  // Register keyboard shortcut actions
  registerActions({
    'new-file': handleNewFile,
    'open-file': handleOpenFile,
    'save-file': handleSaveFile,
    'save-as': handleSaveAs,
    'undo': handleUndo,
    'redo': handleRedo,
    'cut': handleCut,
    'copy': handleCopy,
    'paste': handlePaste,
    'select-all': handleSelectAll,
    'find': handleFind,
    'replace': handleReplace,
    'toggle-sidebar': handleToggleSidebar,
    'toggle-function-browser': handleToggleFunctionBrowser,
    'zoom-in': handleZoomIn,
    'zoom-out': handleZoomOut,
    'reset-zoom': handleResetZoom,
    'run-script': handleRunScript,
    'run-with-debug': handleRunWithDebug,
    'stop-execution': handleStopExecution,
    'toggle-debug-console': handleToggleDebugConsole,
    'clear-debug-console': handleClearDebugConsole,
    'toggle-settings': () => { showSettingsModal.value = true },
    'show-function-browser': handleShowFunctionBrowser,
    'validate-lua': handleValidateLua,
    'format-code': handleFormatCode,
    'show-documentation': handleShowDocumentation,
    'show-keyboard-shortcuts': handleShowKeyboardShortcuts
  })
})

onUnmounted(() => {
  // Clean up event listeners if component is unmounted during resize
  if (isResizing.value) {
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }
})
</script>
