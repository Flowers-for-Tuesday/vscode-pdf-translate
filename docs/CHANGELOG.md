# 开发日志 (Development Changelog)

本文件记录 vscode-pdf-translate 项目的所有重要更新和修改。

---

## 2025-01-25

### 添加自动环境配置功能

**新增文件:**
- `src/environmentManager.ts`

**修改文件:**
- `src/extension.ts`
- `src/translator.ts`
- `package.json`
- `CLAUDE.md`

**功能描述:**
当检测到 pdf2zh 未安装时，自动安装 uv 和 pdf2zh，无需用户手动配置环境。

**实现细节:**

1. **EnvironmentManager 类** (environmentManager.ts)
   - `checkUvInstalled()`: 检测 uv 是否已安装
   - `checkPdf2zhInstalled()`: 检测 pdf2zh 是否已安装
   - `getStatus()`: 获取当前环境状态
   - `installUv()`: 自动安装 uv 包管理器
     - Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
     - Unix: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - `installPdf2zh()`: 使用 uv 安装 pdf2zh
     - Unix: `source "$HOME/.local/bin/env" && uv tool install --python 3.12 pdf2zh`
     - Windows: `uv tool install --python 3.12 pdf2zh`
   - `ensureEnvironment()`: 主入口，确保环境就绪

2. **进度通知窗口**
   - 使用 `vscode.window.withProgress` 显示实时进度
   - 实时显示终端输出（如 "Downloading onnx (15.6MiB)"）
   - 支持用户取消（点击 X 按钮）
   - 自动过滤 ANSI 转义码，显示干净的输出

3. **翻译器集成** (translator.ts)
   - 翻译前自动检测环境
   - 未安装时弹出询问对话框：
     - `Install Automatically`: 自动安装
     - `Manual Instructions`: 打开手动安装说明
     - `Cancel`: 取消
   - 缓存已验证的 pdf2zh 路径，避免重复检测

4. **新增命令** (extension.ts, package.json)
   - `pdfTranslate.setupEnvironment`: 手动触发环境初始化
   - 命令名称: "PDF Translate: Setup Environment"

**用户体验改进:**
- ✅ 零配置安装 - 无需手动安装 uv 和 pdf2zh
- ✅ 实时进度显示 - 显示下载和安装状态
- ✅ 可取消操作 - 随时中断安装过程
- ✅ 跨平台支持 - Windows/macOS/Linux 自动适配
- ✅ 智能检测 - 已安装则跳过，避免重复安装

**安装流程图:**
```
翻译 PDF
    │
    ▼
检测 pdf2zh ──存在──► 直接翻译
    │
   不存在
    │
    ▼
弹出对话框
[Install Automatically] [Manual Instructions] [Cancel]
    │
    ▼ (选择自动安装)
┌─────────────────────────────────────┐
│ 📦 Initializing PDF Translation     │
│    Environment                      │
│ ─────────────────────────────────── │
│ Downloading onnx (15.6MiB)      [X] │
└─────────────────────────────────────┘
    │
    ▼
安装 uv (如未安装) ──► 安装 pdf2zh ──► 验证 ──► 开始翻译
```

---

## 2026-01-21

### 添加页面范围翻译功能

**修改文件:**
- `package.json`
- `src/config.ts`
- `src/translator.ts`
- `src/extension.ts`

**功能描述:**
支持翻译指定页面范围，例如 `1-3,5` 表示翻译第 1-3 页和第 5 页。

**实现细节:**

1. **配置项添加** (package.json)
   - 新增 `pdfTranslate.pageRange` 设置项
   - 类型：字符串，默认为空（翻译全部页面）
   - 格式示例：`1-3,5`、`1,2,3`、`10-20`

2. **配置接口更新** (config.ts)
   - `TranslationConfig` 接口新增 `pageRange: string` 属性
   - `getConfig()` 方法读取 pageRange 配置

3. **命令构建更新** (translator.ts)
   - `buildCommand()` 方法支持 `-p` 参数
   - 当 pageRange 非空时添加 `-p {pageRange}` 到命令

4. **用户交互增强** (extension.ts)
   - 确认对话框显示当前页面范围
   - 新增"Set Page Range"按钮
   - 输入框支持格式验证（正则：`^(\d+(-\d+)?)(,\d+(-\d+)?)*$`）
   - 支持运行时覆盖配置中的页面范围

**用户体验改进:**
- ✅ 确认对话框显示当前页面范围信息
- ✅ 可设置默认页面范围或每次翻译时指定
- ✅ 输入格式实时验证
- ✅ 空值表示翻译全部页面

**命令示例:**
```bash
pdf2zh example.pdf -p 1-3,5  # 翻译第 1-3 页和第 5 页
```

---

## 2026-01-19

### 添加翻译取消功能

**修改文件:**
- `src/translator.ts`
- `src/extension.ts`

**功能描述:**
为翻译进度条添加取消按钮，允许用户随时中断翻译过程。

**实现细节:**

1. **启用可取消进度条** (translator.ts)
   - `cancellable` 从 `false` 改为 `true`
   - 传递 `CancellationToken` 到执行方法

2. **添加取消监听器** (translator.ts)
   - 监听 `token.onCancellationRequested` 事件
   - Windows: 使用 `taskkill /pid {pid} /f /t` 终止进程树
   - Unix: 使用 `SIGTERM` 信号终止进程
   - 设置 `isCancelled` 标志区分正常退出和用户取消

3. **优化取消提示** (extension.ts)
   - 取消时显示信息提示 "Translation cancelled"
   - 不再显示错误消息框

**用户体验改进:**
- ✅ 进度条显示取消按钮（X）
- ✅ 点击即可立即停止翻译
- ✅ 正确终止所有子进程
- ✅ 友好的取消提示信息

