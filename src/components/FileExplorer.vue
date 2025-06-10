<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="p-3 border-b border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-1">
          <button
            @click="browseFolderDialog"
            class="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            :title="$t('fileExplorer.browseFolder')"
          >
            <FolderOpen :size="14" />
          </button>
          <button
            @click="refreshDirectory"
            class="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            :title="$t('fileExplorer.refresh')"
          >
            <RefreshCw :size="14" />
          </button>
          <button
            @click="showNewFileDialog"
            class="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            :title="$t('fileExplorer.newFile')"
          >
            <FilePlus :size="14" />
          </button>
          <button
            @click="showNewFolderDialog"
            class="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            :title="$t('fileExplorer.newFolder')"
          >
            <FolderPlus :size="14" />
          </button>
        </div>
        <button
          @click="navigateUp"
          :disabled="!canNavigateUp"
          class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="$t('fileExplorer.navigateUp')"
        >
          <ChevronUp :size="16" />
        </button>
      </div>

      <div class="mb-2">
        <span class="text-xs text-gray-500 truncate">{{ displayPath }}</span>
      </div>

      <!-- Search Box -->
      <div class="relative">
        <Search :size="14" class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('functions.searchPlaceholder')"
          class="w-full pl-7 pr-3 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- File Tree -->
    <div class="flex-1 overflow-y-auto p-2" @contextmenu.prevent>
      <div v-if="loading" class="text-center py-4 text-gray-500">
        {{ $t('common.loading') }}
      </div>
      <div v-else-if="error" class="text-center py-4 text-red-500">
        {{ error }}
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="item in filteredItems"
          :key="item.path"
          @click="handleItemClick(item, $event)"
          @contextmenu.prevent="handleContextMenu(item, $event)"
          @keydown="handleKeyDown(item, $event)"
          tabindex="0"
          class="flex items-center space-x-1 p-1 rounded cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{
            'bg-blue-50 border border-blue-200': selectedItems.includes(item.path),
            'bg-blue-100': selectedItems.includes(item.path) && selectedItems.length > 1
          }"
          :style="{ paddingLeft: (8 + (item.depth || 0) * 16) + 'px' }"
        >
          <!-- Expand/Collapse Button -->
          <button
            v-if="item.isDirectory"
            @click.stop="toggleFolder(item)"
            class="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            :class="{ 'invisible': !item.isDirectory }"
            :title="expandedFolders.has(item.path) ? $t('fileExplorer.collapseFolder') : $t('fileExplorer.expandFolder')"
          >
            <Loader2
              v-if="loadingFolders.has(item.path)"
              :size="14"
              class="animate-spin text-gray-400"
            />
            <ChevronRight
              v-else-if="!expandedFolders.has(item.path)"
              :size="14"
              class="text-gray-400"
            />
            <ChevronDown
              v-else
              :size="14"
              class="text-gray-400"
            />
          </button>
          <div v-else class="w-4 flex-shrink-0"></div>

          <!-- File/Folder Icon -->
          <component
            :is="getFileIcon(item)"
            :size="16"
            :class="getFileIconClass(item)"
            class="flex-shrink-0"
          />

          <!-- File/Folder Name -->
          <span
            v-if="!isRenaming || renamingItem !== item.path"
            class="text-sm truncate flex-1 min-w-0"
          >
            {{ item.name }}
          </span>
          <input
            v-else
            ref="renameInput"
            v-model="newName"
            @blur="finishRename"
            @keydown.enter="finishRename"
            @keydown.escape="cancelRename"
            class="text-sm bg-white border border-blue-500 rounded px-1 flex-1 min-w-0"
            @click.stop
          />
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :menu-items="contextMenuItems"
      @item-click="handleContextMenuAction"
      @close="closeContextMenu"
    />

    <!-- Clipboard indicator -->
    <div v-if="clipboard.items.length > 0" class="px-3 py-1 bg-blue-50 border-t border-blue-200 text-xs text-blue-600">
      {{ clipboard.operation === 'copy' ? $t('fileExplorer.copy') : $t('fileExplorer.cut') }}:
      {{ clipboard.items.length }} {{ clipboard.items.length === 1 ? 'item' : 'items' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import {
  ChevronUp, ChevronRight, ChevronDown, Folder, FolderOpen, FileText, FilePlus, FolderPlus, RefreshCw, Search,
  File, FileCode, FileImage, FileVideo, FileAudio, Archive, Settings,
  Edit3, Trash2, Copy, Scissors, Clipboard, ExternalLink, Info, Loader2
} from 'lucide-vue-next'
import { open } from '@tauri-apps/plugin-dialog'
import { useI18n } from '@/composables/useI18n'
import ContextMenu from './ContextMenu.vue'
import type { FileItem } from '@/types'
import type { ContextMenuItem } from './ContextMenu.vue'

const { t } = useI18n()

interface Props {
  currentDirectory: string
  modelLibraryPath?: string
}

const props = defineProps<Props>()

// Define emits
const emit = defineEmits<{
  'file-selected': [filePath: string]
  'directory-changed': [newDirectory: string]
}>()

const fileItems = ref<FileItem[]>([])
const flatFileItems = ref<FileItem[]>([]) // Flattened tree for display
const loading = ref<boolean>(false)
const error = ref<string>('')
const selectedItems = ref<string[]>([])
const searchQuery = ref<string>('')
const isRenaming = ref<boolean>(false)
const renamingItem = ref<string>('')
const newName = ref<string>('')
const renameInput = ref<HTMLInputElement>()
const expandedFolders = ref<Set<string>>(new Set())
const loadingFolders = ref<Set<string>>(new Set())

// Context menu state
const contextMenu = ref({
  visible: false,
  position: { x: 0, y: 0 },
  targetItem: null as FileItem | null
})

// Clipboard state
const clipboard = ref<{
  items: FileItem[]
  operation: 'copy' | 'cut' | null
}>({
  items: [],
  operation: null
})

const displayPath = computed(() => {
  const parts = props.currentDirectory.split(/[/\\]/)
  return parts.slice(-2).join('/')
})

const canNavigateUp = computed(() => {
  return props.currentDirectory !== '.' && props.currentDirectory !== './'
})

const filteredItems = computed(() => {
  let items = flatFileItems.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }

  return items
})

const contextMenuItems = computed((): ContextMenuItem[] => {
  const items: ContextMenuItem[] = []
  const hasSelection = selectedItems.value.length > 0
  const singleSelection = selectedItems.value.length === 1
  const canPaste = clipboard.value.items.length > 0

  // New items
  items.push(
    { id: 'new-file', label: t('fileExplorer.newFile'), icon: FilePlus },
    { id: 'new-folder', label: t('fileExplorer.newFolder'), icon: FolderPlus },
    { id: 'separator', type: 'separator' }
  )

  if (hasSelection) {
    // Edit operations
    if (singleSelection) {
      items.push({ id: 'rename', label: t('fileExplorer.rename'), icon: Edit3, shortcut: 'F2' })
    }

    items.push(
      { id: 'copy', label: t('fileExplorer.copy'), icon: Copy, shortcut: 'Ctrl+C' },
      { id: 'cut', label: t('fileExplorer.cut'), icon: Scissors, shortcut: 'Ctrl+X' }
    )
  }

  if (canPaste) {
    items.push({ id: 'paste', label: t('fileExplorer.paste'), icon: Clipboard, shortcut: 'Ctrl+V' })
  }

  if (hasSelection || canPaste) {
    items.push({ id: 'separator', type: 'separator' })
  }

  if (hasSelection) {
    items.push({
      id: 'delete',
      label: t('fileExplorer.delete'),
      icon: Trash2,
      shortcut: 'Del',
      danger: true
    })
    items.push({ id: 'separator', type: 'separator' })
  }

  // General operations
  items.push(
    { id: 'refresh', label: t('fileExplorer.refresh'), icon: RefreshCw, shortcut: 'F5' },
    { id: 'open-in-explorer', label: t('fileExplorer.openInExplorer'), icon: ExternalLink }
  )

  if (singleSelection) {
    const selectedItem = fileItems.value.find(f => f.path === selectedItems.value[0]) ||
                        flatFileItems.value.find(f => f.path === selectedItems.value[0])
    if (selectedItem?.isDirectory) {
      items.push({ id: 'navigate-to', label: t('fileExplorer.navigateTo'), icon: Folder })
    }
    items.push({ id: 'properties', label: t('fileExplorer.properties'), icon: Info })
  }

  return items
})

// File icon utilities
const getFileIcon = (item: FileItem) => {
  if (item.isDirectory) {
    return expandedFolders.value.has(item.path) ? FolderOpen : Folder
  }

  const ext = item.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'lua':
      return FileCode
    case 'txt':
    case 'md':
    case 'readme':
      return FileText
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return FileImage
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return FileVideo
    case 'mp3':
    case 'wav':
    case 'flac':
      return FileAudio
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
      return Archive
    case 'json':
    case 'xml':
    case 'ini':
    case 'cfg':
    case 'config':
      return Settings
    default:
      return File
  }
}

