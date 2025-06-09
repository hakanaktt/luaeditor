<template>
  <div class="h-8 bg-gray-50 border-b border-gray-200 flex items-center text-sm">
    <!-- File Menu -->
    <div class="relative" ref="fileMenuRef">
      <button
        @click="toggleMenu('file')"
        @keydown="handleMenuKeydown('file', $event)"
        class="px-3 py-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        :class="{ 'bg-gray-100': activeMenu === 'file' }"
      >
        {{ $t('menu.file') }}
      </button>
      <div
        v-if="activeMenu === 'file'"
        class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-48"
      >
        <button @click="$emit('new-file')" class="menu-item">
          <FileText :size="16" />
          <span>{{ $t('fileMenu.new') }}</span>
          <span class="shortcut">Ctrl+N</span>
        </button>
        <button @click="$emit('open-file')" class="menu-item">
          <FolderOpen :size="16" />
          <span>{{ $t('fileMenu.open') }}</span>
          <span class="shortcut">Ctrl+O</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="$emit('save-file')" class="menu-item" :disabled="!hasOpenFile">
          <Save :size="16" />
          <span>{{ $t('fileMenu.save') }}</span>
          <span class="shortcut">Ctrl+S</span>
        </button>
        <button @click="$emit('save-as')" class="menu-item" :disabled="!hasOpenFile">
          <Save :size="16" />
          <span>{{ $t('fileMenu.saveAs') }}</span>
          <span class="shortcut">Ctrl+Shift+S</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="showRecentFiles" class="menu-item">
          <Clock :size="16" />
          <span>{{ $t('fileMenu.recentFiles') }}</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="exitApp" class="menu-item">
          <X :size="16" />
          <span>{{ $t('fileMenu.exit') }}</span>
          <span class="shortcut">Alt+F4</span>
        </button>
      </div>
    </div>

    <!-- Edit Menu -->
    <div class="relative" ref="editMenuRef">
      <button
        @click="toggleMenu('edit')"
        @keydown="handleMenuKeydown('edit', $event)"
        class="px-3 py-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        :class="{ 'bg-gray-100': activeMenu === 'edit' }"
      >
        {{ $t('menu.edit') }}
      </button>
      <div
        v-if="activeMenu === 'edit'"
        class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-48"
      >
        <button @click="$emit('undo')" class="menu-item" :disabled="!hasOpenFile">
          <Undo :size="16" />
          <span>{{ $t('editMenu.undo') }}</span>
          <span class="shortcut">Ctrl+Z</span>
        </button>
        <button @click="$emit('redo')" class="menu-item" :disabled="!hasOpenFile">
          <Redo :size="16" />
          <span>{{ $t('editMenu.redo') }}</span>
          <span class="shortcut">Ctrl+Y</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="$emit('cut')" class="menu-item" :disabled="!hasOpenFile">
          <Scissors :size="16" />
          <span>{{ $t('editMenu.cut') }}</span>
          <span class="shortcut">Ctrl+X</span>
        </button>
        <button @click="$emit('copy')" class="menu-item" :disabled="!hasOpenFile">
          <Copy :size="16" />
          <span>{{ $t('editMenu.copy') }}</span>
          <span class="shortcut">Ctrl+C</span>
        </button>
        <button @click="$emit('paste')" class="menu-item" :disabled="!hasOpenFile">
          <Clipboard :size="16" />
          <span>{{ $t('editMenu.paste') }}</span>
          <span class="shortcut">Ctrl+V</span>
        </button>
        <button @click="$emit('select-all')" class="menu-item" :disabled="!hasOpenFile">
          <MousePointer :size="16" />
          <span>{{ $t('editMenu.selectAll') }}</span>
          <span class="shortcut">Ctrl+A</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="$emit('find')" class="menu-item" :disabled="!hasOpenFile">
          <Search :size="16" />
          <span>{{ $t('editMenu.find') }}</span>
          <span class="shortcut">Ctrl+F</span>
        </button>
        <button @click="$emit('replace')" class="menu-item" :disabled="!hasOpenFile">
          <Replace :size="16" />
          <span>{{ $t('editMenu.replace') }}</span>
          <span class="shortcut">Ctrl+H</span>
        </button>
      </div>
    </div>

    <!-- View Menu -->
    <div class="relative" ref="viewMenuRef">
      <button
        @click="toggleMenu('view')"
        @keydown="handleMenuKeydown('view', $event)"
        class="px-3 py-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        :class="{ 'bg-gray-100': activeMenu === 'view' }"
      >
        {{ $t('menu.view') }}
      </button>
      <div
        v-if="activeMenu === 'view'"
        class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-48"
      >
        <button @click="$emit('toggle-sidebar')" class="menu-item">
          <PanelLeft :size="16" />
          <span>{{ $t('viewMenu.toggleSidebar') }}</span>
          <span class="shortcut">Ctrl+B</span>
        </button>
        <button @click="$emit('toggle-function-browser')" class="menu-item">
          <Code :size="16" />
          <span>{{ $t('viewMenu.toggleFunctionBrowser') }}</span>
          <span class="shortcut">Ctrl+Shift+F</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="$emit('zoom-in')" class="menu-item">
          <ZoomIn :size="16" />
          <span>{{ $t('viewMenu.zoomIn') }}</span>
          <span class="shortcut">Ctrl++</span>
        </button>
        <button @click="$emit('zoom-out')" class="menu-item">
          <ZoomOut :size="16" />
          <span>{{ $t('viewMenu.zoomOut') }}</span>
          <span class="shortcut">Ctrl+-</span>
        </button>
        <button @click="$emit('reset-zoom')" class="menu-item">
          <RotateCcw :size="16" />
          <span>{{ $t('viewMenu.resetZoom') }}</span>
          <span class="shortcut">Ctrl+0</span>
        </button>
      </div>
    </div>

    <!-- Tools Menu -->
    <div class="relative" ref="toolsMenuRef">
      <button
        @click="toggleMenu('tools')"
        @keydown="handleMenuKeydown('tools', $event)"
        class="px-3 py-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        :class="{ 'bg-gray-100': activeMenu === 'tools' }"
      >
        {{ $t('menu.tools') }}
      </button>
      <div
        v-if="activeMenu === 'tools'"
        class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-48"
      >
        <button @click="$emit('toggle-settings')" class="menu-item">
          <Settings :size="16" />
          <span>{{ $t('toolsMenu.settings') }}</span>
          <span class="shortcut">Ctrl+,</span>
        </button>
        <button @click="$emit('show-function-browser')" class="menu-item">
          <Library :size="16" />
          <span>{{ $t('toolsMenu.functionBrowser') }}</span>
          <span class="shortcut">F2</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="$emit('validate-lua')" class="menu-item" :disabled="!hasOpenFile">
          <CheckCircle :size="16" />
          <span>{{ $t('toolsMenu.validateLua') }}</span>
          <span class="shortcut">F7</span>
        </button>
        <button @click="$emit('format-code')" class="menu-item" :disabled="!hasOpenFile">
          <AlignLeft :size="16" />
          <span>{{ $t('toolsMenu.formatCode') }}</span>
          <span class="shortcut">Shift+Alt+F</span>
        </button>
      </div>
    </div>

    <!-- Help Menu -->
    <div class="relative" ref="helpMenuRef">
      <button
        @click="toggleMenu('help')"
        @keydown="handleMenuKeydown('help', $event)"
        class="px-3 py-1 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        :class="{ 'bg-gray-100': activeMenu === 'help' }"
      >
        {{ $t('menu.help') }}
      </button>
      <div
        v-if="activeMenu === 'help'"
        class="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-48"
      >
        <button @click="$emit('show-documentation')" class="menu-item">
          <BookOpen :size="16" />
          <span>{{ $t('helpMenu.documentation') }}</span>
          <span class="shortcut">F1</span>
        </button>
        <button @click="$emit('show-keyboard-shortcuts')" class="menu-item">
          <Keyboard :size="16" />
          <span>{{ $t('helpMenu.keyboardShortcuts') }}</span>
          <span class="shortcut">F12</span>
        </button>
        <div class="border-t border-gray-200 my-1"></div>
        <button @click="$emit('show-about')" class="menu-item">
          <Info :size="16" />
          <span>{{ $t('helpMenu.about') }}</span>
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- App Title -->
    <div class="px-4 text-gray-600 font-medium">
      {{ $t('app.title') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  FileText, FolderOpen, Save, Clock, X, Undo, Redo, Scissors, Copy, Clipboard,
  MousePointer, Search, Replace, PanelLeft, Code, ZoomIn, ZoomOut, RotateCcw,
  Settings, Library, CheckCircle, AlignLeft, BookOpen, Keyboard, Info
} from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'

const { t: _t } = useI18n()

interface Props {
  hasOpenFile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasOpenFile: false
})

