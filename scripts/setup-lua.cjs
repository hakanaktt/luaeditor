#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const BINARIES_DIR = path.join(__dirname, '..', 'src-tauri', 'binaries');

// Ensure binaries directory exists
if (!fs.existsSync(BINARIES_DIR)) {
  fs.mkdirSync(BINARIES_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function setupLuaWindows() {
  console.log('Setting up Lua for Windows...');

  try {
    // Try to download from GitHub releases (more reliable)
    const luaUrl = 'https://github.com/rjpcomputing/luaforwindows/releases/download/v5.1.5-52/LuaForWindows_v5.1.5-52.exe';
    const exePath = path.join(BINARIES_DIR, 'lua-installer.exe');

    console.log('Downloading Lua for Windows...');
    await downloadFile(luaUrl, exePath);

    // For now, let's create a simple wrapper that calls system Lua
    const luaWrapper = `@echo off
REM Lua wrapper script
REM This script tries to find and execute Lua

REM Try common Lua installation paths
if exist "C:\\Program Files\\Lua\\5.4\\lua.exe" (
    "C:\\Program Files\\Lua\\5.4\\lua.exe" %*
    exit /b %errorlevel%
)

if exist "C:\\Program Files (x86)\\Lua\\5.4\\lua.exe" (
    "C:\\Program Files (x86)\\Lua\\5.4\\lua.exe" %*
    exit /b %errorlevel%
)

REM Try system PATH
lua.exe %*
if %errorlevel% equ 0 exit /b 0

REM If all fails, show error message
echo.
echo ❌ Lua not found! Please install Lua:
echo    1. Download from: https://www.lua.org/download.html
echo    2. Or install via Chocolatey: choco install lua
echo    3. Or install via Scoop: scoop install lua
echo.
pause
exit /b 1
`;

    const targetPath = path.join(BINARIES_DIR, 'lua-x86_64-pc-windows-msvc.exe');
    fs.writeFileSync(targetPath, luaWrapper);

    // Clean up installer
    if (fs.existsSync(exePath)) {
      fs.unlinkSync(exePath);
    }

    console.log('✅ Lua wrapper for Windows created successfully');

  } catch (error) {
    console.error('❌ Failed to setup Lua for Windows:', error.message);

    // Fallback: Create a simple Lua implementation notice
    const fallbackScript = `@echo off
echo.
echo ❌ Lua is required to run debug scripts!
echo.
echo Please install Lua from one of these sources:
echo   • Official: https://www.lua.org/download.html
echo   • Chocolatey: choco install lua
echo   • Scoop: scoop install lua
echo.
echo After installation, restart the application.
echo.
pause
`;
    fs.writeFileSync(path.join(BINARIES_DIR, 'lua-x86_64-pc-windows-msvc.exe'), fallbackScript);
    console.log('⚠️  Created fallback script. Users will need to install Lua manually.');
  }
}

async function setupLuaMacOS() {
  console.log('Setting up Lua for macOS...');
  
  try {
    // For macOS, we'll use Homebrew or compile from source
    // This is a placeholder - in practice, you'd want to download pre-compiled binaries
    const luaScript = `#!/bin/bash
if command -v lua >/dev/null 2>&1; then
    exec lua "$@"
else
    echo "Lua is required. Please install with: brew install lua"
    exit 1
fi
`;
    
    const targetPath = path.join(BINARIES_DIR, 'lua-x86_64-apple-darwin');
    fs.writeFileSync(targetPath, luaScript);
    fs.chmodSync(targetPath, '755');
    
    console.log('✅ Lua for macOS set up successfully');
  } catch (error) {
    console.error('❌ Failed to setup Lua for macOS:', error.message);
  }
}

async function setupLuaLinux() {
  console.log('Setting up Lua for Linux...');
  
  try {
    // For Linux, we'll create a script that uses system Lua or downloads it
    const luaScript = `#!/bin/bash
if command -v lua >/dev/null 2>&1; then
    exec lua "$@"
else
    echo "Lua is required. Please install with your package manager:"
    echo "  Ubuntu/Debian: sudo apt-get install lua5.4"
    echo "  CentOS/RHEL: sudo yum install lua"
    echo "  Arch: sudo pacman -S lua"
    exit 1
fi
`;
    
    const targetPath = path.join(BINARIES_DIR, 'lua-x86_64-unknown-linux-gnu');
    fs.writeFileSync(targetPath, luaScript);
    fs.chmodSync(targetPath, '755');
    
    console.log('✅ Lua for Linux set up successfully');
  } catch (error) {
    console.error('❌ Failed to setup Lua for Linux:', error.message);
  }
}

async function main() {
  console.log('🚀 Native Lua is now embedded via mlua - no external setup required!');
  console.log('✨ Lua setup complete! The application now uses embedded Lua for full native performance.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupLuaWindows, setupLuaMacOS, setupLuaLinux };