const getFileIconClass = (item: FileItem) => {
  if (item.isDirectory) return 'text-blue-500'

  const ext = item.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'lua':
      return 'text-purple-500'
    case 'txt':
    case 'md':
      return 'text-gray-500'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return 'text-green-500'
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'text-red-500'
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'text-yellow-500'
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
      return 'text-orange-500'
    case 'json':
    case 'xml':
    case 'ini':
    case 'cfg':
    case 'config':
      return 'text-indigo-500'
    default:
      return 'text-gray-500'
  }
}



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
    // Load the directory tree with initial depth of 1
    await loadDirectoryTree(props.currentDirectory, 1)
  } catch (err) {
    error.value = `${t('common.directoryNotFound')} ${props.currentDirectory}`
    console.error(t('errors.loadingFile'), err)
    fileItems.value = []
    flatFileItems.value = []
  } finally {
    loading.value = false
  }
}

const loadDirectoryTree = async (path: string, maxDepth: number = 1): Promise<void> => {
  interface FileItemData {
    name: string
    path: string
    is_directory: boolean
    depth: number
    parent_path?: string
  }

  const treeData = await invoke<FileItemData[]>('get_directory_tree', {
    path: path,
    maxDepth: maxDepth
  })

  // Convert to FileItem format and build tree structure
  const itemMap = new Map<string, FileItem>()
  const rootItems: FileItem[] = []

  // First pass: create all items
  for (const data of treeData) {
    const item: FileItem = {
      name: data.name,
      path: data.path,
      isDirectory: data.is_directory,
      children: [],
      isExpanded: expandedFolders.value.has(data.path),
      depth: data.depth,
      parentPath: data.parent_path
    }
    itemMap.set(data.path, item)
  }

  // Second pass: build parent-child relationships
  for (const data of treeData) {
    const item = itemMap.get(data.path)!

    if (data.parent_path && itemMap.has(data.parent_path)) {
      const parent = itemMap.get(data.parent_path)!
      parent.children!.push(item)
    } else if (data.depth === 0) {
      rootItems.push(item)
    }
  }

  fileItems.value = rootItems
  updateFlatFileItems()
}