// Explicitly reference variables to avoid TypeScript warnings
const { hasOpenFile } = props

// Define emits
defineEmits<{
  'new-file': []
  'open-file': []
  'save-file': []
  'save-as': []
  'undo': []
  'redo': []
  'cut': []
  'copy': []
  'paste': []
  'select-all': []
  'find': []
  'replace': []
  'toggle-sidebar': []
  'toggle-function-browser': []
  'zoom-in': []
  'zoom-out': []
  'reset-zoom': []
  'toggle-settings': []
  'show-function-browser': []
  'validate-lua': []
  'format-code': []
  'show-documentation': []
  'show-keyboard-shortcuts': []
  'show-about': []
}>()

const activeMenu = ref<string | null>(null)
const fileMenuRef = ref<HTMLElement>()
const editMenuRef = ref<HTMLElement>()
const viewMenuRef = ref<HTMLElement>()
const toolsMenuRef = ref<HTMLElement>()
const helpMenuRef = ref<HTMLElement>()

const toggleMenu = (menu: string) => {
  activeMenu.value = activeMenu.value === menu ? null : menu
}

const closeMenu = () => {
  activeMenu.value = null
}

const handleMenuKeydown = (menu: string, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleMenu(menu)
  } else if (event.key === 'Escape') {
    closeMenu()
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const menuRefs = [fileMenuRef.value, editMenuRef.value, viewMenuRef.value, toolsMenuRef.value, helpMenuRef.value]
  
  if (!menuRefs.some(ref => ref?.contains(target))) {
    closeMenu()
  }
}

const showRecentFiles = () => {
  // TODO: Implement recent files functionality
  console.log('Show recent files')
  closeMenu()
}

const exitApp = () => {
  // TODO: Implement app exit functionality
  console.log('Exit app')
  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.menu-item {
  @apply w-full text-left px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2;
}

.shortcut {
  @apply ml-auto text-xs text-gray-400;
}
</style>
