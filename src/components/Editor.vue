<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Editor Header -->
    <div class="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <FileText :size="16" class="text-gray-500" />
        <span class="text-sm font-medium text-gray-700">{{ fileName }}</span>
      </div>
      <div class="ml-auto flex items-center space-x-2">
        <span class="text-xs text-gray-500">Lua</span>
        <div class="w-px h-4 bg-gray-300"></div>
        <span class="text-xs text-gray-500">Line {{ currentLine }}, Column {{ currentColumn }}</span>
      </div>
    </div>

    <!-- Monaco Editor Container -->
    <div ref="editorContainer" class="flex-1 monaco-editor-container min-h-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { FileText } from 'lucide-vue-next'
import * as monaco from 'monaco-editor'
import { monacoIntelliSenseService } from '../services/monacoIntellisense'
import { themeService } from '../services/themeService'
import { colorfulThemeService } from '../services/colorfulThemeService'
import { setupEnhancedLuaSyntax } from '../services/enhancedLuaSyntax'

interface Props {
  fileContent: string
  filePath: string
  editorId?: string
}

const props = withDefaults(defineProps<Props>(), {
  editorId: 'default'
})

// Define emits
const emit = defineEmits<{
  'content-changed': [content: string]
  'cursor-position-changed': [line: number, column: number]
}>()

const editorContainer = ref<HTMLElement>()
const currentLine = ref<number>(1)
const currentColumn = ref<number>(1)

let editor: monaco.editor.IStandaloneCodeEditor | null = null

const fileName = computed(() => {
  if (!props.filePath) return 'Untitled'
  const parts = props.filePath.split(/[/\\]/)
  return parts[parts.length - 1]
})