const updateFlatFileItems = (): void => {
  const flattened: FileItem[] = []

  const flattenItems = (items: FileItem[], depth: number = 0): void => {
    for (const item of items) {
      item.depth = depth
      flattened.push(item)

      // Add children if folder is expanded
      if (item.isDirectory && item.children && expandedFolders.value.has(item.path)) {
        flattenItems(item.children, depth + 1)
      }
    }
  }

  flattenItems(fileItems.value)
  flatFileItems.value = flattened
}

const toggleFolder = async (item: FileItem): Promise<void> => {
  if (!item.isDirectory) return

  const isExpanded = expandedFolders.value.has(item.path)

  if (isExpanded) {
    // Collapse folder
    expandedFolders.value.delete(item.path)
    item.isExpanded = false
  } else {
    // Expand folder
    expandedFolders.value.add(item.path)
    item.isExpanded = true

    // Load children if not already loaded
    if (!item.children || item.children.length === 0) {
      loadingFolders.value.add(item.path)
      try {
        await loadFolderContents(item)
      } catch (error) {
        console.error('Error loading folder contents:', error)
        expandedFolders.value.delete(item.path)
        item.isExpanded = false
      } finally {
        loadingFolders.value.delete(item.path)
      }
    }
  }

  updateFlatFileItems()
}

