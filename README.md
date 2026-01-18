# PDF Translate for VSCode

A VSCode extension for translating PDF documents while preserving layout, formulas, and figures. Powered by [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate).

[中文文档](./README.zh-CN.md)

## Features

- **Layout Preservation**: Translates PDF while maintaining original formatting, formulas, and figures
- **Multi-Language Support**: Supports 40+ languages including English, Chinese, Japanese, Korean, and more
- **Multiple Translation Services**: Choose from 14+ translation services (Google, Bing, OpenAI, DeepL, etc.)
- **Dual Output**: Generates both mono (translated only) and dual (bilingual) versions
- **Sidebar Preview**: Automatically previews translated PDF in VSCode sidebar
- **Simple Configuration**: Minimal settings with sensible defaults

## Prerequisites

Before using this extension, you must install [pdf2zh](https://github.com/Byaidu/PDFMathTranslate):

```bash
pip install pdf2zh
```

Verify installation:

```bash
pdf2zh --version
```

## Installation

1. Download the `.vsix` file from releases
2. In VSCode, press `Ctrl+Shift+P`
3. Type "Extensions: Install from VSIX"
4. Select the downloaded file

Or search for "PDF Translate" in the VSCode marketplace (when published).

## Usage

### Method 1: Context Menu
1. Right-click on a PDF file in the explorer
2. Select "Translate PDF"

### Method 2: Command Palette
1. Open a PDF file
2. Press `Ctrl+Shift+P`
3. Type "Translate PDF"

### Method 3: Change Languages
1. Press `Ctrl+Shift+P`
2. Type "Select Translation Languages"
3. Choose source and target languages

## Configuration

Open VSCode settings (`Ctrl+,`) and search for "pdf translate":

### Basic Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `pdfTranslate.sourceLanguage` | `en` | Source language code |
| `pdfTranslate.targetLanguage` | `zh` | Target language code |
| `pdfTranslate.translationService` | `bing` | Translation service to use |
| `pdfTranslate.threads` | `4` | Number of threads (0 = auto) |
| `pdfTranslate.pdf2zhPath` | `pdf2zh` | Path to pdf2zh command |
| `pdfTranslate.outputDirectory` | `""` | Custom output directory |

### Translation Services

**Free Services (No API Key Required):**
- `google` - Google Translate (may require proxy in some regions)
- `bing` - Bing Translator (recommended, no proxy needed)
- `deeplx` - Free DeepL alternative

**API Key Required:**
- `openai` - OpenAI (requires OPENAI_API_KEY)
- `deepl` - DeepL (requires DEEPL_AUTH_KEY)
- `gemini` - Google Gemini (requires GEMINI_API_KEY)
- `azure-openai` - Azure OpenAI
- `zhipu` - Zhipu AI
- `deepseek` - DeepSeek
- `groq` - Groq
- `silicon` - Silicon Flow
- `azure` - Azure Translator
- `tencent` - Tencent TMT

**Local LLM:**
- `ollama` - Ollama (requires local Ollama installation)

### Supported Languages

`en`, `zh`, `zh-TW`, `ja`, `ko`, `fr`, `de`, `es`, `ru`, `it`, `ar`, `pt`, `nl`, `pl`, `tr`, `vi`, `th`, `id`, `hi`, `uk`, `cs`, `ro`, `sv`, `hu`, `el`, `da`, `fi`, `no`, `sk`, `bg`, `hr`, `sr`, `bn`, `ta`, `te`, `mr`, `gu`, `kn`, `ml`, `ur`, `fa`

### API Keys Configuration

For services requiring API keys, configure them in settings:

```json
{
  "pdfTranslate.apiKeys": {
    "OPENAI_API_KEY": "sk-xxx",
    "OPENAI_BASE_URL": "https://api.openai.com/v1",
    "OPENAI_MODEL": "gpt-4o-mini",
    "DEEPL_AUTH_KEY": "your-deepl-key",
    "GEMINI_API_KEY": "your-gemini-key"
  }
}
```

### Output Directory

By default, translated files are saved to a `translated-pdfs` subfolder in the same directory as the source PDF:

```
my-document.pdf
translated-pdfs/
  ├── my-document-mono.pdf   (translated only)
  └── my-document-dual.pdf   (bilingual)
```

To customize the output location, set `pdfTranslate.outputDirectory`:

```json
{
  "pdfTranslate.outputDirectory": "C:\\MyTranslations"
}
```

## Examples

### Example 1: English to Chinese (Default)
```json
{
  "pdfTranslate.sourceLanguage": "en",
  "pdfTranslate.targetLanguage": "zh",
  "pdfTranslate.translationService": "bing"
}
```

### Example 2: Using OpenAI
```json
{
  "pdfTranslate.translationService": "openai",
  "pdfTranslate.apiKeys": {
    "OPENAI_API_KEY": "sk-xxx",
    "OPENAI_MODEL": "gpt-4o"
  }
}
```

### Example 3: Japanese to English with Custom Output
```json
{
  "pdfTranslate.sourceLanguage": "ja",
  "pdfTranslate.targetLanguage": "en",
  "pdfTranslate.outputDirectory": "D:\\Translations"
}
```

## Troubleshooting

### pdf2zh not found
Ensure pdf2zh is installed and in your PATH:
```bash
pip install pdf2zh
pdf2zh --version
```

If installed in a custom location, specify the full path:
```json
{
  "pdfTranslate.pdf2zhPath": "C:\\Python\\Scripts\\pdf2zh.exe"
}
```

### Translation fails with Google
Google Translate may require a proxy in some regions. Use Bing instead:
```json
{
  "pdfTranslate.translationService": "bing"
}
```

### Empty preview
The extension automatically waits for file generation. If preview is still empty:
1. Check the Output panel (`View > Output > PDF Translate`)
2. Verify the translated file exists in the output directory
3. Try opening the PDF manually

## Development

### Build from Source

```bash
git clone https://github.com/yourusername/vscode-pdf-translate
cd vscode-pdf-translate
npm install
npm run compile
```

### Package Extension

```bash
npm run package
```

This creates a `.vsix` file that can be installed in VSCode.

## Credits

This extension is built on top of [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate) by Byaidu.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

The AGPL-3.0 license requires that:
- Any modifications to this software must be released under the same license
- If you run a modified version on a server (e.g., as a web service), you must make the source code available to users

See the [LICENSE](./LICENSE) file for the full license text.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