const initializeEditor = (): void => {
  if (!editorContainer.value) {
    console.error('Editor container not found')
    return
  }

  console.log('Initializing Monaco Editor with content:', props.fileContent?.substring(0, 100) + '...')

  // Configure Lua language support
  monaco.languages.register({ id: 'lua' })

  // Setup basic Lua syntax highlighting (fallback to working version)
  monaco.languages.setLanguageConfiguration('lua', {
    comments: {
      lineComment: '--',
      blockComment: ['--[[', ']]']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  })

  // Simple but reliable Lua tokenizer
  monaco.languages.setMonarchTokensProvider('lua', {
    defaultToken: 'identifier',

    tokenizer: {
      root: [
        // Comments
        [/--\[\[/, 'comment', '@comment_multiline'],
        [/--.*$/, 'comment'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, 'string', '@string_single'],
        [/\[\[/, 'string', '@string_multiline'],

        // Numbers
        [/0[xX][0-9a-fA-F]+/, 'number'],
        [/\d+\.\d*/, 'number'],
        [/\d+/, 'number'],

        // Keywords - most important for color
        [/\band\b/, 'keyword'],
        [/\bbreak\b/, 'keyword'],
        [/\bdo\b/, 'keyword'],
        [/\belse\b/, 'keyword'],
        [/\belseif\b/, 'keyword'],
        [/\bend\b/, 'keyword'],
        [/\bfalse\b/, 'keyword'],
        [/\bfor\b/, 'keyword'],
        [/\bfunction\b/, 'keyword'],
        [/\bif\b/, 'keyword'],
        [/\bin\b/, 'keyword'],
        [/\blocal\b/, 'keyword'],
        [/\bnil\b/, 'keyword'],
        [/\bnot\b/, 'keyword'],
        [/\bor\b/, 'keyword'],
        [/\brepeat\b/, 'keyword'],
        [/\breturn\b/, 'keyword'],
        [/\bthen\b/, 'keyword'],
        [/\btrue\b/, 'keyword'],
        [/\buntil\b/, 'keyword'],
        [/\bwhile\b/, 'keyword'],

        // AdekoLib functions
        [/\bADekoLib\b/, 'type'],
        [/\bsetFace\b/, 'function'],
        [/\bsetLayer\b/, 'function'],
        [/\bsetThickness\b/, 'function'],
        [/\bpoint\b/, 'function'],
        [/\bline\b/, 'function'],
        [/\bcircle\b/, 'function'],
        [/\barc\b/, 'function'],

        // Lua built-ins
        [/\bprint\b/, 'function.builtin'],
        [/\btype\b/, 'function.builtin'],
        [/\btostring\b/, 'function.builtin'],
        [/\btonumber\b/, 'function.builtin'],
        [/\bpairs\b/, 'function.builtin'],
        [/\bipairs\b/, 'function.builtin'],

        // Math functions
        [/\bmath\b/, 'type'],
        [/\bstring\b/, 'type'],
        [/\btable\b/, 'type'],

        // Operators
        [/==/, 'operator'],
        [/~=/, 'operator'],
        [/<=/, 'operator'],
        [/>=/, 'operator'],
        [/\.\./, 'operator'],
        [/[=><+\-*/%^#]/, 'operator'],

        // Delimiters
        [/[{}()]/, 'delimiter'],
        [/[[\]]/, 'delimiter'],
        [/[,;.]/, 'delimiter'],

        // Identifiers
        [/[a-zA-Z_]\w*/, 'identifier'],

        // Whitespace
        [/\s+/, 'white']
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop']
      ],

      string_multiline: [
        [/[^\]]+/, 'string'],
        [/\]\]/, 'string', '@pop'],
        [/[\]]/, 'string']
      ],

      comment_multiline: [
        [/[^\]]+/, 'comment'],
        [/\]\]/, 'comment', '@pop'],
        [/[\]]/, 'comment']
      ]
    }
  })

  // Create the editor
  try {
    const textStyle = themeService.getCurrentTextStyle()
    editor = monaco.editor.create(editorContainer.value, {
      value: props.fileContent || '',
      language: 'lua',
      theme: 'vs-dark', // Use standard theme first, then switch to colorful theme
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
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      folding: true,
      foldingHighlight: true,
      matchBrackets: 'always',
      autoIndent: 'full',
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      // Better scrolling
      smoothScrolling: true,
      mouseWheelZoom: true,
      // Better cursor
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      cursorWidth: 2,
      // Better selection
      selectionHighlight: true,
      occurrencesHighlight: 'singleFile',
      // Better rendering
      renderLineHighlight: 'all',
      renderControlCharacters: false,
      renderIndentGuides: true,
      // Padding
      padding: { top: 10, bottom: 10 }
    })

    console.log('Monaco Editor created successfully')
    console.log('Editor value:', editor.getValue())
    console.log('Container dimensions:', {
      width: editorContainer.value.clientWidth,
      height: editorContainer.value.clientHeight
    })

    // Register editor with theme service
    themeService.registerEditor(editor)

    // Apply saved theme after editor is created
    setTimeout(() => {
      if (editor) {
        // Get saved theme or default to vs-dark
        const savedTheme = localStorage.getItem('current-editor-theme') || 'vs-dark'

        if (savedTheme === 'vs-dark') {
          monaco.editor.setTheme('vs-dark')
          console.log('✅ Applied standard dark theme')
        } else {
          const themeApplied = colorfulThemeService.applyTheme(savedTheme)
          if (themeApplied) {
            console.log(`✅ Applied colorful theme: ${savedTheme}`)
          } else {
            console.warn(`⚠️ Failed to apply theme ${savedTheme}, falling back to vs-dark`)
            monaco.editor.setTheme('vs-dark')
          }
        }

        // Force re-tokenization to ensure colors are applied
        const model = editor.getModel()
        if (model) {
          // Trigger re-tokenization by setting language again
          monaco.editor.setModelLanguage(model, 'lua')
          console.log('🔄 Forced re-tokenization')

          // Debug: Log tokenization for first few lines
          setTimeout(() => {
            try {
              const lineCount = Math.min(model.getLineCount(), 5)
              for (let i = 1; i <= lineCount; i++) {
                const lineTokens = monaco.editor.tokenize(model.getLineContent(i), 'lua')
                console.log(`Line ${i} tokens:`, lineTokens)
              }
            } catch (error) {
              console.warn('Token debug failed:', error)
            }
          }, 200)
        }

        editor.layout()
        console.log('Editor layout forced')
      }
    }, 100)
  } catch (error) {
    console.error('Failed to create Monaco Editor:', error)
    return
  }

  // Listen for content changes
  editor.onDidChangeModelContent(() => {
    if (editor) {
      emit('content-changed', editor.getValue())
    }
  })

  // Listen for cursor position changes
  editor.onDidChangeCursorPosition((e) => {
    currentLine.value = e.position.lineNumber
    currentColumn.value = e.position.column
    // Emit cursor position changes to parent component
    emit('cursor-position-changed', e.position.lineNumber, e.position.column)
  })

  // Initialize IntelliSense
  monacoIntelliSenseService.initialize(editor)
}