const loadFolderContents = async (folder: FileItem): Promise<void> => {
  const entries = await invoke<string[]>('read_directory', { path: folder.path })
  const children: FileItem[] = []

  for (const entry of entries) {
    const fullPath = `${folder.path}/${entry}`.replace(/\/+/g, '/')
    const isDir = await invoke<boolean>('is_directory', { path: fullPath })

    children.push({
      name: entry,
      path: fullPath,
      isDirectory: isDir,
      children: [],
      isExpanded: false,
      depth: (folder.depth || 0) + 1,
      parentPath: folder.path
    })
  }

  // Sort: directories first, then files, both alphabetically
  children.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })

  folder.children = children
}

const navigateUp = (): void => {
  const parts = props.currentDirectory.split(/[/\\]/)
  if (parts.length > 1) {
    const parentPath = parts.slice(0, -1).join('/')
    emit('directory-changed', parentPath || '.')
  }
}

const handleItemClick = (item: FileItem, event: MouseEvent): void => {
  if (event.ctrlKey || event.metaKey) {
    // Multi-select with Ctrl/Cmd
    const index = selectedItems.value.indexOf(item.path)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(item.path)
    }
  } else if (event.shiftKey && selectedItems.value.length > 0) {
    // Range select with Shift
    const lastSelected = selectedItems.value[selectedItems.value.length - 1]
    const lastIndex = fileItems.value.findIndex(f => f.path === lastSelected)
    const currentIndex = fileItems.value.findIndex(f => f.path === item.path)

    if (lastIndex !== -1 && currentIndex !== -1) {
      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      selectedItems.value = fileItems.value.slice(start, end + 1).map(f => f.path)
    }
  } else {
    // Single click - open files and folders directly
    selectedItems.value = [item.path]

    // Open the item immediately on single click
    if (item.isDirectory) {
      // For directories, toggle expansion
      toggleFolder(item)
    } else if (item.name.endsWith('.lua')) {
      // Load .lua files for script writing and debugging
      emit('file-selected', item.path)
    } else {
      // For model files and other files, just select them
      emit('file-selected', item.path)
    }
  }
}



const handleContextMenu = (item: FileItem, event: MouseEvent): void => {
  // Select the item if not already selected
  if (!selectedItems.value.includes(item.path)) {
    selectedItems.value = [item.path]
  }

  contextMenu.value = {
    visible: true,
    position: { x: event.clientX, y: event.clientY },
    targetItem: item
  }
}

const closeContextMenu = (): void => {
  contextMenu.value.visible = false
  contextMenu.value.targetItem = null
}

const handleKeyDown = (item: FileItem, event: KeyboardEvent): void => {
  switch (event.key) {
    case 'F2':
      if (selectedItems.value.length === 1 && selectedItems.value[0] === item.path) {
        startRename(item)
      }
      break
    case 'Delete':
      if (selectedItems.value.includes(item.path)) {
        deleteSelectedItems()
      }
      break
    case 'F5':
      refreshDirectory()
      break
    case 'Enter':
      // Use single-click behavior for Enter key
      if (item.isDirectory) {
        toggleFolder(item)
      } else {
        emit('file-selected', item.path)
      }
      break
  }

  // Handle Ctrl+C, Ctrl+X, Ctrl+V
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'c':
        copySelectedItems()
        event.preventDefault()
        break
      case 'x':
        cutSelectedItems()
        event.preventDefault()
        break
      case 'v':
        pasteItems()
        event.preventDefault()
        break
    }
  }
}

