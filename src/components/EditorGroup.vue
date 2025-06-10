<template>
  <div class="flex-1 flex flex-col bg-white min-h-0">
    <!-- Editor Tabs (only show if not in diff mode) -->
    <EditorTabs
      v-if="!group.isDiffMode"
      :files="group.files"
      :active-file-id="group.activeFileId"
      :show-split-button="showSplitButton"
      @tab-click="handleTabClick"
      @tab-close="handleTabClose"
      @new-tab="handleNewTab"
      @split-editor="handleSplitEditor"
      @close-all="handleCloseAll"
      @close-others="handleCloseOthers"
      @close-modified="handleCloseModified"
    />

    <!-- Editor Content -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Diff Editor Mode -->
      <template v-if="group.isDiffMode && group.diffFile">
        <DiffEditor
          :key="group.diffFile.id"
          ref="diffEditorRef"
          :diff-file="group.diffFile"
          :editor-id="group.diffFile.id"
          @close-diff="handleCloseDiff"
        />
      </template>

      <!-- Normal Editor Mode -->
      <template v-else-if="activeFile">
        <Editor
          :key="activeFile.id"
          ref="editorRef"
          :file-content="activeFile.content"
          :file-path="activeFile.path"
          :editor-id="activeFile.id"
          @content-changed="handleContentChanged"
          @cursor-position-changed="handleCursorPositionChanged"
        />
      </template>

      <!-- No File Open -->
      <div v-else class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <h3 class="text-lg mb-2">{{ $t('editor.noFileOpen') }}</h3>
          <p class="text-sm mb-4">{{ $t('editor.openFileHint') }}</p>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="handleNewTab"
          >
            {{ $t('editor.newFile') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import EditorTabs from './EditorTabs.vue'
import Editor from './Editor.vue'
import DiffEditor from './DiffEditor.vue'
import { useI18n } from '@/composables/useI18n'
import type { EditorGroup as EditorGroupType, EditorFile } from '@/types'

interface Props {
  group: EditorGroupType
  showSplitButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSplitButton: true
})

const emit = defineEmits<{
  'file-changed': [groupId: string, fileId: string, content: string]
  'cursor-changed': [groupId: string, fileId: string, line: number, column: number]
  'tab-click': [groupId: string, fileId: string]
  'tab-close': [groupId: string, fileId: string]
  'new-tab': [groupId: string]
  'split-editor': [groupId: string]
  'close-all': [groupId: string]
  'close-others': [groupId: string, keepFileId: string]
  'close-modified': [groupId: string]
  'group-focus': [groupId: string]
  'close-diff': [groupId: string]
}>()

const { t } = useI18n()

const editorRef = ref<InstanceType<typeof Editor> | null>(null)

const activeFile = computed(() => {
  if (!props.group.activeFileId) {
    console.log('No active file ID in group:', props.group.id)
    return null
  }
  const file = props.group.files.find(f => f.id === props.group.activeFileId) || null
  console.log('Active file in group:', props.group.id, 'File:', file?.name, 'Content length:', file?.content?.length)
  return file
})

// Watch for active file changes to restore cursor position
watch(activeFile, async (newFile, oldFile) => {
  if (newFile && oldFile && newFile.id !== oldFile.id) {
    await nextTick()
    if (editorRef.value) {
      // Restore cursor position for the new active file
      editorRef.value.setCursorPosition(newFile.cursorLine, newFile.cursorColumn)
      if (newFile.scrollTop !== undefined && newFile.scrollLeft !== undefined) {
        editorRef.value.setScrollPosition(newFile.scrollTop, newFile.scrollLeft)
      }
    }
  }
}, { immediate: true })

const handleTabClick = (fileId: string) => {
  emit('tab-click', props.group.id, fileId)
  emit('group-focus', props.group.id)
}

const handleTabClose = (fileId: string) => {
  emit('tab-close', props.group.id, fileId)
}

const handleNewTab = () => {
  emit('new-tab', props.group.id)
  emit('group-focus', props.group.id)
}

const handleSplitEditor = () => {
  emit('split-editor', props.group.id)
}

const handleCloseAll = () => {
  emit('close-all', props.group.id)
}

const handleCloseOthers = (keepFileId: string) => {
  emit('close-others', props.group.id, keepFileId)
}

const handleCloseModified = () => {
  emit('close-modified', props.group.id)
}

const handleContentChanged = (content: string) => {
  if (activeFile.value) {
    emit('file-changed', props.group.id, activeFile.value.id, content)
  }
}

const handleCursorPositionChanged = (line: number, column: number) => {
  if (activeFile.value) {
    emit('cursor-changed', props.group.id, activeFile.value.id, line, column)
  }
}

// Expose editor methods for parent component
const insertText = (text: string) => {
  if (editorRef.value) {
    editorRef.value.insertText(text)
  }
}

const undo = () => {
  if (editorRef.value) {
    editorRef.value.undo()
  }
}

const redo = () => {
  if (editorRef.value) {
    editorRef.value.redo()
  }
}

const cut = () => {
  if (editorRef.value) {
    editorRef.value.cut()
  }
}

const copy = () => {
  if (editorRef.value) {
    editorRef.value.copy()
  }
}

const paste = () => {
  if (editorRef.value) {
    editorRef.value.paste()
  }
}

const selectAll = () => {
  if (editorRef.value) {
    editorRef.value.selectAll()
  }
}

const showFindDialog = () => {
  if (editorRef.value) {
    editorRef.value.showFindDialog()
  }
}

const showReplaceDialog = () => {
  if (editorRef.value) {
    editorRef.value.showReplaceDialog()
  }
}

const zoomIn = () => {
  if (editorRef.value) {
    editorRef.value.zoomIn()
  }
}

const zoomOut = () => {
  if (editorRef.value) {
    editorRef.value.zoomOut()
  }
}

const resetZoom = () => {
  if (editorRef.value) {
    editorRef.value.resetZoom()
  }
}

const formatCode = () => {
  if (editorRef.value) {
    editorRef.value.formatCode()
  }
}

defineExpose({
  insertText,
  undo,
  redo,
  cut,
  copy,
  paste,
  selectAll,
  showFindDialog,
  showReplaceDialog,
  zoomIn,
  zoomOut,
  resetZoom,
  formatCode
})
</script>
