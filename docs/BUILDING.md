# Building Creator AI

**Copyright © 2025 CÔNG TY TNHH HANH.IO. All rights reserved.**

This document explains how to build the Creator AI application and create Windows installers.

## Prerequisites

- Node.js 18 or later
- npm
- For Windows builds on Linux: Wine

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Run with development tools
npm run dev
```

## Building

### Windows Installer

```bash
# Build Windows installer (.exe)
npm run build:win
```

This creates:
- `dist/Creator AI-1.0.0-Setup.exe` - NSIS installer
- `dist/win-unpacked/` - Unpacked application files

### Cross-Platform Build

```bash
# Build for all platforms (requires platform-specific tools)
npm run build:all
```

## Build Output

The Windows installer (`Creator AI-1.0.0-Setup.exe`) is approximately 75MB and includes:

- Complete Electron application
- All Node.js dependencies
- Application assets and icons
- NSIS installer with user-friendly setup wizard

## Installation Features

The Windows installer provides:

- **User-friendly setup wizard** with installation directory selection
- **Desktop and Start Menu shortcuts** for easy access
- **Automatic uninstaller** with option to preserve user data
- **No elevation required** (runs as current user)
- **Offline operation** - no internet connection needed

## System Requirements

### Development
- Node.js 18+
- 2GB free disk space for dependencies
- Wine (for Windows builds on Linux)

### End Users
- Windows 10 or later (64-bit)
- 8GB RAM (16GB recommended)
- 2GB free disk space (more for models and output)
- DirectX 11 compatible graphics card (optional, for GPU acceleration)

## Troubleshooting

### Build Issues

1. **NSIS build fails**: Ensure Wine is properly installed on Linux
2. **Signing errors**: Code signing is disabled for development builds
3. **Icon errors**: Ensure `assets/icon.png` exists and is valid

### Runtime Issues

1. **GPU acceleration not available**: Application falls back to CPU processing
2. **Memory errors**: Increase available RAM or reduce model complexity
3. **Model loading fails**: Check model file integrity and format

## GitHub Actions

The repository includes automated workflows for:

- Building Windows installers on push to release tags
- Cross-platform builds for Windows, macOS, and Linux  
- Security scanning and dependency auditing
- Automatic release creation and artifact publishing

## Release Process

1. Update version in `package.json`
2. Create and push a git tag: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Actions automatically builds and creates a release
4. Download installers from the GitHub Releases page

## Architecture

- **Main Process**: Electron main process (`src/main.js`)
- **Renderer Process**: UI and user interactions (`src/renderer.js`)
- **AI Engine**: Mock AI functionality for demonstration (`src/ai-engine.js`)
- **Assets**: Icons, styles, and static resources (`assets/`, `src/styles.css`)

The application uses a lightweight mock AI engine for demonstration purposes. In production, this would be replaced with actual AI/ML libraries like TensorFlow.js or PyTorch.