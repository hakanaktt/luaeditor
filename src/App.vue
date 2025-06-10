<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- Menu Bar -->
    <MenuBar
      :has-open-file="!!activeFile"
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
      :has-open-file="!!activeFile"
      :zoom-level="zoomLevel"
      :current-file-name="activeFile?.name || ''"
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
      @toggle-theme="handleToggleTheme"
      @increase-font-size="handleIncreaseFontSize"
      @decrease-font-size="handleDecreaseFontSize"
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
                  :editor-content="activeFile?.content || ''"
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
        <div class="flex-1 flex flex-col min-h-0">
          <SplitEditor
            ref="splitEditorRef"
            :layout="editorLayout"
            class="flex-1 min-h-0"
            @layout-changed="handleLayoutChanged"
            @file-changed="handleFileChanged"
            @cursor-changed="handleCursorChanged"
            @active-file-changed="handleActiveFileChanged"
          />

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
      <span v-if="activeFile">{{ activeFile.path || activeFile.name }}</span>
      <span v-else>{{ $t('app.noFileOpen') }}</span>
      <div class="ml-auto flex items-center space-x-4">
        <span v-if="activeFile" class="flex items-center space-x-1">
          <span>{{ $t('status.line') }} {{ activeFile.cursorLine }}, {{ $t('status.column') }} {{ activeFile.cursorColumn }}</span>
        </span>
        <span v-if="activeFile?.isModified" class="mr-2">{{ $t('status.modified') }}</span>
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
import SplitEditor from './components/SplitEditor.vue'
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
import { useEditorState } from '@/composables/useEditorState'
import { colorfulThemeService } from './services/colorfulThemeService'
import { themeService } from './services/themeService'
import * as monaco from 'monaco-editor'
import type { AppSettings } from './types'
import type { DrawCommand } from '@/utils/luaExecutor'
import type { EditorFile, SplitLayout } from '@/types'

const { t, changeLanguage } = useI18n()
const { registerActions } = useKeyboardShortcuts()
const notifications = useNotifications()

// Editor state management
const {
  layout: editorLayout,
  activeFile,
  allFiles,
  hasModifiedFiles,
  initializeEditor,
  createNewFile,
  openFile,
  updateFileContent,
  updateCursorPosition,
  saveFile,
  closeFile,
  splitEditor
} = useEditorState()

const currentDirectory = ref<string>('')
const showSettingsModal = ref<boolean>(false)
const showKeyboardShortcutsModal = ref<boolean>(false)
const showAboutModal = ref<boolean>(false)
const showDebugConsole = ref<boolean>(false)
const activeTab = ref<'files' | 'functions' | 'visualization'>('files')
const isVisualizationExpanded = ref<boolean>(false)
const splitEditorRef = ref<InstanceType<typeof SplitEditor> | null>(null)
const debugConsoleRef = ref<InstanceType<typeof DebugConsole> | null>(null)
const visualizationPanelRef = ref<InstanceType<typeof VisualizationPanel> | null>(null)
const zoomLevel = ref<number>(100)
const appSettings = ref<AppSettings>({
  model_library_path: './LIBRARY/modelLibrary',
  language: 'en',
  sidebar_width: 350
})
const luaLibraryPath = ref<string>('./LIBRARY/luaLibrary')

// Draw commands for turtle graphics
const currentDrawCommands = ref<DrawCommand[]>([])

// Sidebar resize functionality
const sidebarWidth = ref<number>(350)
const previousSidebarWidth = ref<number>(350)
const isResizing = ref<boolean>(false)
const minSidebarWidth = 48  // Just the icon bar
const maxSidebarWidth = 800

// New multi-file editor handlers
const handleLayoutChanged = (newLayout: SplitLayout): void => {
  editorLayout.value = newLayout
}

const handleFileChanged = (groupId: string, fileId: string, content: string): void => {
  updateFileContent(groupId, fileId, content)
}

const handleCursorChanged = (groupId: string, fileId: string, line: number, column: number): void => {
  updateCursorPosition(groupId, fileId, line, column)
}