const handleContextMenuAction = (actionId: string): void => {
  switch (actionId) {
    case 'new-file':
      showNewFileDialog()
      break
    case 'new-folder':
      showNewFolderDialog()
      break
    case 'rename':
      if (selectedItems.value.length === 1) {
        const item = fileItems.value.find(f => f.path === selectedItems.value[0])
        if (item) startRename(item)
      }
      break
    case 'copy':
      copySelectedItems()
      break
    case 'cut':
      cutSelectedItems()
      break
    case 'paste':
      pasteItems()
      break
    case 'delete':
      deleteSelectedItems()
      break
    case 'refresh':
      refreshDirectory()
      break
    case 'open-in-explorer':
      openInExplorer()
      break
    case 'navigate-to':
      navigateToFolder()
      break
    case 'properties':
      showProperties()
      break
  }
}

// File operation methods
const showNewFileDialog = (): void => {
  const fileName = prompt(t('fileExplorer.enterFileName'), 'new-file.lua')
  if (fileName && fileName.trim()) {
    createNewFile(fileName.trim())
  }
}

const showNewFolderDialog = (): void => {
  const folderName = prompt(t('fileExplorer.enterFolderName'), 'New Folder')
  if (folderName && folderName.trim()) {
    createNewFolder(folderName.trim())
  }
}

