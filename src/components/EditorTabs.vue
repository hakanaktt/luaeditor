<template>
  <div class="h-9 bg-gray-100 border-b border-gray-200 flex items-center overflow-hidden">
    <!-- Tab Container -->
    <div class="flex-1 flex overflow-x-auto scrollbar-thin">
      <div
        v-for="file in files"
        :key="file.id"
        :class="[
          'flex items-center px-3 py-1 border-r border-gray-200 cursor-pointer min-w-0 max-w-48 group',
          'hover:bg-gray-50 transition-colors duration-150',
          file.id === activeFileId ? 'bg-white border-b-2 border-blue-500' : 'bg-gray-100'
        ]"
        @click="$emit('tab-click', file.id)"
        @contextmenu.prevent="showContextMenu($event, file)"
      >
        <!-- File Icon -->
        <FileText :size="14" class="text-gray-500 mr-2 flex-shrink-0" />
        
        <!-- File Name -->
        <span 
          :class="[
            'text-sm truncate',
            file.id === activeFileId ? 'text-gray-900' : 'text-gray-600'
          ]"
          :title="file.path"
        >
          {{ file.name }}
        </span>
        
        <!-- Modified Indicator -->
        <span 
          v-if="file.isModified" 
          class="ml-1 text-orange-500 flex-shrink-0"
          title="Modified"
        >
          ●
        </span>
        
        <!-- Close Button -->
        <button
          :class="[
            'ml-2 p-0.5 rounded hover:bg-gray-200 flex-shrink-0 transition-colors',
            'opacity-0 group-hover:opacity-100',
            file.id === activeFileId ? 'opacity-100' : ''
          ]"
          @click.stop="$emit('tab-close', file.id)"
          :title="$t('tabs.closeTab')"
        >
          <X :size="12" class="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    </div>
    
    <!-- Tab Actions -->
    <div class="flex items-center px-2 border-l border-gray-200">
      <!-- New Tab Button -->
      <button
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        @click="$emit('new-tab')"
        :title="$t('tabs.newTab')"
      >
        <Plus :size="14" class="text-gray-500" />
      </button>
      
      <!-- Split Editor Button -->
      <button
        v-if="showSplitButton"
        class="p-1 rounded hover:bg-gray-200 transition-colors ml-1"
        @click="$emit('split-editor')"
        :title="$t('tabs.splitEditor')"
      >
        <SplitSquareVertical :size="14" class="text-gray-500" />
      </button>
      
      <!-- Tab Menu -->
      <button
        class="p-1 rounded hover:bg-gray-200 transition-colors ml-1"
        @click="showTabMenu = !showTabMenu"
        :title="$t('tabs.tabMenu')"
      >
        <MoreHorizontal :size="14" class="text-gray-500" />
      </button>
    </div>
    
    <!-- Tab Menu Dropdown -->
    <div
      v-if="showTabMenu"
      class="absolute top-9 right-2 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-48"
      @click.stop
    >
      <button
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
        @click="closeAllTabs"
      >
        <X :size="14" class="mr-2" />
        {{ $t('tabs.closeAll') }}
      </button>
      <button
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
        @click="closeOtherTabs"
      >
        <X :size="14" class="mr-2" />
        {{ $t('tabs.closeOthers') }}
      </button>
      <button
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
        @click="closeModifiedTabs"
      >
        <Save :size="14" class="mr-2" />
        {{ $t('tabs.closeModified') }}
      </button>
    </div>
    
    <!-- Context Menu -->
    <ContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :menu-items="contextMenuItems"
      @item-click="handleContextMenuClick"
      @close="contextMenu.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, X, Plus, SplitSquareVertical, MoreHorizontal, Save, Copy, FolderOpen } from 'lucide-vue-next'
import ContextMenu from './ContextMenu.vue'
import { useI18n } from '@/composables/useI18n'
import type { EditorFile } from '@/types'

interface Props {
  files: EditorFile[]
  activeFileId: string | null
  showSplitButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSplitButton: true
})

const emit = defineEmits<{
  'tab-click': [fileId: string]
  'tab-close': [fileId: string]
  'new-tab': []
  'split-editor': []
  'close-all': []
  'close-others': [fileId: string]
  'close-modified': []
}>()

const { t } = useI18n()

const showTabMenu = ref(false)
const contextMenu = ref({
  visible: false,
  position: { x: 0, y: 0 },
  fileId: null as string | null
})

const contextMenuItems = computed(() => [
  { id: 'close', label: t('tabs.close'), icon: X },
  { id: 'close-others', label: t('tabs.closeOthers'), icon: X },
  { id: 'close-all', label: t('tabs.closeAll'), icon: X },
  { id: 'separator', type: 'separator' as const },
  { id: 'copy-path', label: t('tabs.copyPath'), icon: Copy },
  { id: 'reveal-in-explorer', label: t('tabs.revealInExplorer'), icon: FolderOpen }
])

const showContextMenu = (event: MouseEvent, file: EditorFile) => {
  contextMenu.value = {
    visible: true,
    position: { x: event.clientX, y: event.clientY },
    fileId: file.id
  }
}

const handleContextMenuClick = (itemId: string) => {
  const fileId = contextMenu.value.fileId
  if (!fileId) return
  
  switch (itemId) {
    case 'close':
      emit('tab-close', fileId)
      break
    case 'close-others':
      emit('close-others', fileId)
      break
    case 'close-all':
      emit('close-all')
      break
    case 'copy-path':
      copyPath(fileId)
      break
    case 'reveal-in-explorer':
      revealInExplorer(fileId)
      break
  }
  
  contextMenu.value.visible = false
}

const closeAllTabs = () => {
  emit('close-all')
  showTabMenu.value = false
}

const closeOtherTabs = () => {
  if (props.activeFileId) {
    emit('close-others', props.activeFileId)
  }
  showTabMenu.value = false
}

const closeModifiedTabs = () => {
  emit('close-modified')
  showTabMenu.value = false
}

const copyPath = (fileId: string) => {
  const file = props.files.find(f => f.id === fileId)
  if (file && navigator.clipboard) {
    navigator.clipboard.writeText(file.path)
  }
}

const revealInExplorer = (fileId: string) => {
  const file = props.files.find(f => f.id === fileId)
  if (file) {
    // TODO: Implement reveal in file explorer
    console.log('Reveal in explorer:', file.path)
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  showTabMenu.value = false
  contextMenu.value.visible = false
})
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
