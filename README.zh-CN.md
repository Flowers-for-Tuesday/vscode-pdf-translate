# PDF Translate for VSCode

翻译 PDF 文档，同时保留布局、公式和图片。基于 [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate)。

![demo](https://raw.githubusercontent.com/Flowers-for-Tuesday/vscode-pdf-translate/main/demo/demo0.PNG)

## 功能特性

- **保留布局** - 保持原始格式、公式和图片
- **40+ 语言** - 中文、英文、日文、韩文、法文、德文等
- **14+ 翻译服务** - Google、Bing、OpenAI、DeepL、Gemini 等
- **页面范围选择** - 翻译指定页面（如 1-3,5）
- **双重输出** - 生成纯翻译版和双语对照版
- **实时进度** - 显示翻译进度，支持取消
- **一键翻译** - 右键点击 PDF 即可翻译

## 快速开始

### 1. 安装 pdf2zh（必需）

**Windows** (PowerShell):
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv tool install --python 3.12 pdf2zh
```

**macOS / Linux**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
uv tool install --python 3.12 pdf2zh
```

### 2. 翻译 PDF

- **右键点击** PDF 文件 → **Translate PDF**
- 或按 `Ctrl+Shift+P` → **Translate PDF**

## 配置说明

![settings](https://raw.githubusercontent.com/Flowers-for-Tuesday/vscode-pdf-translate/main/demo/demo1.PNG)

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| `sourceLanguage` | `en` | 源语言 |
| `targetLanguage` | `zh` | 目标语言 |
| `translationService` | `bing` | 翻译服务 |
| `threads` | `4` | 并行线程数 |
| `pageRange` | （空） | 页面范围（如 `1-3,5`） |

### 翻译服务

| 免费（无需密钥） | 需要 API 密钥 | 本地 |
|------------------|---------------|------|
| `bing`（推荐） | `openai` | `ollama` |
| `google` | `deepl` | |
| `deeplx` | `gemini`、`deepseek`、`zhipu` | |

### API 密钥配置

```json
{
  "pdfTranslate.apiKeys": {
    "OPENAI_API_KEY": "sk-xxx",
    "DEEPL_AUTH_KEY": "your-key"
  }
}
```

## 输出文件

翻译文件保存到 `translated-pdfs/` 文件夹：

```
my-document.pdf
translated-pdfs/
  ├── my-document-mono.pdf   (纯翻译)
  └── my-document-dual.pdf   (双语对照)
```

## 常见问题

### 找不到 pdf2zh

扩展会自动检测以下路径：
- 用户配置的路径
- uv 默认路径：`~/.local/bin/pdf2zh`

如果仍然找不到：
1. **重启 VSCode**
2. 验证安装：`pdf2zh --version`
3. 手动设置路径：
   ```json
   { "pdfTranslate.pdf2zhPath": "C:\\Users\\用户名\\.local\\bin\\pdf2zh.exe" }
   ```

### Google 翻译失败

使用 Bing 代替（无需代理）：
```json
{ "pdfTranslate.translationService": "bing" }
```

## 相关链接

- [GitHub 仓库](https://github.com/Flowers-for-Tuesday/vscode-pdf-translate)
- [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate)
- [问题反馈](https://github.com/Flowers-for-Tuesday/vscode-pdf-translate/issues)

## 许可证

[AGPL-3.0](https://github.com/Flowers-for-Tuesday/vscode-pdf-translate/blob/main/LICENSE)
