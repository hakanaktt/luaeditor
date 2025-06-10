<template>
  <div class="toolbar">
    <div class="toolbar-section">
      <!-- File Operations -->
      <div class="toolbar-group">
        <button
          @click="$emit('new-file')"
          class="toolbar-button"
          :title="$t('fileMenu.new')"
        >
          <FileText :size="16" />
        </button>
        <button
          @click="$emit('open-file')"
          class="toolbar-button"
          :title="$t('fileMenu.open')"
        >
          <FolderOpen :size="16" />
        </button>
        <button
          @click="$emit('save-file')"
          class="toolbar-button"
          :title="$t('fileMenu.save')"
          :disabled="!hasOpenFile"
        >
          <Save :size="16" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Edit Operations -->
      <div class="toolbar-group">
        <button
          @click="$emit('undo')"
          class="toolbar-button"
          :title="$t('editMenu.undo')"
          :disabled="!hasOpenFile"
        >
          <Undo :size="16" />
        </button>
        <button
          @click="$emit('redo')"
          class="toolbar-button"
          :title="$t('editMenu.redo')"
          :disabled="!hasOpenFile"
        >
          <Redo :size="16" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Debug Operations -->
      <div class="toolbar-group">
        <button
          @click="$emit('run-script')"
          class="toolbar-button toolbar-button-primary"
          :title="$t('debugMenu.runScript') + ' (F5)'"
          :disabled="!hasOpenFile"
        >
          <Play :size="16" />
          <span class="toolbar-button-text">{{ $t('debugMenu.runScript') }}</span>
        </button>
        <button
          @click="$emit('run-with-debug')"
          class="toolbar-button toolbar-button-secondary"
          :title="$t('debugMenu.runWithDebug') + ' (Shift+F5)'"
          :disabled="!hasOpenFile"
        >
          <Bug :size="16" />
        </button>
        <button
          @click="$emit('stop-execution')"
          class="toolbar-button toolbar-button-danger"
          :title="$t('debugMenu.stopExecution')"
        >
          <Square :size="16" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Theme and Styling -->
      <div class="toolbar-group">
        <button
          @click="$emit('toggle-theme')"
          class="toolbar-button"
          :title="$t('viewMenu.toggleTheme')"
        >
          <Palette :size="16" />
        </button>
        <button
          @click="$emit('increase-font-size')"
          class="toolbar-button"
          :title="$t('viewMenu.increaseFontSize')"
        >
          <Type :size="16" />
          <Plus :size="12" />
        </button>
        <button
          @click="$emit('decrease-font-size')"
          class="toolbar-button"
          :title="$t('viewMenu.decreaseFontSize')"
        >
          <Type :size="16" />
          <Minus :size="12" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- View Operations -->
      <div class="toolbar-group">
        <button
          @click="$emit('toggle-sidebar')"
          class="toolbar-button"
          :title="$t('viewMenu.toggleSidebar')"
        >
          <PanelLeft :size="16" />
        </button>
        <button
          @click="$emit('toggle-debug-console')"
          class="toolbar-button"
          :title="$t('debugMenu.toggleConsole')"
        >
          <Terminal :size="16" />
        </button>
        <button
          @click="$emit('show-function-browser')"
          class="toolbar-button"
          :title="$t('toolsMenu.functionBrowser')"
        >
          <Library :size="16" />
        </button>
      </div>
    </div>

    <!-- Right Section -->
    <div class="toolbar-section toolbar-section-right">
      <!-- Zoom Controls -->
      <div class="toolbar-group">
        <button
          @click="$emit('zoom-out')"
          class="toolbar-button toolbar-button-small"
          :title="$t('viewMenu.zoomOut')"
        >
          <ZoomOut :size="14" />
        </button>
        <span class="zoom-level">{{ zoomLevel }}%</span>
        <button
          @click="$emit('zoom-in')"
          class="toolbar-button toolbar-button-small"
          :title="$t('viewMenu.zoomIn')"
        >
          <ZoomIn :size="14" />
        </button>
      </div>

      <div class="toolbar-separator"></div>

      <!-- Status Indicators -->
      <div class="toolbar-group">
        <div class="status-indicator" :class="{ 'status-active': hasOpenFile }">
          <div class="status-dot"></div>
          <span class="status-text">
            {{ hasOpenFile ? currentFileName || $t('toolbar.fileOpen') : $t('toolbar.noFile') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FileText, FolderOpen, Save, Undo, Redo, Play, Bug, Square,
  PanelLeft, Terminal, Library, ZoomIn, ZoomOut, Palette, Type, Plus, Minus
} from 'lucide-vue-next'

interface Props {
  hasOpenFile?: boolean
  zoomLevel?: number
  currentFileName?: string
}

withDefaults(defineProps<Props>(), {
  hasOpenFile: false,
  zoomLevel: 100,
  currentFileName: ''
})

defineEmits<{
  'new-file': []
  'open-file': []
  'save-file': []
  'undo': []
  'redo': []
  'run-script': []
  'run-with-debug': []
  'stop-execution': []
  'toggle-sidebar': []
  'toggle-debug-console': []
  'show-function-browser': []
  'zoom-in': []
  'zoom-out': []
  'toggle-theme': []
  'increase-font-size': []
  'decrease-font-size': []
}>()
</script>

<style scoped>
.toolbar {
  @apply flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200;
  height: 44px;
}

.toolbar-section {
  @apply flex items-center space-x-2;
}

.toolbar-section-right {
  @apply ml-auto;
}

.toolbar-group {
  @apply flex items-center space-x-1;
}

.toolbar-separator {
  @apply w-px h-6 bg-gray-300 mx-2;
}

.toolbar-button {
  @apply flex items-center space-x-1 px-2 py-1.5 rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-150;
  @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600;
}

.toolbar-button-text {
  @apply text-sm font-medium;
}

.toolbar-button-small {
  @apply px-1.5 py-1;
}

.toolbar-button-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600 hover:text-white;
  @apply disabled:bg-gray-300 disabled:text-gray-500;
}

.toolbar-button-secondary {
  @apply bg-green-500 text-white hover:bg-green-600 hover:text-white;
  @apply disabled:bg-gray-300 disabled:text-gray-500;
}

.toolbar-button-danger {
  @apply bg-red-500 text-white hover:bg-red-600 hover:text-white;
  @apply disabled:bg-gray-300 disabled:text-gray-500;
}

.zoom-level {
  @apply text-sm text-gray-600 min-w-[3rem] text-center;
}

.status-indicator {
  @apply flex items-center space-x-2;
}

.status-dot {
  @apply w-2 h-2 rounded-full bg-gray-400 transition-colors duration-150;
}

.status-indicator.status-active .status-dot {
  @apply bg-green-500;
}

.status-text {
  @apply text-xs text-gray-600;
}
</style>
