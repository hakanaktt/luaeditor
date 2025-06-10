<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Diff Editor Header -->
    <div class="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <GitCompare :size="16" class="text-gray-500" />
        <span class="text-sm font-medium text-gray-700">{{ diffFile.name }}</span>
      </div>
      <div class="ml-auto flex items-center space-x-2">
        <span class="text-xs text-gray-500">{{ diffFile.originalFile.name }}</span>
        <ArrowRight :size="12" class="text-gray-400" />
        <span class="text-xs text-gray-500">{{ diffFile.modifiedFile.name }}</span>
        <div class="w-px h-4 bg-gray-300 ml-2"></div>
        <button
          @click="$emit('close-diff')"
          class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          title="Close Diff View"
        >
          <X :size="14" />
        </button>
      </div>
    </div>

    <!-- Monaco Diff Editor Container -->
    <div ref="diffEditorContainer" class="flex-1 monaco-diff-editor-container min-h-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { GitCompare, ArrowRight, X } from 'lucide-vue-next'
import * as monaco from 'monaco-editor'
import { themeService } from '../services/themeService'
import { colorfulThemeService } from '../services/colorfulThemeService'
import type { DiffEditorFile } from '@/types'

interface Props {
  diffFile: DiffEditorFile
  editorId?: string
}

const props = withDefaults(defineProps<Props>(), {
  editorId: 'diff-default'
})

// Define emits
defineEmits<{
  'close-diff': []
}>()

const diffEditorContainer = ref<HTMLElement | null>(null)
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

const initializeDiffEditor = (): void => {
  if (!diffEditorContainer.value) {
    console.error('Diff editor container not found')
    return
  }

  console.log('Initializing Monaco Diff Editor')

  try {
    const textStyle = themeService.getCurrentTextStyle()
    
    // Create the diff editor
    diffEditor = monaco.editor.createDiffEditor(diffEditorContainer.value, {
      theme: 'vs-dark',
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      fontWeight: '400',
      lineHeight: textStyle.lineHeight,
      letterSpacing: textStyle.letterSpacing,
      minimap: {
        enabled: true,
        scale: 1,
        showSlider: 'always'
      },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      renderSideBySide: true, // Side-by-side view
      enableSplitViewResizing: true,
      renderOverviewRuler: true,
      diffCodeLens: true,
      ignoreTrimWhitespace: false,
      renderIndicators: true,
      originalEditable: false, // Original file is read-only
      readOnly: false // Modified file can be edited
    })

    // Set the diff content
    updateDiffContent()

    // Apply colorful theme after creation
    setTimeout(() => {
      const savedTheme = localStorage.getItem('current-editor-theme') || 'vs-dark'
      if (savedTheme !== 'vs-dark') {
        colorfulThemeService.applyTheme(savedTheme)
      }
    }, 100)

    console.log('Diff editor initialized successfully')
  } catch (error) {
    console.error('Error initializing diff editor:', error)
  }
}

const updateDiffContent = (): void => {
  if (!diffEditor) return

  try {
    // Create models for original and modified content
    const originalModel = monaco.editor.createModel(
      props.diffFile.originalFile.content,
      'lua',
      monaco.Uri.file(props.diffFile.originalFile.path || 'original.lua')
    )

    const modifiedModel = monaco.editor.createModel(
      props.diffFile.modifiedFile.content,
      'lua',
      monaco.Uri.file(props.diffFile.modifiedFile.path || 'modified.lua')
    )

    // Set the models
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    })

    console.log('Diff content updated')
  } catch (error) {
    console.error('Error updating diff content:', error)
  }
}

const handleResize = (): void => {
  if (diffEditor) {
    diffEditor.layout()
  }
}

// Watch for content changes
watch(() => props.diffFile, () => {
  updateDiffContent()
}, { deep: true })

onMounted(() => {
  initializeDiffEditor()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  if (diffEditor) {
    // Dispose of models
    const model = diffEditor.getModel()
    if (model) {
      model.original?.dispose()
      model.modified?.dispose()
    }
    
    diffEditor.dispose()
    diffEditor = null
  }
})

// Expose methods for parent components
defineExpose({
  getDiffEditor: () => diffEditor,
  layout: () => diffEditor?.layout(),
  focus: () => diffEditor?.focus()
})
</script>

<style scoped>
.monaco-diff-editor-container {
  background: #1e1e1e;
}

/* Ensure proper styling for diff editor */
:deep(.monaco-diff-editor) {
  background: #1e1e1e !important;
}

:deep(.monaco-diff-editor .editor.modified) {
  background: #1e1e1e !important;
}

:deep(.monaco-diff-editor .editor.original) {
  background: #1e1e1e !important;
}

/* Diff gutter styling */
:deep(.monaco-diff-editor .diff-review-line-number) {
  color: #858585 !important;
}

/* Diff change indicators */
:deep(.monaco-diff-editor .char-insert) {
  background-color: rgba(155, 185, 85, 0.2) !important;
}

:deep(.monaco-diff-editor .char-delete) {
  background-color: rgba(255, 0, 0, 0.2) !important;
}

:deep(.monaco-diff-editor .line-insert) {
  background-color: rgba(155, 185, 85, 0.1) !important;
}

:deep(.monaco-diff-editor .line-delete) {
  background-color: rgba(255, 0, 0, 0.1) !important;
}
</style>
