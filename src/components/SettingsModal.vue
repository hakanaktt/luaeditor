<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">{{ $t('settings.title') }}</h2>
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
            {{ $t('settings.modelLibraryPath') }}
          </label>
          <div class="flex space-x-2">
            <input
              v-model="localSettings.model_library_path"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="$t('settings.selectModelLibraryDirectory')"
            />
            <button
              @click="selectModelLibraryPath"
              class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Folder :size="16" />
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('settings.autoDetectionNote') }}
          </p>
        </div>

        <!-- Language Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('settings.language') }}
          </label>
          <select
            v-model="selectedLanguage"
            @change="onLanguageChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option
              v-for="lang in availableLanguages"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>

        <!-- Theme Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('settings.editorTheme') }}
          </label>
          <select
            v-model="selectedTheme"
            @change="onThemeChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="vs">Light Theme</option>
            <option value="vs-dark">Dark Theme</option>
            <option value="vibrant-dark">Vibrant Dark</option>
            <option value="vibrant-light">Vibrant Light</option>
            <option value="neon-dark">Neon Dark</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('settings.themeNote') }}
          </p>
        </div>

        <!-- Sidebar Width -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('settings.sidebarWidth') }}
          </label>
          <div class="flex items-center space-x-3">
            <input
              v-model.number="localSettings.sidebar_width"
              type="range"
              min="200"
              max="600"
              step="10"
              class="flex-1"
            />
            <span class="text-sm text-gray-600 w-16">{{ localSettings.sidebar_width || 320 }}px</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('settings.sidebarWidthNote') }}
          </p>
        </div>

        <!-- Current Paths Info -->
        <div class="bg-gray-50 p-3 rounded-md">
          <h4 class="text-sm font-medium text-gray-700 mb-2">{{ $t('settings.currentPaths') }}</h4>
          <div class="text-xs text-gray-600 space-y-1">
            <div>
              <span class="font-medium">{{ $t('settings.model') }}</span>
              {{ localSettings.model_library_path || $t('settings.notSet') }}
            </div>
            <div>
              <span class="font-medium">{{ $t('settings.luaAutoDetected') }}</span>
              {{ computedLuaPath || $t('settings.notAvailable') }}
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
          {{ $t('settings.cancel') }}
        </button>
        <button
          @click="saveSettings"
          :disabled="isSaving"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ isSaving ? $t('settings.saving') : $t('settings.save') }}
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
import { useI18n } from '@/composables/useI18n'
import { colorfulThemeService } from '../services/colorfulThemeService'
import { themeService } from '../services/themeService'
import type { AppSettings } from '@/types'

const { t, changeLanguage, getCurrentLanguage, availableLanguages } = useI18n()

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
const selectedLanguage = ref<string>(getCurrentLanguage().code)
const selectedTheme = ref<string>('vs-dark')

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
      title: t('settings.selectModelLibraryDirectory')
    })

    if (selected) {
      localSettings.value.model_library_path = selected as string
    }
  } catch (error) {
    console.error(t('errors.selectingModelLibraryPath'), error)
  }
}

const onLanguageChange = (): void => {
  changeLanguage(selectedLanguage.value)
  localSettings.value.language = selectedLanguage.value
}

const onThemeChange = (): void => {
  // Apply theme immediately
  if (selectedTheme.value === 'vs' || selectedTheme.value === 'vs-dark') {
    themeService.setTheme(selectedTheme.value as any)
  } else {
    colorfulThemeService.applyTheme(selectedTheme.value)
  }
}

const saveSettings = async (): Promise<void> => {
  isSaving.value = true
  
  try {
    await invoke('save_settings', { settings: localSettings.value })
    emit('settings-updated', { ...localSettings.value })
    closeModal()
  } catch (error) {
    console.error(t('errors.savingFile'), error)
    alert(t('settings.saveError'))
  } finally {
    isSaving.value = false
  }
}

const closeModal = (): void => {
  emit('close')
}

// Watch for settings changes from parent
watch(() => props.settings, (newSettings) => {
  localSettings.value = {
    ...newSettings,
    sidebar_width: newSettings.sidebar_width || 320
  }
  if (newSettings.language) {
    selectedLanguage.value = newSettings.language
  }
}, { deep: true })
</script>
