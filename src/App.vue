<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- Toolbar -->
    <Toolbar
      @new-file="handleNewFile"
      @open-file="handleOpenFile"
      @save-file="handleSaveFile"
      @save-as="handleSaveAs"
      @toggle-settings="showSettingsModal = true"
    />
    
    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- File Explorer -->
      <div
        class="bg-gray-50 border-r border-gray-200 relative flex-shrink-0"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <div class="h-full flex flex-col">
          <!-- Tab Navigation -->
          <div class="flex border-b border-gray-200">
            <button
              :class="['flex-1 px-3 py-2 text-sm font-medium',
                       activeTab === 'files' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
              @click="activeTab = 'files'"
            >
              {{ $t('tabs.files') }}
            </button>
            <button
              :class="['flex-1 px-3 py-2 text-sm font-medium',
                       activeTab === 'functions' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
              @click="activeTab = 'functions'"
            >
              {{ $t('tabs.functions') }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-hidden">
            <FileExplorer
              v-show="activeTab === 'files'"
              :current-directory="currentDirectory"
              :lua-library-path="luaLibraryPath"
              :model-library-path="appSettings.model_library_path"
              @file-selected="handleFileSelected"
              @directory-changed="handleDirectoryChanged"
            />
            <FunctionBrowser
              v-show="activeTab === 'functions'"
              :on-insert-function="handleInsertFunction"
            />
          </div>
        </div>

        <!-- Resize Handle -->
        <div
          class="sidebar-resize-handle"
          @mousedown="startResize"
        ></div>
      </div>

      <!-- Editor Area -->
      <div class="flex-1 flex flex-col">
        <Editor
          v-if="currentFile"
          ref="editorRef"
          :file-content="currentFileContent"
          :file-path="currentFile"
          @content-changed="handleContentChanged"
        />
        <div v-else class="flex-1 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <h2 class="text-xl mb-2">{{ $t('app.welcome') }}</h2>
            <p>{{ $t('app.welcomeMessage') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal
      :is-open="showSettingsModal"
      :settings="appSettings"
      @close="showSettingsModal = false"
      @settings-updated="handleSettingsUpdated"
    />

    <!-- Status Bar -->
    <div class="h-6 bg-blue-600 text-white text-xs flex items-center px-2">
      <span v-if="currentFile">{{ currentFile }}</span>
      <span v-else>{{ $t('app.noFileOpen') }}</span>
      <div class="ml-auto">
        <span v-if="isModified" class="mr-2">{{ $t('status.modified') }}</span>
        <span>{{ $t('status.luaMacroEditor') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import Toolbar from './components/Toolbar.vue'
import FileExplorer from './components/FileExplorer.vue'
import Editor from './components/Editor.vue'
import SettingsModal from './components/SettingsModal.vue'
import FunctionBrowser from './components/FunctionBrowser.vue'
import { useI18n } from '@/composables/useI18n'
import type { AppSettings } from './types'

const { t, changeLanguage } = useI18n()

const currentDirectory = ref<string>('')
const currentFile = ref<string | null>(null)
const currentFileContent = ref<string>('')
const isModified = ref<boolean>(false)
const showSettingsModal = ref<boolean>(false)
const activeTab = ref<'files' | 'functions'>('files')
const editorRef = ref<InstanceType<typeof Editor> | null>(null)
const appSettings = ref<AppSettings>({
  model_library_path: './LIBRARY/modelLibrary',
  language: 'en',
  sidebar_width: 320
})
const luaLibraryPath = ref<string>('./LIBRARY/luaLibrary')

// Sidebar resize functionality
const sidebarWidth = ref<number>(320)
const isResizing = ref<boolean>(false)
const minSidebarWidth = 200
const maxSidebarWidth = 600

const handleNewFile = (): void => {
  currentFile.value = null
  currentFileContent.value = t('files.newFileComment')
  isModified.value = true
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
      currentFileContent.value = content
      isModified.value = false
    }
  } catch (error) {
    console.error(t('errors.openingFile'), error)
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
  } catch (error) {
    console.error(t('errors.savingFile'), error)
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

const handleInsertFunction = (functionCall: string): void => {
  if (editorRef.value) {
    editorRef.value.insertText(functionCall)
    // Switch to files tab to see the editor
    activeTab.value = 'files'
  }
}

// Sidebar resize methods
const startResize = (event: MouseEvent): void => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const handleResize = (event: MouseEvent): void => {
  if (!isResizing.value) return

  const newWidth = event.clientX
  if (newWidth >= minSidebarWidth && newWidth <= maxSidebarWidth) {
    sidebarWidth.value = newWidth
  }
}

const stopResize = (): void => {
  if (isResizing.value) {
    isResizing.value = false
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

      // Update current directory to lua library path
      currentDirectory.value = calculatedLuaPath
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
        currentDirectory.value = calculatedLuaPath

        // Verify the directory exists
        const dirExists = await invoke<boolean>('is_directory', { path: calculatedLuaPath })
        if (!dirExists) {
          console.warn(`${t('status.directoryNotExist')} ${calculatedLuaPath}`)
          currentDirectory.value = './LIBRARY/luaLibrary'
          luaLibraryPath.value = './LIBRARY/luaLibrary'
        }
      } catch (error) {
        console.error(t('errors.calculatingLuaPath'), error)
        currentDirectory.value = './LIBRARY/luaLibrary'
        luaLibraryPath.value = './LIBRARY/luaLibrary'
      }
    } else {
      currentDirectory.value = './LIBRARY/luaLibrary'
      luaLibraryPath.value = './LIBRARY/luaLibrary'
    }
  } catch (error) {
    console.error(t('errors.loadingSettings'), error)
    // Use default directory if settings can't be loaded
    currentDirectory.value = './LIBRARY/luaLibrary'
    luaLibraryPath.value = './LIBRARY/luaLibrary'
  }
}

onMounted(async () => {
  console.log(t('status.initialized'))
  await loadSettings()
})

onUnmounted(() => {
  // Clean up event listeners if component is unmounted during resize
  if (isResizing.value) {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }
})
</script>
