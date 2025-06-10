<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Split Layout -->
    <div
      v-if="layout.groups.length > 0"
      class="flex-1 flex min-h-0"
      :class="layout.splitDirection === 'vertical' ? 'flex-row' : 'flex-col'"
    >
      <template v-for="(group, index) in layout.groups" :key="group.id">
        <!-- Resize Handle (between groups) -->
        <div
          v-if="index > 0 && layout.groups.length > 1"
          :class="[
            'bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors',
            layout.splitDirection === 'vertical' ? 'w-1' : 'h-1 cursor-row-resize'
          ]"
          @mousedown="startResize(index)"
        ></div>
        
        <!-- Editor Group -->
        <div
          :class="[
            'flex-1 min-w-0 min-h-0 border border-gray-200 flex flex-col',
            group.id === layout.activeGroupId ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
          ]"
          @click="setActiveGroup(group.id)"
        >
          <EditorGroup
            :ref="el => setGroupRef(group.id, el)"
            :group="group"
            :show-split-button="layout.groups.length === 1"
            @file-changed="handleFileChanged"
            @cursor-changed="handleCursorChanged"
            @tab-click="handleTabClick"
            @tab-close="handleTabClose"
            @new-tab="handleNewTab"
            @split-editor="handleSplitEditor"
            @close-all="handleCloseAll"
            @close-others="handleCloseOthers"
            @close-modified="handleCloseModified"
            @group-focus="setActiveGroup"
          />
        </div>
      </template>
    </div>
    
    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center text-gray-500">
      <div class="text-center">
        <h2 class="text-xl mb-2">{{ $t('app.welcome') }}</h2>
        <p class="mb-4">{{ $t('app.welcomeMessage') }}</p>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
          @click="createNewFile"
        >
          {{ $t('editor.newFile') }}
        </button>
        <button
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          @click="createTestFile"
        >
          Create Test File
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EditorGroup from './EditorGroup.vue'
import { useI18n } from '@/composables/useI18n'
import type { SplitLayout, EditorGroup as EditorGroupType, EditorFile } from '@/types'

interface Props {
  layout: SplitLayout
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'layout-changed': [layout: SplitLayout]
  'file-changed': [groupId: string, fileId: string, content: string]
  'cursor-changed': [groupId: string, fileId: string, line: number, column: number]
  'active-file-changed': [file: EditorFile | null]
}>()

const { t } = useI18n()

const groupRefs = ref<Map<string, InstanceType<typeof EditorGroup>>>(new Map())
const isResizing = ref(false)
const resizeIndex = ref(0)



const setGroupRef = (groupId: string, el: any) => {
  if (el) {
    groupRefs.value.set(groupId, el)
  } else {
    groupRefs.value.delete(groupId)
  }
}

const setActiveGroup = (groupId: string) => {
  const newLayout = { ...props.layout, activeGroupId: groupId }
  emit('layout-changed', newLayout)
  
  // Emit active file change
  const activeGroup = newLayout.groups.find(g => g.id === groupId)
  const file = activeGroup?.activeFileId 
    ? activeGroup.files.find(f => f.id === activeGroup.activeFileId) || null
    : null
  emit('active-file-changed', file)
}

const handleFileChanged = (groupId: string, fileId: string, content: string) => {
  emit('file-changed', groupId, fileId, content)
}

const handleCursorChanged = (groupId: string, fileId: string, line: number, column: number) => {
  emit('cursor-changed', groupId, fileId, line, column)
}

const handleTabClick = (groupId: string, fileId: string) => {
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === groupId)
  if (group) {
    group.activeFileId = fileId
    newLayout.activeGroupId = groupId
    emit('layout-changed', newLayout)
    
    // Emit active file change
    const file = group.files.find(f => f.id === fileId) || null
    emit('active-file-changed', file)
  }
}

const handleTabClose = (groupId: string, fileId: string) => {
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === groupId)
  if (group) {
    const fileIndex = group.files.findIndex(f => f.id === fileId)
    if (fileIndex !== -1) {
      group.files.splice(fileIndex, 1)
      
      // Update active file if the closed file was active
      if (group.activeFileId === fileId) {
        if (group.files.length > 0) {
          // Switch to the next file, or previous if it was the last
          const newIndex = Math.min(fileIndex, group.files.length - 1)
          group.activeFileId = group.files[newIndex].id
        } else {
          group.activeFileId = null
        }
      }
      
      // Remove empty groups (except if it's the last group)
      if (group.files.length === 0 && newLayout.groups.length > 1) {
        const groupIndex = newLayout.groups.findIndex(g => g.id === groupId)
        newLayout.groups.splice(groupIndex, 1)
        
        // Update active group if needed
        if (newLayout.activeGroupId === groupId) {
          newLayout.activeGroupId = newLayout.groups[0]?.id || null
        }
        
        // Reset split direction if only one group remains
        if (newLayout.groups.length === 1) {
          newLayout.splitDirection = null
        }
      }
      
      emit('layout-changed', newLayout)
      
      // Emit active file change
      const activeGroup = newLayout.groups.find(g => g.id === newLayout.activeGroupId)
      const file = activeGroup?.activeFileId 
        ? activeGroup.files.find(f => f.id === activeGroup.activeFileId) || null
        : null
      emit('active-file-changed', file)
    }
  }
}

