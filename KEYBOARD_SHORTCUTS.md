# Keyboard Shortcuts

The Lua Macro Editor now supports comprehensive keyboard shortcuts to improve productivity and provide a more efficient editing experience.

## How to Access Keyboard Shortcuts

1. **View all shortcuts**: Press `F12` or go to `Help > Keyboard Shortcuts` in the menu
2. **Use shortcuts**: Simply press the key combinations while using the application

## Available Shortcuts

### File Operations
- `Ctrl+N` - New File
- `Ctrl+O` - Open File
- `Ctrl+S` - Save File
- `Ctrl+Shift+S` - Save As
- `Alt+F4` - Exit Application

### Edit Operations
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+X` - Cut
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Ctrl+A` - Select All
- `Ctrl+F` - Find
- `Ctrl+H` - Replace

### View Operations
- `Ctrl+B` - Toggle Sidebar
- `Ctrl+Shift+F` - Toggle Function Browser
- `Ctrl+=` - Zoom In
- `Ctrl+-` - Zoom Out
- `Ctrl+0` - Reset Zoom

### Tools
- `Ctrl+,` - Settings
- `F2` - Function Browser
- `F7` - Validate Lua
- `Shift+Alt+F` - Format Code

### Help
- `F1` - Documentation
- `F12` - Keyboard Shortcuts

## Implementation Details

### Global vs Context-Sensitive Shortcuts
- **Global shortcuts**: Function keys (F1, F2, F7, F12) work anywhere in the application
- **Context-sensitive shortcuts**: Most Ctrl+key combinations work when the editor is focused
- **Input field handling**: Shortcuts are disabled when typing in input fields (except global shortcuts)

### Monaco Editor Integration
The keyboard shortcuts system is designed to work seamlessly with the Monaco Editor:
- Editor-specific shortcuts (like Ctrl+F for find) are handled by Monaco when the editor is focused
- Application-level shortcuts (like Ctrl+N for new file) are handled by the global shortcut system
- No conflicts between editor shortcuts and application shortcuts

### Customization
The keyboard shortcuts are defined in `src/composables/useKeyboardShortcuts.ts` and can be easily customized:

```typescript
const shortcuts: KeyboardShortcut[] = [
  { key: 'n', ctrlKey: true, description: 'New File', action: 'new-file', category: 'File' },
  // Add more shortcuts here
]
```

## Technical Architecture

### Components
1. **useKeyboardShortcuts composable** (`src/composables/useKeyboardShortcuts.ts`)
   - Manages keyboard event handling
   - Provides shortcut registration and matching
   - Handles enabling/disabling shortcuts

2. **KeyboardShortcutsModal component** (`src/components/KeyboardShortcutsModal.vue`)
   - Displays all available shortcuts organized by category
   - Provides user-friendly shortcut formatting
   - Includes helpful tips for users

3. **Integration in App.vue**
   - Registers all action handlers
   - Connects shortcuts to application functions
   - Manages modal visibility

### Features
- **Category organization**: Shortcuts are grouped by File, Edit, View, Tools, and Help
- **Conflict prevention**: Smart handling to avoid conflicts with input fields and Monaco Editor
- **Accessibility**: Full keyboard navigation support
- **Internationalization**: All text is translatable (English and Turkish supported)
- **Visual feedback**: Shortcuts are displayed in menus and the dedicated modal

## Usage Tips

1. **Learning shortcuts**: Use F12 to view the shortcuts modal anytime
2. **Editor focus**: Most editing shortcuts work when the code editor is focused
3. **Global access**: Function keys work from anywhere in the application
4. **Menu integration**: All shortcuts are also available through the menu system

## Future Enhancements

Potential improvements for the keyboard shortcuts system:
- User-customizable shortcuts
- Shortcut conflict detection and resolution
- Additional context-sensitive shortcuts
- Shortcut recording and playback
- Integration with external tools and plugins
