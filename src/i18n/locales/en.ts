export default {
  // Application title and branding
  app: {
    title: 'Lua Macro Editor',
    subtitle: 'Lua Macro Editor for Adeko Libraries',
    welcome: 'Welcome to Lua Macro Editor',
    welcomeMessage: 'Open a file to start editing or browse AdekoLib functions',
    noFileOpen: 'No file open'
  },

  // Toolbar actions
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