const handleActiveFileChanged = (file: EditorFile | null): void => {
  // Update status bar and other UI elements based on active file
  // Note: Removed annoying toast notification that appeared on every click
  if (file) {
    console.log(`Active file changed to: ${file.name}`)
  }
}

const handleNewFile = (): void => {
  const newFile = createNewFile(undefined, t('files.newFileComment'))
  if (newFile) {
    notifications.info('New file created', 'File Operation')
  }
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
      const file = openFile(selected as string, content)
      if (file) {
        notifications.fileOpened(file.name)
      }
    }
  } catch (error) {
    console.error(t('errors.openingFile'), error)
    notifications.error('Failed to open file', 'File Operation', String(error))
  }
}

const handleSaveFile = async (): Promise<void> => {
  if (!activeFile.value) {
    await handleSaveAs()
    return
  }

  const file = activeFile.value

  if (file.isUntitled) {
    await handleSaveAs()
    return
  }

  try {
    await invoke('write_file', {
      path: file.path,
      content: file.content
    })
    saveFile(file.id)
    notifications.fileSaved(file.name)
  } catch (error) {
    console.error(t('errors.savingFile'), error)
    notifications.error('Failed to save file', 'File Operation', String(error))
  }
}

const handleSaveAs = async (): Promise<void> => {
  if (!activeFile.value) return

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
        content: activeFile.value.content
      })
      saveFile(activeFile.value.id, filePath)
      notifications.fileSaved(filePath.split(/[/\\]/).pop() || filePath)
    }
  } catch (error) {
    console.error(t('errors.savingFile'), error)
    notifications.error('Failed to save file', 'File Operation', String(error))
  }
}

const handleFileSelected = async (filePath: string): Promise<void> => {
  try {
    const content = await invoke<string>('read_file', { path: filePath })
    const file = openFile(filePath, content)
    if (file) {
      notifications.fileOpened(file.name)
    }
  } catch (error) {
    console.error(t('errors.loadingFile'), error)
    notifications.error('Failed to load file', 'File Operation', String(error))
  }
}

const handleDirectoryChanged = (newDirectory: string): void => {
  currentDirectory.value = newDirectory
}

const handleInsertFunction = (functionCall: string): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.insertText(functionCall)
    // Switch to files tab to see the editor
    activeTab.value = 'files'
  }
}

// Menu action handlers
const handleUndo = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.undo()
  }
}

const handleRedo = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.redo()
  }
}

const handleCut = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.cut()
  }
}

const handleCopy = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.copy()
  }
}

const handlePaste = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.paste()
  }
}

const handleSelectAll = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.selectAll()
  }
}

const handleFind = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.showFindDialog()
  }
}

const handleReplace = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.showReplaceDialog()
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
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.zoomIn()
    zoomLevel.value = Math.min(zoomLevel.value + 10, 300)
  }
}

const handleZoomOut = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.zoomOut()
    zoomLevel.value = Math.max(zoomLevel.value - 10, 50)
  }
}

const handleToggleTheme = (): void => {
  // Simple theme cycling: vs-dark -> vibrant-dark -> vibrant-light -> neon-dark -> vs-dark
  const themes = ['vs-dark', 'vibrant-dark', 'vibrant-light', 'neon-dark']
  const themeNames = ['Dark', 'Vibrant Dark', 'Vibrant Light', 'Neon Dark']

  // Get current theme (default to vs-dark)
  const currentTheme = localStorage.getItem('current-editor-theme') || 'vs-dark'
  const currentIndex = themes.indexOf(currentTheme)
  const nextIndex = (currentIndex + 1) % themes.length
  const nextTheme = themes[nextIndex]
  const nextThemeName = themeNames[nextIndex]

  console.log(`🎨 Switching from ${currentTheme} to ${nextTheme}`)

  // Apply theme
  if (nextTheme === 'vs-dark') {
    monaco.editor.setTheme('vs-dark')
    console.log('✅ Applied standard vs-dark theme')
  } else {
    const success = colorfulThemeService.applyTheme(nextTheme)
    if (!success) {
      console.warn(`Failed to apply theme ${nextTheme}, falling back to vs-dark`)
      monaco.editor.setTheme('vs-dark')
      localStorage.setItem('current-editor-theme', 'vs-dark')
      notifications.warning('Theme failed to load, using default', 'Theme')
      return
    }
  }

  // Save current theme
  localStorage.setItem('current-editor-theme', nextTheme)

  notifications.info(`Theme changed to: ${nextThemeName}`, 'Theme')
}