const createNewFile = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${props.currentDirectory}/${fileName}`.replace(/\/+/g, '/')

    // Check if file already exists
    const exists = await invoke<boolean>('file_exists', { path: filePath })
    if (exists) {
      alert(t('fileExplorer.fileExists'))
      return
    }

    const defaultContent = fileName.endsWith('.lua') ? t('files.newFileComment') : ''
    await invoke('create_file', { path: filePath, content: defaultContent })
    await loadDirectory()

    // Select the new file
    selectedItems.value = [filePath]
  } catch (error) {
    console.error('Error creating file:', error)
    alert(t('fileExplorer.createFileError'))
  }
}

const createNewFolder = async (folderName: string): Promise<void> => {
  try {
    const folderPath = `${props.currentDirectory}/${folderName}`.replace(/\/+/g, '/')

    // Check if folder already exists
    const exists = await invoke<boolean>('file_exists', { path: folderPath })
    if (exists) {
      alert(t('fileExplorer.folderExists'))
      return
    }

    await invoke('create_directory', { path: folderPath })
    await loadDirectory()

    // Select the new folder
    selectedItems.value = [folderPath]
  } catch (error) {
    console.error('Error creating folder:', error)
    alert(t('fileExplorer.createFolderError'))
  }
}

const startRename = (item: FileItem): void => {
  isRenaming.value = true
  renamingItem.value = item.path
  newName.value = item.name

  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      renameInput.value.select()
    }
  })
}

const finishRename = async (): Promise<void> => {
  if (!isRenaming.value || !renamingItem.value || !newName.value.trim()) {
    cancelRename()
    return
  }

  const oldItem = fileItems.value.find(f => f.path === renamingItem.value)
  if (!oldItem) {
    cancelRename()
    return
  }

  const newFileName = newName.value.trim()
  if (newFileName === oldItem.name) {
    cancelRename()
    return
  }

  try {
    const parentDir = oldItem.path.substring(0, oldItem.path.lastIndexOf('/'))
    const newPath = `${parentDir}/${newFileName}`.replace(/\/+/g, '/')

    // Check if target already exists
    const exists = await invoke<boolean>('file_exists', { path: newPath })
    if (exists) {
      alert(oldItem.isDirectory ? t('fileExplorer.folderExists') : t('fileExplorer.fileExists'))
      cancelRename()
      return
    }

    await invoke('rename_file_or_directory', {
      oldPath: oldItem.path,
      newPath: newPath
    })

    await loadDirectory()
    selectedItems.value = [newPath]
  } catch (error) {
    console.error('Error renaming:', error)
    alert(t('fileExplorer.renameError'))
  }

  cancelRename()
}

const cancelRename = (): void => {
  isRenaming.value = false
  renamingItem.value = ''
  newName.value = ''
}

const copySelectedItems = (): void => {
  const items = fileItems.value.filter(item => selectedItems.value.includes(item.path))
  clipboard.value = {
    items: [...items],
    operation: 'copy'
  }
}

const cutSelectedItems = (): void => {
  const items = fileItems.value.filter(item => selectedItems.value.includes(item.path))
  clipboard.value = {
    items: [...items],
    operation: 'cut'
  }
}

const pasteItems = async (): Promise<void> => {
  if (clipboard.value.items.length === 0) return

  try {
    for (const item of clipboard.value.items) {
      const fileName = item.name
      const targetPath = `${props.currentDirectory}/${fileName}`.replace(/\/+/g, '/')

      // Check if target already exists
      const exists = await invoke<boolean>('file_exists', { path: targetPath })
      if (exists) {
        // For now, skip existing files. Could implement rename logic here
        continue
      }

      if (clipboard.value.operation === 'copy') {
        await invoke('copy_file_or_directory', {
          sourcePath: item.path,
          targetPath: targetPath
        })
      } else if (clipboard.value.operation === 'cut') {
        await invoke('rename_file_or_directory', {
          oldPath: item.path,
          newPath: targetPath
        })
      }
    }

    // Clear clipboard if it was a cut operation
    if (clipboard.value.operation === 'cut') {
      clipboard.value = { items: [], operation: null }
    }

    await loadDirectory()
  } catch (error) {
    console.error('Error pasting items:', error)
    alert(t('fileExplorer.pasteError'))
  }
}

const deleteSelectedItems = async (): Promise<void> => {
  if (selectedItems.value.length === 0) return

  const items = fileItems.value.filter(item => selectedItems.value.includes(item.path))

  let confirmMessage: string
  if (items.length === 1) {
    confirmMessage = t('fileExplorer.confirmDelete', { name: items[0].name })
  } else {
    confirmMessage = t('fileExplorer.confirmDeleteMultiple', { count: items.length })
  }

  if (!confirm(confirmMessage)) return

  try {
    for (const item of items) {
      await invoke('delete_file_or_directory', { path: item.path })
    }

    selectedItems.value = []
    await loadDirectory()
  } catch (error) {
    console.error('Error deleting items:', error)
    alert(t('fileExplorer.deleteError'))
  }
}

const browseFolderDialog = async (): Promise<void> => {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: t('fileExplorer.browseFolder')
    })

    if (selected) {
      emit('directory-changed', selected as string)
    }
  } catch (error) {
    console.error('Error selecting folder:', error)
    alert(t('fileExplorer.refreshError'))
  }
}

const refreshDirectory = async (): Promise<void> => {
  try {
    await loadDirectory()
  } catch (error) {
    console.error('Error refreshing directory:', error)
    alert(t('fileExplorer.refreshError'))
  }
}

const openInExplorer = (): void => {
  // This would need platform-specific implementation
  // For now, just show an alert
  alert('Open in Explorer functionality would be implemented here')
}

const navigateToFolder = (): void => {
  if (selectedItems.value.length === 1) {
    const item = flatFileItems.value.find(f => f.path === selectedItems.value[0])
    if (item?.isDirectory) {
      emit('directory-changed', item.path)
    }
  }
}

const showProperties = (): void => {
  if (selectedItems.value.length === 1) {
    const item = flatFileItems.value.find(f => f.path === selectedItems.value[0])
    if (item) {
      alert(`Properties for: ${item.name}\nPath: ${item.path}\nType: ${item.isDirectory ? 'Directory' : 'File'}`)
    }
  }
}



// Watch for directory changes
watch(() => props.currentDirectory, () => {
  selectedItems.value = []
  clipboard.value = { items: [], operation: null }
  expandedFolders.value.clear()
  loadingFolders.value.clear()
  loadDirectory()
}, { immediate: true })

// Global keyboard shortcuts
const handleGlobalKeyDown = (event: KeyboardEvent): void => {
  if (event.target instanceof HTMLInputElement) return // Don't interfere with input fields

  switch (event.key) {
    case 'F5':
      refreshDirectory()
      event.preventDefault()
      break
  }

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'a':
        // Select all
        selectedItems.value = fileItems.value.map(item => item.path)
        event.preventDefault()
        break
    }
  }
}

onMounted(() => {
  loadDirectory()
  document.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>
