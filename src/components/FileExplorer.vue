<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700">{{ $t('tabs.files') }}</h3>

      <!-- Library Selection -->
      <div class="mt-2 flex space-x-1">
        <button
          @click="switchToLuaLibrary"
          :class="[
            'px-2 py-1 text-xs rounded transition-colors',
            isInLuaLibrary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Lua
        </button>
        <button
          @click="switchToModelLibrary"
          :class="[
            'px-2 py-1 text-xs rounded transition-colors',
            isInModelLibrary ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Model
        </button>
      </div>

      <div class="mt-2 flex items-center space-x-1">
        <button
          @click="navigateUp"
          :disabled="!canNavigateUp"
          class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp :size="16" />
        </button>
        <span class="text-xs text-gray-500 truncate flex-1">{{ displayPath }}</span>
      </div>
    </div>
    
    <!-- File Tree -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="loading" class="text-center py-4 text-gray-500">
        {{ $t('common.loading') }}
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else class="space-y-1">
        <div 
          v-for="item in fileItems" 
          :key="item.path"
          @click="handleItemClick(item)"
          @dblclick="handleItemDoubleClick(item)"
          class="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50 border border-blue-200': selectedItem === item.path }"
        >
          <Folder v-if="item.isDirectory" :size="16" class="text-blue-500" />
          <FileText v-else :size="16" class="text-gray-500" />
          <span class="text-sm truncate">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { ChevronUp, Folder, FileText } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'
import type { FileItem } from '@/types'

const { t } = useI18n()

interface Props {
  currentDirectory: string
  luaLibraryPath?: string
  modelLibraryPath?: string
}

const props = defineProps<Props>()

// Define emits
const emit = defineEmits<{
  'file-selected': [filePath: string]
  'directory-changed': [newDirectory: string]
}>()

const fileItems = ref<FileItem[]>([])
const loading = ref<boolean>(false)
const error = ref<string>('')
const selectedItem = ref<string>('')

const displayPath = computed(() => {
  const parts = props.currentDirectory.split(/[/\\]/)
  return parts.slice(-2).join('/')
})

const canNavigateUp = computed(() => {
  return props.currentDirectory !== '.' && props.currentDirectory !== './'
})

const isInLuaLibrary = computed(() => {
  return props.luaLibraryPath && props.currentDirectory.includes(props.luaLibraryPath)
})

const isInModelLibrary = computed(() => {
  return props.modelLibraryPath && props.currentDirectory.includes(props.modelLibraryPath)
})

const loadDirectory = async (): Promise<void> => {
  loading.value = true
  error.value = ''

  // Don't try to load if currentDirectory is empty
  if (!props.currentDirectory) {
    loading.value = false
    error.value = t('common.noDirectorySpecified')
    return
  }

  try {
    const entries = await invoke<string[]>('read_directory', { path: props.currentDirectory })

    const items: FileItem[] = []

    for (const entry of entries) {
      const fullPath = `${props.currentDirectory}/${entry}`.replace(/\/+/g, '/')
      const isDir = await invoke<boolean>('is_directory', { path: fullPath })

      items.push({
        name: entry,
        path: fullPath,
        isDirectory: isDir
      })
    }

    // Sort: directories first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    fileItems.value = items
  } catch (err) {
    error.value = `${t('common.directoryNotFound')} ${props.currentDirectory}`
    console.error(t('errors.loadingFile'), err)
    fileItems.value = []
  } finally {
    loading.value = false
  }
}

const navigateUp = (): void => {
  const parts = props.currentDirectory.split(/[/\\]/)
  if (parts.length > 1) {
    const parentPath = parts.slice(0, -1).join('/')
    emit('directory-changed', parentPath || '.')
  }
}

const handleItemClick = (item: FileItem): void => {
  selectedItem.value = item.path
}

const handleItemDoubleClick = (item: FileItem): void => {
  if (item.isDirectory) {
    emit('directory-changed', item.path)
  } else if (item.name.endsWith('.lua')) {
    emit('file-selected', item.path)
  }
}

const switchToLuaLibrary = (): void => {
  if (props.luaLibraryPath) {
    emit('directory-changed', props.luaLibraryPath)
  }
}

const switchToModelLibrary = (): void => {
  if (props.modelLibraryPath) {
    emit('directory-changed', props.modelLibraryPath)
  }
}

// Watch for directory changes
watch(() => props.currentDirectory, loadDirectory, { immediate: true })

onMounted(() => {
  loadDirectory()
})
</script>
