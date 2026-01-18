# 使用 uv 配置 pdf2zh 环境指南

本指南介绍如何使用 uv 为 VSCode PDF Translate 扩展配置 pdf2zh 环境。

## 为什么使用 uv？

uv 是现代 Python 包管理器，相比传统 pip 方式有以下优势：

- ⚡ **速度快**：安装速度比 pip 快 10-100 倍
- 🔧 **自动管理 Python 版本**：无需手动安装特定 Python 版本
- 🎯 **环境隔离**：pdf2zh 安装在独立环境，不影响系统 Python
- 🌐 **跨平台统一**：Windows/macOS/Linux 使用相同命令

## 快速开始

### 步骤 1: 安装 uv

#### Windows

打开 PowerShell，运行：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### macOS/Linux

打开终端，运行：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 步骤 2: 安装 pdf2zh

运行以下命令（跨平台通用）：

```bash
uv tool install --python 3.12 pdf2zh
```

这个命令会：
1. 自动下载并安装 Python 3.12（如果系统没有）
2. 创建独立的虚拟环境
3. 安装 pdf2zh 及其所有依赖
4. 将 pdf2zh 命令添加到 PATH

### 步骤 3: 验证安装

```bash
pdf2zh --version
```

应该输出类似：`pdf2zh version 1.9.11`

## VSCode 扩展配置

### 自动检测（推荐）

扩展默认会自动查找 `pdf2zh` 命令，uv 安装后通常无需额外配置。

### 手动配置路径

如果扩展无法找到 pdf2zh，需要手动配置路径：

#### Windows

1. 打开 VSCode 设置（`Ctrl+,`）
2. 搜索 "pdf translate path"
3. 设置 `pdfTranslate.pdf2zhPath` 为：

```
C:\Users\<你的用户名>\.local\bin\pdf2zh.exe
```

或使用完整路径：

```powershell
# 在 PowerShell 中查找路径
where.exe pdf2zh
```

#### macOS/Linux

1. 打开 VSCode 设置（`Cmd+,`）
2. 设置 `pdfTranslate.pdf2zhPath` 为：

```
~/.local/bin/pdf2zh
```

或使用完整路径：

```bash
# 在终端中查找路径
which pdf2zh
```

## 常见问题

### Q1: 命令 'pdf2zh' 未找到

**原因**：uv 安装的工具路径未添加到 PATH

**Windows 解决方案**：

```powershell
# 1. 添加到当前会话
$env:Path += ";$env:USERPROFILE\.local\bin"

# 2. 永久添加（推荐）
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\.local\bin",
    "User"
)
```

重启 VSCode 后生效。

**macOS/Linux 解决方案**：

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Q2: 我已经有 Python 3.13，会冲突吗？

**不会**！uv 会自动下载并使用 Python 3.12 来创建 pdf2zh 的独立环境，不影响系统 Python 3.13。

### Q3: 如何更新 pdf2zh？

```bash
uv tool upgrade pdf2zh
```

### Q4: 如何卸载？

```bash
uv tool uninstall pdf2zh
```

### Q5: 安装速度慢？

uv 已经很快了，但如果在中国地区仍较慢，可以配置镜像：

```bash
# 使用清华镜像
uv tool install --python 3.12 pdf2zh --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q6: VSCode 插件仍然提示 "pdf2zh not found"

尝试以下步骤：

1. **重启 VSCode**（最常见原因）
2. **检查路径**：
   ```bash
   # Windows PowerShell
   where.exe pdf2zh

   # macOS/Linux
   which pdf2zh
   ```
3. **手动配置路径**（见上文"手动配置路径"）
4. **运行诊断工具**：
   - 按 `Ctrl+Shift+P`
   - 输入 "PDF Translate: Diagnose"

## 传统 pip 方式对比

| 特性 | uv (推荐) | pip (传统) |
|------|-----------|------------|
| 需要手动安装 Python | ❌ 自动管理 | ✅ 需要 |
| 版本冲突 | ❌ 独立环境 | ⚠️ 可能冲突 |
| 安装速度 | ⚡ 极快 | 🐌 较慢 |
| 卸载清理 | ✅ 完全清理 | ⚠️ 可能残留 |
| 跨平台一致性 | ✅ 统一命令 | ⚠️ 略有差异 |

## 高级用法

### 安装特定版本

```bash
uv tool install --python 3.12 pdf2zh==1.9.11
```

### 查看已安装的工具

```bash
uv tool list
```

### 安装到自定义位置

```bash
uv tool install --python 3.12 pdf2zh --install-dir /custom/path
```

## 故障排除命令

### 诊断 uv 安装

```bash
uv --version
```

### 查看 pdf2zh 环境信息

```bash
uv tool run pdf2zh --version
```

### 重新安装 pdf2zh

```bash
uv tool uninstall pdf2zh
uv tool install --python 3.12 pdf2zh
```

## 需要帮助？

- [uv 官方文档](https://docs.astral.sh/uv/)
- [pdf2zh GitHub Issues](https://github.com/Byaidu/PDFMathTranslate/issues)
- [VSCode 扩展 Issues](https://github.com/yourusername/vscode-pdf-translate/issues)

## 总结

推荐使用 uv 的三大理由：

1. **简单**：一条命令自动配置完整环境
2. **安全**：独立环境不影响系统 Python
3. **快速**：安装和更新速度极快

只需运行：

```bash
# 1. 安装 uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"  # Windows
# 或
curl -LsSf https://astral.sh/uv/install.sh | sh  # macOS/Linux

# 2. 安装 pdf2zh
uv tool install --python 3.12 pdf2zh

# 3. 完成！
```
