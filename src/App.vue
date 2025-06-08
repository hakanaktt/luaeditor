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
      <div class="w-64 bg-gray-50 border-r border-gray-200">
        <FileExplorer
          :current-directory="currentDirectory"
          :lua-library-path="luaLibraryPath"
          :model-library-path="appSettings.model_library_path"
          @file-selected="handleFileSelected"
          @directory-changed="handleDirectoryChanged"
        />
      </div>
      
      <!-- Editor Area -->
      <div class="flex-1 flex flex-col">
        <Editor 
          v-if="currentFile"
          :file-content="currentFileContent"
          :file-path="currentFile"
          @content-changed="handleContentChanged"
        />
        <div v-else class="flex-1 flex items-center justify-center text-gray-500">
          <div class="text-center">
            <h2 class="text-xl mb-2">Welcome to Lua Macro Editor</h2>
            <p>Open a file to start editing</p>
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
      <span v-else>No file open</span>
      <div class="ml-auto">
        <span v-if="isModified" class="mr-2">●</span>
        <span>Lua Macro Editor</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import Toolbar from './components/Toolbar.vue'
import FileExplorer from './components/FileExplorer.vue'
import Editor from './components/Editor.vue'
import SettingsModal from './components/SettingsModal.vue'
import type { AppSettings } from './types'

const currentDirectory = ref<string>('')
const currentFile = ref<string | null>(null)
const currentFileContent = ref<string>('')
const isModified = ref<boolean>(false)
const showSettingsModal = ref<boolean>(false)
const appSettings = ref<AppSettings>({
  model_library_path: './LIBRARY/modelLibrary'
})
const luaLibraryPath = ref<string>('./LIBRARY/luaLibrary')

const handleNewFile = (): void => {
  currentFile.value = null
  currentFileContent.value = '-- New Lua file\n-- Add your Adeko macro code here\n\n'
  isModified.value = true
}

const handleOpenFile = async (): Promise<void> => {
  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Lua Files',
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
    console.error('Error opening file:', error)
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
    console.error('Error saving file:', error)
  }
}

const handleSaveAs = async (): Promise<void> => {
  try {
    const filePath = await save({
      filters: [{
        name: 'Lua Files',
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
    console.error('Error saving file:', error)
  }
}

const handleFileSelected = async (filePath: string): Promise<void> => {
  try {
    const content = await invoke<string>('read_file', { path: filePath })
    currentFile.value = filePath
    currentFileContent.value = content
    isModified.value = false
  } catch (error) {
    console.error('Error loading file:', error)
  }
}

const handleDirectoryChanged = (newDirectory: string): void => {
  currentDirectory.value = newDirectory
}

const handleContentChanged = (newContent: string): void => {
  currentFileContent.value = newContent
  isModified.value = true
}

const handleSettingsUpdated = async (newSettings: AppSettings): Promise<void> => {
  appSettings.value = { ...newSettings }

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
      console.error('Error calculating lua library path:', error)
    }
  }
}

const loadSettings = async (): Promise<void> => {
  try {
    const settings = await invoke<AppSettings>('load_settings')
    appSettings.value = settings

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
          console.warn(`Lua library directory does not exist: ${calculatedLuaPath}`)
          currentDirectory.value = './LIBRARY/luaLibrary'
          luaLibraryPath.value = './LIBRARY/luaLibrary'
        }
      } catch (error) {
        console.error('Error calculating lua library path:', error)
        currentDirectory.value = './LIBRARY/luaLibrary'
        luaLibraryPath.value = './LIBRARY/luaLibrary'
      }
    } else {
      currentDirectory.value = './LIBRARY/luaLibrary'
      luaLibraryPath.value = './LIBRARY/luaLibrary'
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    // Use default directory if settings can't be loaded
    currentDirectory.value = './LIBRARY/luaLibrary'
    luaLibraryPath.value = './LIBRARY/luaLibrary'
  }
}

onMounted(async () => {
  console.log('Lua Macro Editor initialized')
  await loadSettings()
})
</script>