const handleNewTab = (groupId: string) => {
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === groupId)
  if (group) {
    const newFile: EditorFile = {
      id: `untitled-${Date.now()}`,
      path: '',
      name: 'Untitled',
      content: t('files.newFileComment'),
      isModified: true,
      isUntitled: true,
      cursorLine: 1,
      cursorColumn: 1
    }
    
    group.files.push(newFile)
    group.activeFileId = newFile.id
    newLayout.activeGroupId = groupId
    
    emit('layout-changed', newLayout)
    emit('active-file-changed', newFile)
  }
}

const handleSplitEditor = (groupId: string) => {
  const newLayout = { ...props.layout }
  const sourceGroup = newLayout.groups.find(g => g.id === groupId)
  
  if (sourceGroup && sourceGroup.activeFileId) {
    const activeFile = sourceGroup.files.find(f => f.id === sourceGroup.activeFileId)
    if (activeFile) {
      // Create new group with the active file
      const newGroup: EditorGroupType = {
        id: `group-${Date.now()}`,
        activeFileId: activeFile.id,
        files: [{ ...activeFile }] // Clone the file
      }
      
      newLayout.groups.push(newGroup)
      newLayout.splitDirection = 'vertical'
      newLayout.activeGroupId = newGroup.id
      
      emit('layout-changed', newLayout)
      emit('active-file-changed', activeFile)
    }
  }
}

const handleCloseAll = (groupId: string) => {
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === groupId)
  if (group) {
    group.files = []
    group.activeFileId = null
    
    // Remove empty groups (except if it's the last group)
    if (newLayout.groups.length > 1) {
      const groupIndex = newLayout.groups.findIndex(g => g.id === groupId)
      newLayout.groups.splice(groupIndex, 1)
      
      // Update active group if needed
      if (newLayout.activeGroupId === groupId) {
        newLayout.activeGroupId = newLayout.groups[0]?.id || null
      }
      
      // Reset split direction if only one group remains
      if (newLayout.groups.length === 1) {
        newLayout.splitDirection = null
      }
    }
    
    emit('layout-changed', newLayout)
    emit('active-file-changed', null)
  }
}

const handleCloseOthers = (groupId: string, keepFileId: string) => {
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === groupId)
  if (group) {
    const keepFile = group.files.find(f => f.id === keepFileId)
    if (keepFile) {
      group.files = [keepFile]
      group.activeFileId = keepFileId
      
      emit('layout-changed', newLayout)
      emit('active-file-changed', keepFile)
    }
  }
}

const handleCloseModified = (groupId: string) => {
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === groupId)
  if (group) {
    group.files = group.files.filter(f => !f.isModified)
    
    // Update active file if it was modified
    if (group.activeFileId && !group.files.find(f => f.id === group.activeFileId)) {
      group.activeFileId = group.files[0]?.id || null
    }
    
    emit('layout-changed', newLayout)
    
    // Emit active file change
    const file = group.activeFileId 
      ? group.files.find(f => f.id === group.activeFileId) || null
      : null
    emit('active-file-changed', file)
  }
}

const createNewFile = () => {
  if (props.layout.groups.length === 0) {
    // Create first group
    const newGroup: EditorGroupType = {
      id: `group-${Date.now()}`,
      activeFileId: null,
      files: []
    }

    const newLayout: SplitLayout = {
      groups: [newGroup],
      splitDirection: null,
      activeGroupId: newGroup.id
    }

    emit('layout-changed', newLayout)
  }

  // Add new file to active group
  if (props.layout.activeGroupId) {
    handleNewTab(props.layout.activeGroupId)
  }
}

const createTestFile = () => {
  if (props.layout.groups.length === 0) {
    // Create first group
    const newGroup: EditorGroupType = {
      id: `group-${Date.now()}`,
      activeFileId: null,
      files: []
    }

    const newLayout: SplitLayout = {
      groups: [newGroup],
      splitDirection: null,
      activeGroupId: newGroup.id
    }

    emit('layout-changed', newLayout)
  }

  // Add test file with visible content
  const newLayout = { ...props.layout }
  const group = newLayout.groups.find(g => g.id === props.layout.activeGroupId)
  if (group) {
    const testFile: EditorFile = {
      id: `test-${Date.now()}`,
      path: '',
      name: 'Test.lua',
      content: `-- Test Lua File
-- This is a test to see if the editor displays content properly

function testFunction()
    print("Hello, World!")
    local x = 10
    local y = 20
    return x + y
end

-- Call the function
local result = testFunction()
print("Result:", result)

-- More test content
for i = 1, 5 do
    print("Loop iteration:", i)
end`,
      isModified: true,
      isUntitled: true,
      cursorLine: 1,
      cursorColumn: 1
    }

    group.files.push(testFile)
    group.activeFileId = testFile.id
    newLayout.activeGroupId = props.layout.activeGroupId

    emit('layout-changed', newLayout)
    emit('active-file-changed', testFile)
  }
}

const startResize = (index: number) => {
  isResizing.value = true
  resizeIndex.value = index
  document.body.style.cursor = props.layout.splitDirection === 'vertical' ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  // TODO: Implement resize logic
  console.log('Resizing...', event)
}

const stopResize = () => {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// Expose methods for parent component
const getActiveEditor = () => {
  if (props.layout.activeGroupId) {
    return groupRefs.value.get(props.layout.activeGroupId)
  }
  return null
}

defineExpose({
  getActiveEditor
})
</script>
