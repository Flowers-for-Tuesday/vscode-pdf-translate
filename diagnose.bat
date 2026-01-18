@echo off
REM VS Code PDF Translate 诊断工具
echo ========================================
echo VS Code PDF Translate 诊断工具
echo ========================================
echo.

echo [1/5] 检查 Python 版本...
python --version
if %errorlevel% neq 0 (
    echo   ❌ Python 未安装或不在 PATH 中
    echo   请从 https://www.python.org/ 下载安装
    goto :end
) else (
    echo   ✓ Python 已安装
)
echo.

echo [2/5] 检查 pdf2zh 安装...
pdf2zh --version
if %errorlevel% neq 0 (
    echo   ❌ pdf2zh 未安装或不在 PATH 中
    echo   请运行: pip install pdf2zh
    goto :end
) else (
    echo   ✓ pdf2zh 已安装
)
echo.

echo [3/5] 检查临时目录...
set TEMP_DIR=%TEMP%\vscode-pdf-translate
if exist "%TEMP_DIR%" (
    echo   ✓ 临时目录存在: %TEMP_DIR%
    echo   目录内容:
    dir /b "%TEMP_DIR%"
) else (
    echo   ℹ 临时目录不存在（首次翻译时会自动创建）
    echo   路径: %TEMP_DIR%
)
echo.

echo [4/5] 测试 pdf2zh 命令...
echo   请将测试PDF文件拖放到此窗口，然后按回车键
echo   （或输入 skip 跳过测试）
set /p TEST_PDF="PDF 路径: "

if "%TEST_PDF%"=="skip" (
    echo   ⊘ 跳过测试
    goto :summary
)

REM 去除引号
set TEST_PDF=%TEST_PDF:"=%

if not exist "%TEST_PDF%" (
    echo   ❌ 文件不存在: %TEST_PDF%
    goto :summary
)

echo   正在测试翻译（这可能需要几分钟）...
pdf2zh "%TEST_PDF%" -o "%TEMP%" -li en -lo zh -s google -t 1
if %errorlevel% equ 0 (
    echo   ✓ 测试翻译成功！
    echo   输出文件应在: %TEMP%
) else (
    echo   ❌ 测试翻译失败，错误代码: %errorlevel%
)
echo.

:summary
echo [5/5] 诊断摘要
echo ========================================
echo.
echo 下一步操作：
echo 1. 如果所有检查都通过，尝试在 VS Code 中翻译
echo 2. 按 F5 启动扩展开发主机
echo 3. 查看 Output 面板中的 "PDF Translate" 频道
echo 4. 如果仍有问题，查看 DEBUGGING.md 文件
echo.
echo 环境信息：
echo - Python: 已安装
echo - pdf2zh: 已安装
echo - 临时目录: %TEMP_DIR%
echo.

:end
echo ========================================
echo 按任意键退出...
pause >nul
