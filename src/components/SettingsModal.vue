<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Settings</h2>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X :size="20" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-4 space-y-4">
        <!-- Model Library Path -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Model Library Path
          </label>
          <div class="flex space-x-2">
            <input
              v-model="localSettings.model_library_path"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Select model library directory..."
            />
            <button
              @click="selectModelLibraryPath"
              class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Folder :size="16" />
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            The Lua library will be automatically detected as a sibling folder to the model library.
          </p>
        </div>

        <!-- Current Paths Info -->
        <div class="bg-gray-50 p-3 rounded-md">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Current Paths:</h4>
          <div class="text-xs text-gray-600 space-y-1">
            <div>
              <span class="font-medium">Model:</span>
              {{ localSettings.model_library_path || 'Not set' }}
            </div>
            <div>
              <span class="font-medium">Lua (auto-detected):</span>
              {{ computedLuaPath || 'Not available' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex justify-end space-x-2 p-4 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveSettings"
          :disabled="isSaving"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { X, Folder } from 'lucide-vue-next'
import type { AppSettings } from '@/types'

interface Props {
  isOpen: boolean
  settings: AppSettings
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'settings-updated': [settings: AppSettings]
}>()

const localSettings = ref<AppSettings>({ ...props.settings })
const isSaving = ref<boolean>(false)

const computedLuaPath = computed(() => {
  if (!localSettings.value.model_library_path) return null

  try {
    // Calculate the lua library path based on model library path
    const modelPath = localSettings.value.model_library_path
    const parts = modelPath.split(/[/\\]/)
    parts[parts.length - 1] = 'luaLibrary'
    return parts.join('/')
  } catch {
    return null
  }
})

const selectModelLibraryPath = async (): Promise<void> => {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Model Library Directory'
    })
    
    if (selected) {
      localSettings.value.model_library_path = selected as string
    }
  } catch (error) {
    console.error('Error selecting model library path:', error)
  }
}

const saveSettings = async (): Promise<void> => {
  isSaving.value = true
  
  try {
    await invoke('save_settings', { settings: localSettings.value })
    emit('settings-updated', { ...localSettings.value })
    closeModal()
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Failed to save settings. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const closeModal = (): void => {
  emit('close')
}

// Watch for settings changes from parent
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })
</script>