// Expose methods for parent component
const insertText = (text: string): void => {
  if (!editor) return

  const position = editor.getPosition()
  if (!position) return

  editor.executeEdits('insert-text', [{
    range: {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: position.column,
      endColumn: position.column
    },
    text: text
  }])

  // Focus the editor and position cursor after inserted text
  editor.focus()
  const newPosition = {
    lineNumber: position.lineNumber,
    column: position.column + text.length
  }
  editor.setPosition(newPosition)
}

// Editor action methods
const undo = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'undo', null)
  }
}

const redo = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'redo', null)
  }
}

const cut = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.clipboardCutAction', null)
  }
}

const copy = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null)
  }
}

const paste = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null)
  }
}

const selectAll = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.selectAll', null)
  }
}

const showFindDialog = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'actions.find', null)
  }
}

const showReplaceDialog = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.startFindReplaceAction', null)
  }
}

const zoomIn = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.fontZoomIn', null)
  }
}

const zoomOut = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.fontZoomOut', null)
  }
}

const resetZoom = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.fontZoomReset', null)
  }
}

const formatCode = (): void => {
  if (editor) {
    editor.trigger('keyboard', 'editor.action.formatDocument', null)
  }
}

const setCursorPosition = (line: number, column: number): void => {
  if (editor) {
    editor.setPosition({ lineNumber: line, column: column })
    editor.focus()
  }
}

const setScrollPosition = (scrollTop: number, scrollLeft: number): void => {
  if (editor) {
    editor.setScrollTop(scrollTop)
    editor.setScrollLeft(scrollLeft)
  }
}

const getCursorPosition = () => {
  if (editor) {
    const position = editor.getPosition()
    return position ? { line: position.lineNumber, column: position.column } : null
  }
  return null
}

const getScrollPosition = () => {
  if (editor) {
    return {
      scrollTop: editor.getScrollTop(),
      scrollLeft: editor.getScrollLeft()
    }
  }
  return { scrollTop: 0, scrollLeft: 0 }
}

// Expose all methods
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
  formatCode,
  setCursorPosition,
  setScrollPosition,
  getCursorPosition,
  getScrollPosition
})

// Watch for file content changes
watch(() => props.fileContent, (newContent) => {
  if (editor && editor.getValue() !== newContent) {
    editor.setValue(newContent)
  }
}, { immediate: true })

onMounted(() => {
  // Add a small delay to ensure the container is properly rendered
  setTimeout(() => {
    initializeEditor()
  }, 50)

  // Add resize observer to handle container size changes
  if (editorContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      if (editor) {
        editor.layout()
      }
    })
    resizeObserver.observe(editorContainer.value)

    // Store the observer for cleanup
    ;(editorContainer.value as any)._resizeObserver = resizeObserver
  }
})

onUnmounted(() => {
  // Clean up resize observer
  if (editorContainer.value && (editorContainer.value as any)._resizeObserver) {
    ;(editorContainer.value as any)._resizeObserver.disconnect()
  }

  if (editor) {
    // Unregister from theme service
    themeService.unregisterEditor(editor)
    monacoIntelliSenseService.dispose()
    editor.dispose()
    editor = null
  }
})
</script>
