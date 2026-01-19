# PDF Translate for VSCode

Translate PDF documents while preserving layout, formulas, and figures. Powered by [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate).

![demo](https://raw.githubusercontent.com/Flowers-for-Tuesday/vscode-pdf-translate/main/demo/demo0.PNG)

## Features

- **Layout Preservation** - Maintains original formatting, formulas, and figures
- **40+ Languages** - English, Chinese, Japanese, Korean, French, German, and more
- **14+ Translation Services** - Google, Bing, OpenAI, DeepL, Gemini, etc.
- **Dual Output** - Generates translated-only and bilingual versions
- **Real-time Progress** - Shows translation progress with cancel support
- **One-Click Translate** - Right-click any PDF to translate

## Quick Start

### 1. Install pdf2zh (Required)

**Windows** (PowerShell):
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv tool install --python 3.12 pdf2zh
```

**macOS / Linux**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install --python 3.12 pdf2zh
```

### 2. Translate PDF

- **Right-click** a PDF file → **Translate PDF**
- Or press `Ctrl+Shift+P` → **Translate PDF**

## Configuration

![settings](https://raw.githubusercontent.com/Flowers-for-Tuesday/vscode-pdf-translate/main/demo/demo1.PNG)

| Setting | Default | Description |
|---------|---------|-------------|
| `sourceLanguage` | `en` | Source language |
| `targetLanguage` | `zh` | Target language |
| `translationService` | `bing` | Translation service |
| `threads` | `4` | Parallel threads |

### Translation Services

| Free (No API Key) | API Key Required | Local |
|-------------------|------------------|-------|
| `bing` (recommended) | `openai` | `ollama` |
| `google` | `deepl` | |
| `deeplx` | `gemini`, `deepseek`, `zhipu` | |

### API Keys

```json
{
  "pdfTranslate.apiKeys": {
    "OPENAI_API_KEY": "sk-xxx",
    "DEEPL_AUTH_KEY": "your-key"
  }
}
```

## Output

Translated files are saved to `translated-pdfs/` folder:

```
my-document.pdf
translated-pdfs/
  ├── my-document-mono.pdf   (translated)
  └── my-document-dual.pdf   (bilingual)
```

## Troubleshooting

### pdf2zh not found

The extension automatically detects pdf2zh in:
- Your configured path
- uv default path: `~/.local/bin/pdf2zh`

If still not found:
1. **Restart VSCode**
2. Verify installation: `pdf2zh --version`
3. Manually set path in settings:
   ```json
   { "pdfTranslate.pdf2zhPath": "C:\\Users\\Name\\.local\\bin\\pdf2zh.exe" }
   ```

### Google Translate fails

Use Bing instead (works without proxy):
```json
{ "pdfTranslate.translationService": "bing" }
```

## Links

- [GitHub Repository](https://github.com/Flowers-for-Tuesday/vscode-pdf-translate)
- [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate)
- [Report Issues](https://github.com/Flowers-for-Tuesday/vscode-pdf-translate/issues)

## License

[AGPL-3.0](https://github.com/Flowers-for-Tuesday/vscode-pdf-translate/blob/main/LICENSE)