const handleIncreaseFontSize = (): void => {
  const currentStyle = themeService.getCurrentTextStyle()
  const newFontSize = Math.min(currentStyle.fontSize + 2, 32)
  themeService.setFontSize(newFontSize)
  notifications.info(`Font size increased to: ${newFontSize}px`, 'Text Style')
}

const handleDecreaseFontSize = (): void => {
  const currentStyle = themeService.getCurrentTextStyle()
  const newFontSize = Math.max(currentStyle.fontSize - 2, 10)
  themeService.setFontSize(newFontSize)
  notifications.info(`Font size decreased to: ${newFontSize}px`, 'Text Style')
}

const handleResetZoom = (): void => {
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.resetZoom()
    zoomLevel.value = 100
  }
}

const handleShowFunctionBrowser = (): void => {
  activeTab.value = 'functions'
}

const handleValidateLua = async (): Promise<void> => {
  if (!activeFile.value) {
    notifications.warning(t('luaValidation.noFileOpen'), 'Lua Validation')
    return
  }

  notifications.info(t('luaValidation.validating'), 'Lua Validation')

  try {
    const { validateLuaSyntax } = await import('@/utils/luaExecutor')

    const result = await validateLuaSyntax(activeFile.value.content)

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
  const editor = splitEditorRef.value?.getActiveEditor()
  if (editor) {
    editor.formatCode()
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
  if (!activeFile.value) {
    notifications.warning('No file open to execute', 'Script Execution')
    return
  }

  const file = activeFile.value
  showDebugConsole.value = true
  notifications.scriptExecutionStarted(file.name)

  if (debugConsoleRef.value) {
    debugConsoleRef.value.setExecuting(true)
    debugConsoleRef.value.addOutput('info', `Running script: ${file.name}`)
  }

  try {
    const { executeLuaScript } = await import('@/utils/luaExecutor')

    const result = await executeLuaScript({
      scriptContent: file.content,
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
          file.name,
          result.execution_time_ms
        )
      } else {
        debugConsoleRef.value.addOutput('error', t('debugConsole.failed'))
        if (result.error) {
          debugConsoleRef.value.addOutput('error', result.error)
        }
        notifications.scriptExecutionFailed(
          file.name,
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
      file.name,
      String(error)
    )
  }
}

const handleRunWithDebug = async (): Promise<void> => {
  if (!activeFile.value) {
    notifications.warning('No file open to execute', 'Script Execution')
    return
  }

  const file = activeFile.value
  showDebugConsole.value = true
  notifications.debugModeEnabled()
  notifications.scriptExecutionStarted(file.name)

  if (debugConsoleRef.value) {
    debugConsoleRef.value.setExecuting(true)
    debugConsoleRef.value.addOutput('info', `Running script with debug mode: ${file.name}`)
  }

  try {
    const { executeLuaScript } = await import('@/utils/luaExecutor')

    const result = await executeLuaScript({
      scriptContent: file.content,
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
          file.name,
          result.execution_time_ms
        )
      } else {
        debugConsoleRef.value.addOutput('error', t('debugConsole.failed'))
        if (result.error) {
          debugConsoleRef.value.addOutput('error', result.error)
        }
        notifications.scriptExecutionFailed(
          file.name,
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
      file.name,
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

  // Initialize editor with default group and create a welcome file
  initializeEditor()
  const welcomeFile = createNewFile(undefined, t('files.newFileComment'))
  if (welcomeFile) {
    console.log('Created welcome file:', welcomeFile.name)
  }

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
