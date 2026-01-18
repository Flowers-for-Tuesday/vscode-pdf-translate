# PDF Translate for VSCode

一个VSCode插件，用于翻译PDF文档，同时保留布局、公式和图片。基于 [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate) 构建。

[English Documentation](./README.md)

## 功能特性

- **布局保留**：翻译PDF时保持原始格式、公式和图片
- **多语言支持**：支持40+种语言，包括中文、英文、日文、韩文等
- **多种翻译服务**：支持14+种翻译服务（Google、Bing、OpenAI、DeepL等）
- **双重输出**：生成单语（仅翻译）和双语（对照）两个版本
- **侧边栏预览**：自动在VSCode侧边栏预览翻译后的PDF
- **简单配置**：最少的设置，合理的默认值

## 前置要求

使用本插件前，必须先安装 [pdf2zh](https://github.com/Byaidu/PDFMathTranslate)。

### 方法1：使用 uv（推荐）⭐

[uv](https://github.com/astral-sh/uv) 是一个快速的 Python 包管理器，可以自动处理 Python 版本管理。**无需手动安装 Python 3.10-3.12！**

#### Windows 系统

打开 PowerShell 并运行：

```powershell
# 安装 uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 使用 Python 3.12 安装 pdf2zh
uv tool install --python 3.12 pdf2zh
```

#### macOS / Linux 系统

打开终端并运行：

```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 使用 Python 3.12 安装 pdf2zh
uv tool install --python 3.12 pdf2zh
```

#### 验证安装

```bash
pdf2zh --version
```

**为什么选择 uv？**
- ⚡ **速度快 10-100 倍** - 比 pip 快得多
- 🔧 **自动管理 Python 版本** - 自动下载 Python 3.12
- 🎯 **环境隔离** - 不会与系统 Python 冲突
- 🌐 **跨平台** - Windows/macOS/Linux 使用相同命令

### 方法2：使用 pip（传统方式）

如果你更喜欢传统方法，需要预先安装 Python 3.10-3.12：

```bash
pip install pdf2zh
```

**注意**：确保已安装 Python 3.10、3.11 或 3.12。不支持 Python 3.13+。

### 详细设置指南

有关故障排除和高级配置，请参阅 [UV 设置指南](./docs/UV_SETUP_GUIDE.md)。

## 安装方法

1. 从发布页面下载 `.vsix` 文件
2. 在VSCode中按 `Ctrl+Shift+P`
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的文件

或在VSCode市场搜索 "PDF Translate"（发布后）。

## 使用方法

### 方法1：右键菜单
1. 在资源管理器中右键点击PDF文件
2. 选择 "Translate PDF"

### 方法2：命令面板
1. 打开PDF文件
2. 按 `Ctrl+Shift+P`
3. 输入 "Translate PDF"

### 方法3：切换语言
1. 按 `Ctrl+Shift+P`
2. 输入 "Select Translation Languages"
3. 选择源语言和目标语言

## 配置说明

打开VSCode设置（`Ctrl+,`）并搜索 "pdf translate"：

### 基础设置

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| `pdfTranslate.sourceLanguage` | `en` | 源语言代码 |
| `pdfTranslate.targetLanguage` | `zh` | 目标语言代码 |
| `pdfTranslate.translationService` | `bing` | 使用的翻译服务 |
| `pdfTranslate.threads` | `4` | 线程数（0 = 自动）|
| `pdfTranslate.pdf2zhPath` | `pdf2zh` | pdf2zh命令路径 |
| `pdfTranslate.outputDirectory` | `""` | 自定义输出目录 |

### 翻译服务

**免费服务（无需API密钥）：**
- `google` - Google翻译（部分地区可能需要代理）
- `bing` - Bing翻译（推荐，无需代理）
- `deeplx` - 免费DeepL替代

**需要API密钥：**
- `openai` - OpenAI（需要OPENAI_API_KEY）
- `deepl` - DeepL（需要DEEPL_AUTH_KEY）
- `gemini` - Google Gemini（需要GEMINI_API_KEY）
- `azure-openai` - Azure OpenAI
- `zhipu` - 智谱AI
- `deepseek` - 深度求索
- `groq` - Groq
- `silicon` - Silicon Flow
- `azure` - Azure翻译
- `tencent` - 腾讯机器翻译

**本地LLM：**
- `ollama` - Ollama（需要本地安装Ollama）

### 支持的语言

`en`（英语）, `zh`（简体中文）, `zh-TW`（繁体中文）, `ja`（日语）, `ko`（韩语）, `fr`（法语）, `de`（德语）, `es`（西班牙语）, `ru`（俄语）, `it`（意大利语）, `ar`（阿拉伯语）, `pt`（葡萄牙语）, `nl`（荷兰语）, `pl`（波兰语）, `tr`（土耳其语）, `vi`（越南语）, `th`（泰语）, `id`（印尼语）, `hi`（印地语）, `uk`（乌克兰语）, `cs`（捷克语）, `ro`（罗马尼亚语）, `sv`（瑞典语）, `hu`（匈牙利语）, `el`（希腊语）, `da`（丹麦语）, `fi`（芬兰语）, `no`（挪威语）, `sk`（斯洛伐克语）, `bg`（保加利亚语）, `hr`（克罗地亚语）, `sr`（塞尔维亚语）, `bn`（孟加拉语）, `ta`（泰米尔语）, `te`（泰卢固语）, `mr`（马拉地语）, `gu`（古吉拉特语）, `kn`（卡纳达语）, `ml`（马拉雅拉姆语）, `ur`（乌尔都语）, `fa`（波斯语）

### API密钥配置

对于需要API密钥的服务，在设置中配置：

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

### 输出目录

默认情况下，翻译文件保存到源PDF同目录下的 `translated-pdfs` 子文件夹：

```
my-document.pdf
translated-pdfs/
  ├── my-document-mono.pdf   (仅翻译)
  └── my-document-dual.pdf   (双语对照)
```

自定义输出位置，设置 `pdfTranslate.outputDirectory`：

```json
{
  "pdfTranslate.outputDirectory": "C:\\我的翻译"
}
```

## 使用示例

### 示例1：英文翻译中文（默认）
```json
{
  "pdfTranslate.sourceLanguage": "en",
  "pdfTranslate.targetLanguage": "zh",
  "pdfTranslate.translationService": "bing"
}
```

### 示例2：使用OpenAI
```json
{
  "pdfTranslate.translationService": "openai",
  "pdfTranslate.apiKeys": {
    "OPENAI_API_KEY": "sk-xxx",
    "OPENAI_MODEL": "gpt-4o"
  }
}
```

### 示例3：日文翻译英文，自定义输出目录
```json
{
  "pdfTranslate.sourceLanguage": "ja",
  "pdfTranslate.targetLanguage": "en",
  "pdfTranslate.outputDirectory": "D:\\翻译文件"
}
```

## 常见问题

### 找不到 pdf2zh

**如果使用 uv 安装：**

1. **重启 VSCode**（最常见的解决方案）
2. 检查 pdf2zh 是否在 PATH 中：
   ```bash
   # Windows PowerShell
   where.exe pdf2zh

   # macOS/Linux
   which pdf2zh
   ```
3. 如果找不到，添加到 PATH 或在设置中配置完整路径：

   **Windows 系统：**
   ```json
   {
     "pdfTranslate.pdf2zhPath": "C:\\Users\\你的用户名\\.local\\bin\\pdf2zh.exe"
   }
   ```

   **macOS/Linux 系统：**
   ```json
   {
     "pdfTranslate.pdf2zhPath": "~/.local/bin/pdf2zh"
   }
   ```

4. 如果仍然不工作，重新安装：
   ```bash
   uv tool uninstall pdf2zh
   uv tool install --python 3.12 pdf2zh
   ```

**如果使用 pip 安装：**

确保 pdf2zh 已安装并在 PATH 中：
```bash
pip install pdf2zh
pdf2zh --version
```

如果安装在自定义位置，指定完整路径：
```json
{
  "pdfTranslate.pdf2zhPath": "C:\\Python\\Scripts\\pdf2zh.exe"
}
```

### Python 版本不兼容

pdf2zh 需要 Python 3.10-3.12。如果你的系统是 Python 3.13+：

**解决方案**：使用 uv 自动管理正确的 Python 版本：
```bash
uv tool install --python 3.12 pdf2zh
```

### Google翻译失败
Google翻译在某些地区可能需要代理。建议使用Bing：
```json
{
  "pdfTranslate.translationService": "bing"
}
```

### 预览空白
插件会自动等待文件生成。如果预览仍然空白：
1. 检查输出面板（`视图 > 输出 > PDF Translate`）
2. 验证翻译文件是否存在于输出目录
3. 尝试手动打开PDF

## 开发

### 从源码构建

```bash
git clone https://github.com/yourusername/vscode-pdf-translate
cd vscode-pdf-translate
npm install
npm run compile
```

### 打包插件

```bash
npm run package
```

这会创建一个可以安装到VSCode的 `.vsix` 文件。

## 致谢

本插件基于 [PDFMathTranslate](https://github.com/Byaidu/PDFMathTranslate)（作者：Byaidu）构建。

## 许可证

本项目采用 GNU Affero General Public License v3.0 (AGPL-3.0) 许可证。

AGPL-3.0 许可证要求：
- 对本软件的任何修改必须以相同许可证发布
- 如果在服务器上运行修改版本（例如作为Web服务），必须向用户提供源代码

完整许可证文本请查看 [LICENSE](./LICENSE) 文件。

## 贡献

欢迎贡献！请随时提交问题或拉取请求。
