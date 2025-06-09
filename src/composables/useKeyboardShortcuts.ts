import { ref, onMounted, onUnmounted } from 'vue'
import type { KeyboardShortcut, ShortcutCategory } from '@/types'

export interface KeyboardShortcutActions {
  'new-file': () => void
  'open-file': () => void
  'save-file': () => void
  'save-as': () => void
  'undo': () => void
  'redo': () => void
  'cut': () => void
  'copy': () => void
  'paste': () => void
  'select-all': () => void
  'find': () => void
  'replace': () => void
  'toggle-sidebar': () => void
  'toggle-function-browser': () => void
  'zoom-in': () => void
  'zoom-out': () => void
  'reset-zoom': () => void
  'toggle-settings': () => void
  'show-function-browser': () => void
  'validate-lua': () => void
  'format-code': () => void
  'show-documentation': () => void
  'show-keyboard-shortcuts': () => void
}

// Define all keyboard shortcuts
const shortcuts: KeyboardShortcut[] = [
  // File operations
  { key: 'n', ctrlKey: true, description: 'New File', action: 'new-file', category: 'File' },
  { key: 'o', ctrlKey: true, description: 'Open File', action: 'open-file', category: 'File' },
  { key: 's', ctrlKey: true, description: 'Save File', action: 'save-file', category: 'File' },
  { key: 's', ctrlKey: true, shiftKey: true, description: 'Save As', action: 'save-as', category: 'File' },
  { key: 'F4', altKey: true, description: 'Exit Application', action: 'exit-app', category: 'File' },

  // Edit operations
  { key: 'z', ctrlKey: true, description: 'Undo', action: 'undo', category: 'Edit' },
  { key: 'y', ctrlKey: true, description: 'Redo', action: 'redo', category: 'Edit' },
  { key: 'x', ctrlKey: true, description: 'Cut', action: 'cut', category: 'Edit' },
  { key: 'c', ctrlKey: true, description: 'Copy', action: 'copy', category: 'Edit' },
  { key: 'v', ctrlKey: true, description: 'Paste', action: 'paste', category: 'Edit' },
  { key: 'a', ctrlKey: true, description: 'Select All', action: 'select-all', category: 'Edit' },
  { key: 'f', ctrlKey: true, description: 'Find', action: 'find', category: 'Edit' },
  { key: 'h', ctrlKey: true, description: 'Replace', action: 'replace', category: 'Edit' },

  // View operations
  { key: 'b', ctrlKey: true, description: 'Toggle Sidebar', action: 'toggle-sidebar', category: 'View' },
  { key: 'f', ctrlKey: true, shiftKey: true, description: 'Toggle Function Browser', action: 'toggle-function-browser', category: 'View' },
  { key: '=', ctrlKey: true, description: 'Zoom In', action: 'zoom-in', category: 'View' },
  { key: '-', ctrlKey: true, description: 'Zoom Out', action: 'zoom-out', category: 'View' },
  { key: '0', ctrlKey: true, description: 'Reset Zoom', action: 'reset-zoom', category: 'View' },

  // Tools operations
  { key: ',', ctrlKey: true, description: 'Settings', action: 'toggle-settings', category: 'Tools' },
  { key: 'F2', description: 'Function Browser', action: 'show-function-browser', category: 'Tools' },
  { key: 'F7', description: 'Validate Lua', action: 'validate-lua', category: 'Tools' },
  { key: 'f', shiftKey: true, altKey: true, description: 'Format Code', action: 'format-code', category: 'Tools' },

  // Help operations
  { key: 'F1', description: 'Documentation', action: 'show-documentation', category: 'Help' },
  { key: 'F12', description: 'Keyboard Shortcuts', action: 'show-keyboard-shortcuts', category: 'Help' },
]

export function useKeyboardShortcuts() {
  const actions = ref<Partial<KeyboardShortcutActions>>({})
  const isEnabled = ref(true)

  // Register action handlers
  const registerActions = (actionHandlers: Partial<KeyboardShortcutActions>) => {
    actions.value = { ...actions.value, ...actionHandlers }
  }

  // Check if a keyboard event matches a shortcut
  const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.altKey === !!shortcut.altKey &&
      !!event.metaKey === !!shortcut.metaKey
    )
  }

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled.value) return

    // Don't handle shortcuts when typing in input fields (except for global shortcuts)
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Only allow certain global shortcuts in input fields
      const globalShortcuts = ['F1', 'F2', 'F7']
      if (!globalShortcuts.includes(event.key)) {
        return
      }
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => matchesShortcut(event, shortcut))
    
    if (matchingShortcut) {
      const action = actions.value[matchingShortcut.action as keyof KeyboardShortcutActions]
      if (action) {
        event.preventDefault()
        event.stopPropagation()
        action()
      }
    }
  }

  // Get shortcuts organized by category
  const getShortcutsByCategory = (): ShortcutCategory[] => {
    const categories = new Map<string, KeyboardShortcut[]>()
    
    shortcuts.forEach(shortcut => {
      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, [])
      }
      categories.get(shortcut.category)!.push(shortcut)
    })

    return Array.from(categories.entries()).map(([name, shortcuts]) => ({
      name,
      shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
    }))
  }

  // Format shortcut for display
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.metaKey) parts.push('Cmd')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join('+')
  }

  // Enable/disable shortcuts
  const setEnabled = (enabled: boolean) => {
    isEnabled.value = enabled
  }

  // Setup event listeners
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown, true)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown, true)
  })

  return {
    shortcuts,
    registerActions,
    getShortcutsByCategory,
    formatShortcut,
    setEnabled,
    isEnabled
  }
}
