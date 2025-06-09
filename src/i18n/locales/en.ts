export default {
  // Application title and branding
  app: {
    title: 'Lua Macro Editor',
    subtitle: 'Lua Macro Editor for Adeko Libraries',
    welcome: 'Welcome to Lua Macro Editor',
    welcomeMessage: 'Open a file to start editing or browse AdekoLib functions',
    noFileOpen: 'No file open'
  },

  // Menu bar
  menu: {
    file: 'File',
    edit: 'Edit',
    view: 'View',
    tools: 'Tools',
    help: 'Help'
  },

  // File menu
  fileMenu: {
    new: 'New',
    open: 'Open',
    save: 'Save',
    saveAs: 'Save As',
    recentFiles: 'Recent Files',
    clearRecentFiles: 'Clear Recent Files',
    exit: 'Exit'
  },

  // Edit menu
  editMenu: {
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    find: 'Find',
    replace: 'Replace',
    findNext: 'Find Next',
    findPrevious: 'Find Previous'
  },

  // View menu
  viewMenu: {
    toggleSidebar: 'Toggle Sidebar',
    toggleFunctionBrowser: 'Toggle Function Browser',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    fullscreen: 'Toggle Fullscreen'
  },

  // Tools menu
  toolsMenu: {
    settings: 'Settings',
    functionBrowser: 'Function Browser',
    validateLua: 'Validate Lua Syntax',
    formatCode: 'Format Code',
    insertFunction: 'Insert Function'
  },

  // Help menu
  helpMenu: {
    documentation: 'Documentation',
    keyboardShortcuts: 'Keyboard Shortcuts',
    about: 'About',
    reportIssue: 'Report Issue'
  },

  // Toolbar actions (keeping for backward compatibility)
  toolbar: {
    new: 'New',
    open: 'Open',
    save: 'Save',
    saveAs: 'Save As',
    settings: 'Settings',
    help: 'Help'
  },

  // Navigation tabs
  tabs: {
    files: 'Files',
    functions: 'Functions'
  },

  // Settings modal
  settings: {
    title: 'Settings',
    modelLibraryPath: 'Model Library Path',
    selectModelLibraryDirectory: 'Select model library directory...',
    currentPaths: 'Current Paths:',
    model: 'Model:',
    luaAutoDetected: 'Lua (auto-detected):',
    notSet: 'Not set',
    notAvailable: 'Not available',
    autoDetectionNote: 'The Lua library will be automatically detected as a sibling folder to the model library.',
    language: 'Language',
    sidebarWidth: 'Sidebar Width',
    sidebarWidthNote: 'Adjust the width of the sidebar panel (200-600px). You can also drag the sidebar edge to resize.',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    saveError: 'Failed to save settings. Please try again.'
  },

  // Function browser
  functions: {
    searchPlaceholder: 'Search functions...',
    allCategories: 'All Categories',
    allLevels: 'All Levels',
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    functionsCount: 'functions',
    insertFunction: 'Insert Function',
    parameters: 'Parameters',
    returns: 'Returns',
    example: 'Example',
    usage: 'Usage',
    relatedFunctions: 'Related Functions',
    optional: 'optional'
  },

  // File operations
  files: {
    luaFiles: 'Lua Files',
    newFileComment: '-- New Lua file\n-- Add your Adeko macro code here\n\n'
  },

  // File Explorer Context Menu
  fileExplorer: {
    newFile: 'New File',
    newFolder: 'New Folder',
    rename: 'Rename',
    delete: 'Delete',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    refresh: 'Refresh',
    openInExplorer: 'Open in File Explorer',
    navigateTo: 'Navigate to Folder',
    properties: 'Properties',
    confirmDelete: 'Are you sure you want to delete "{name}"?',
    confirmDeleteMultiple: 'Are you sure you want to delete {count} items?',
    enterFileName: 'Enter file name:',
    enterFolderName: 'Enter folder name:',
    enterNewName: 'Enter new name:',
    fileExists: 'A file with this name already exists',
    folderExists: 'A folder with this name already exists',
    invalidName: 'Invalid file/folder name',
    createFileError: 'Failed to create file',
    createFolderError: 'Failed to create folder',
    deleteError: 'Failed to delete',
    renameError: 'Failed to rename',
    copyError: 'Failed to copy',
    pasteError: 'Failed to paste',
    refreshError: 'Failed to refresh directory',
    noItemsSelected: 'No items selected',
    cannotCopyToSelf: 'Cannot copy item to itself',
    cannotMoveToSelf: 'Cannot move item to itself',
    expandFolder: 'Expand folder',
    collapseFolder: 'Collapse folder',
    loadingFolder: 'Loading folder contents...'
  },

  // Error messages
  errors: {
    openingFile: 'Error opening file:',
    savingFile: 'Error saving file:',
    loadingFile: 'Error loading file:',
    loadingSettings: 'Error loading settings:',
    calculatingLuaPath: 'Error calculating lua library path:',
    selectingModelLibraryPath: 'Error selecting model library path:'
  },

  // Status messages
  status: {
    modified: '●',
    luaMacroEditor: 'Lua Macro Editor',
    initialized: 'Lua Macro Editor initialized',
    directoryNotExist: 'Lua library directory does not exist:'
  },

  // Languages
  languages: {
    en: 'English',
    tr: 'Türkçe'
  },

  // Common UI elements
  common: {
    loading: 'Loading...',
    error: 'Error',
    directoryNotFound: 'Directory not found:',
    noDirectorySpecified: 'No directory specified'
  }
}
