# Lua Macro Editor for Adeko Libraries

A desktop application for editing Lua macros specifically designed for Adeko door manufacturing libraries. Built with Vue 3, TypeScript, Monaco Editor, and Tauri 2.

## Features

- **Monaco Editor Integration**: Full-featured code editor with Lua syntax highlighting
- **File Management**: Browse, open, edit, and save Lua files
- **Adeko Library Support**: Optimized for working with Adeko door macro libraries
- **Desktop Application**: Cross-platform desktop app powered by Tauri 2
- **TypeScript**: Fully typed codebase for better development experience

## Tech Stack

- **Frontend**: Vue 3 with Composition API + TypeScript
- **Editor**: Monaco Editor (VS Code editor)
- **Backend**: Tauri 2 (Rust)
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue Next

## Project Structure

```
├── src/                    # Vue.js frontend source
│   ├── components/         # Vue components
│   │   ├── Editor.vue     # Monaco editor component
│   │   ├── FileExplorer.vue # File tree component
│   │   └── Toolbar.vue    # Application toolbar
│   ├── types/             # TypeScript type definitions
│   ├── App.vue           # Main application component
│   └── main.ts           # Application entry point
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs       # Rust backend logic
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
├── LIBRARY/               # Your Adeko libraries
│   ├── luaLibrary/       # Lua library files
│   └── modelLibrary/     # Model files
└── package.json          # Node.js dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Rust (latest stable)
- Tauri CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Tauri CLI:
```bash
npm install -g @tauri-apps/cli@next
```

### Development

Run the development server:
```bash
npm run tauri:dev
```

This will start both the Vite dev server and the Tauri application.

### Building

Build the application for production:
```bash
npm run tauri:build
```

## Usage

1. **Opening Files**: Use the File Explorer on the left to browse your Lua library files
2. **Editing**: Double-click any `.lua` file to open it in the Monaco editor
3. **Saving**: Use Ctrl+S or the Save button in the toolbar
4. **New Files**: Click the "New" button to create a new Lua file

## Adeko Library Integration

The editor is specifically designed to work with your existing Adeko library structure:
- Automatically loads files from `LIBRARY/luaLibrary/`
- Provides Lua syntax highlighting optimized for Adeko functions
- Supports all your existing `.lua` and `.model` files

## Development Notes

- The application uses TypeScript for type safety
- Monaco Editor provides IntelliSense and advanced editing features
- Tauri handles file system operations securely
- The UI is responsive and follows modern design principles

## Contributing

This is a specialized tool for Adeko door macro development. Feel free to customize it according to your specific needs.