---

### 添加实时进度条功能

**修改文件:**
- `src/translator.ts`
- `src/extension.ts`

**功能描述:**
为翻译过程添加实时进度条，解析 pdf2zh 的 tqdm 输出并显示在 VSCode 通知区域。

**实现细节:**

1. **新增 `parseProgress` 方法** (translator.ts)
   - 解析 tqdm 格式: `29%|██       | 2/7 [00:00<00:02,  2.08it/s]`
   - 提取：百分比、当前页数、总页数、时间信息
   - 返回用户友好的消息格式

2. **修改 `executeTranslation` 方法** (translator.ts)
   - 添加 `progress` 参数（可选）
   - 监听 stderr 输出并解析进度
   - 使用增量方式更新进度条
   - 跟踪 `lastProgress` 避免重复更新

3. **修改 `translatePDF` 方法** (translator.ts)
   - 使用 `vscode.window.withProgress` API
   - 配置：显示在通知区域，不可取消
   - 标题：`Translating PDF`

4. **移除静态消息** (extension.ts)
   - 删除 `vscode.window.showInformationMessage("Translating...")`
   - 进度条自动显示，不需要额外提示

**用户体验改进:**
- ✅ 实时显示翻译进度（页数、百分比）
- ✅ 显示时间信息（已用时间、预估剩余时间、速度）
- ✅ 符合 VSCode 原生体验
- ✅ 非阻塞，不影响性能

**示例输出:**
```
Translating PDF
2/7 pages (29%) - 00:00<00:02, 2.08it/s
```

---

### 更新安装文档，推荐使用 uv

**修改文件:**
- `README.md`
- `README.zh-CN.md`

**新增文件:**
- `docs/UV_SETUP_GUIDE.md` - uv 详细设置指南

**主要改动:**

1. **Prerequisites 部分重构**
   - 方法1：使用 uv（推荐）⭐
     - Windows: PowerShell 安装命令
     - macOS/Linux: curl 安装命令
     - 强调优势：快速、自动 Python 版本管理、环境隔离
   - 方法2：使用 pip（传统方式）
     - 保留传统方法作为备选
     - 添加 Python 版本要求说明（3.10-3.12）

2. **Troubleshooting 部分更新**
   - 分别提供 uv 和 pip 的故障排除步骤
   - 新增"Python 版本不兼容"章节
   - Windows/macOS/Linux 分平台说明路径配置
   - 添加重新安装步骤

3. **UV Setup Guide 详细文档**
   - 完整的安装步骤
   - 常见问题 FAQ
   - 与 pip 对比表格
   - 高级用法说明

**用户体验改进:**
- ✅ 降低使用门槛（无需手动安装 Python）
- ✅ 解决 Python 3.13+ 兼容问题
- ✅ 安装速度提升 10-100 倍
- ✅ 中英文文档同步更新

**关键优势:**
```bash
# 仅需两条命令完成配置
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv tool install --python 3.12 pdf2zh
```

---

### 创建 CLAUDE.md 项目指南

**新增文件:**
- `CLAUDE.md`

**内容概述:**
为未来的 Claude Code 实例提供项目架构和开发指南。

**包含内容:**
1. 项目概述
2. 构建和开发命令
3. 核心组件架构说明
4. 翻译流程详解
5. 外部依赖说明
6. 关键实现细节

---

## 待办事项 (TODO)

### 短期
- [x] 添加进度条取消功能 ✅ (2026-01-19)
- [x] 添加一键安装 uv 和 pdf2zh 的命令 ✅ (2025-01-25)
- [ ] 改进错误提示（在进度条中显示）
- [ ] 添加状态栏进度显示

### 中期
- [ ] 支持批量翻译多个 PDF
- [ ] 添加诊断工具检测环境问题
- [ ] 创建安装演示 GIF

### 长期
- [ ] 支持更多翻译服务
- [ ] 添加翻译历史记录
- [ ] 集成 PDF 预览功能
- [ ] 支持自定义翻译模板

---

## 版本历史 (Version History)

### v1.3.0 (2025-01-25)
- ✅ 添加自动环境配置功能
- ✅ 自动安装 uv 和 pdf2zh
- ✅ 实时显示安装进度和终端输出
- ✅ 支持取消安装过程
- ✅ 新增 `PDF Translate: Setup Environment` 命令

### v1.2.0 (2026-01-21)
- ✅ 添加页面范围翻译功能
- ✅ 支持格式：`1-3,5`（翻译第 1-3 页和第 5 页）
- ✅ 翻译时可设置或修改页面范围

### v1.1.0 (2026-01-19)
- ✅ 添加翻译取消功能
- ✅ 进度条支持取消按钮
- ✅ 跨平台进程终止支持

### v1.0.0 (2026-01-19)
- ✅ 基础翻译功能
- ✅ 多语言支持（40+ 语言）
- ✅ 多翻译服务支持（14+ 服务）
- ✅ 实时进度条
- ✅ uv 安装支持
- ✅ 双输出模式（mono + dual）
- ✅ 侧边栏预览

---

## 技术债务 (Technical Debt)

1. **pdfViewer.ts 未使用**
   - 当前使用 VSCode 内置 PDF 查看器
   - 自定义查看器代码保留但未激活
   - 考虑：移除或改进自定义查看器

2. **错误处理改进**
   - 需要更细粒度的错误类型
   - 添加用户友好的错误消息
   - 实现错误恢复机制

3. **测试覆盖**
   - 缺少单元测试
   - 需要集成测试
   - 添加 E2E 测试

---

## 贡献者 (Contributors)

本日志记录由 Claude Code 辅助完成。
