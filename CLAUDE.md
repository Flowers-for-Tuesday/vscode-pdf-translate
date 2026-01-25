# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A VSCode extension that translates PDF documents while preserving layout, formulas, and figures. The extension acts as a wrapper around the `pdf2zh` command-line tool from [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate).

## Build and Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Lint code
npm run lint

# Run tests
npm run test

# Package extension as .vsix
npm run package
```

## Architecture

### Core Components

**extension.ts** - Entry point that registers commands and initializes the extension
- `pdfTranslate.translate` - Main translation command triggered from context menu or command palette
- `pdfTranslate.selectLanguages` - Interactive language selector command
- `pdfTranslate.setupEnvironment` - Manual environment setup command
- Translation workflow: prompt user → validate config → execute pdf2zh → open translated PDF in sidebar

**environmentManager.ts** - Automatic environment configuration (EnvironmentManager class)
- Detects if uv and pdf2zh are installed
- Automatically installs uv using the official installer (astral.sh)
- Installs pdf2zh via `uv tool install pdf2zh` command
- Shows real-time progress notifications with terminal output during installation
- Supports cancellation during the setup process
- Works cross-platform (Windows PowerShell, Unix shell)

**translator.ts** - Translation execution engine (PDFTranslator class)
- Verifies pdf2zh installation before translation
- Builds command-line arguments from configuration
- Spawns pdf2zh process with proper environment variables (API keys)
- Streams stdout/stderr to VSCode output channel
- Parses tqdm progress output and displays real-time progress bar
- Supports cancellation with proper process tree termination (taskkill on Windows, SIGTERM on Unix)
- Returns paths to generated files: `{baseName}-mono.pdf` (translated only) and `{baseName}-dual.pdf` (bilingual)

**config.ts** - Configuration management (ConfigManager class)
- Reads VSCode settings from `pdfTranslate.*` namespace
- Provides interactive language picker with 40+ languages
- Converts apiKeys config object to environment variables for pdf2zh
- Settings: sourceLanguage, targetLanguage, translationService, threads, pdf2zhPath, outputDirectory, apiKeys

**pdfViewer.ts** - Custom PDF viewer panel (currently unused in main flow)
- Embeds PDF.js for in-extension PDF rendering
- Provides navigation controls (prev/next page, zoom, page input)
- Creates webview panel with toolbar and canvas rendering
- Note: Current implementation uses VSCode's built-in PDF viewer via `vscode.open` command instead

### Translation Flow

1. User triggers command → extension.ts validates PDF path
2. ConfigManager reads settings and prompts for confirmation
3. PDFTranslator checks pdf2zh availability → if not found, prompts for auto-install
4. If auto-install chosen: EnvironmentManager installs uv (if needed) and pdf2zh with real-time progress
5. Spawns pdf2zh subprocess with: `pdf2zh "{input}" -o "{output}" -li {source} -lo {target} -s {service} -t {threads}`
6. Environment variables from apiKeys config are injected into process
7. Real-time progress bar displayed with cancellation support (user can click X to stop)
8. Output files saved to `translated-pdfs/` subfolder (or custom directory)
9. Opens mono PDF in sidebar using VSCode's built-in viewer

### Environment Auto-Setup

When pdf2zh is not detected, the extension offers automatic installation:
1. User prompted: "Install Automatically" / "Manual Instructions" / "Cancel"
2. If auto-install: Progress notification appears showing real-time terminal output
3. uv package manager installed from astral.sh (if not present)
4. pdf2zh installed via `uv tool install --python 3.12 pdf2zh`
5. Progress shows download status (e.g., "Downloading onnx (15.6MiB)")
6. On success, translation proceeds automatically

### External Dependencies

- **pdf2zh CLI**: Auto-installed via uv, or manually via `uv tool install --python 3.12 pdf2zh`
- **uv**: Auto-installed from astral.sh, or manually from https://docs.astral.sh/uv/
- **Translation Services**: Supports 14+ services (Google, Bing, OpenAI, DeepL, etc.)
  - Free services: google, bing, deeplx
  - API key required: openai, deepl, gemini, azure-openai, etc.
  - Local: ollama
- API keys configured in `pdfTranslate.apiKeys` settings object

## Key Implementation Details

- Output directory defaults to `translated-pdfs/` subfolder in source PDF directory
- pdf2zh generates two outputs: `-mono.pdf` (translated) and `-dual.pdf` (bilingual)
- Process spawning uses shell mode to handle spaces in paths (all paths quoted)
- API keys stored in VSCode settings and passed as environment variables to pdf2zh
- Extension uses CommonJS module system (not ESM)
- TypeScript compiled to ES2020 with strict mode enabled
- Progress bar parses tqdm output format: `29%|██       | 2/7 [00:00<00:02,  2.08it/s]`
- Cancellation uses `taskkill /f /t` on Windows to kill entire process tree
