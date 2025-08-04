@echo off
echo ==========================================
echo 创建租赁平台部署包
echo ==========================================

REM 检查必要目录是否存在
if not exist "houduan" (
    echo ❌ 后端目录 houduan 不存在
    pause
    exit /b 1
)

if not exist "qianduan" (
    echo ❌ 前端目录 qianduan 不存在
    pause
    exit /b 1
)

echo.
echo 🗂️  准备部署文件...

REM 创建临时目录
if exist deployment-temp (
    echo 清理旧的临时文件...
    rmdir /s /q deployment-temp
)
mkdir deployment-temp

echo.
echo 📁 复制项目文件...

REM 复制后端文件
echo   - 复制后端文件 (houduan)
xcopy /E /I /Y houduan deployment-temp\houduan >nul
if %errorlevel% neq 0 (
    echo ❌ 复制后端文件失败
    goto cleanup
)

REM 复制前端文件
echo   - 复制前端文件 (qianduan)
xcopy /E /I /Y qianduan deployment-temp\qianduan >nul
if %errorlevel% neq 0 (
    echo ❌ 复制前端文件失败
    goto cleanup
)

REM 复制数据库文件
if exist "shujuku" (
    echo   - 复制数据库文件 (shujuku)
    xcopy /E /I /Y shujuku deployment-temp\shujuku >nul
)

echo.
echo 🧹 清理不必要的文件...

REM 删除node_modules（服务器上重新安装）
if exist "deployment-temp\houduan\node_modules" (
    echo   - 删除后端 node_modules
    rmdir /s /q deployment-temp\houduan\node_modules
)

if exist "deployment-temp\qianduan\node_modules" (
    echo   - 删除前端 node_modules
    rmdir /s /q deployment-temp\qianduan\node_modules
)

REM 删除前端构建文件（服务器上重新构建）
if exist "deployment-temp\qianduan\dist" (
    echo   - 删除前端构建文件
    rmdir /s /q deployment-temp\qianduan\dist
)

REM 删除日志文件
if exist "deployment-temp\houduan\logs" (
    echo   - 删除日志文件
    rmdir /s /q deployment-temp\houduan\logs
)

REM 删除上传文件（保留目录结构）
if exist "deployment-temp\houduan\uploads" (
    echo   - 清理上传文件
    for /d %%i in (deployment-temp\houduan\uploads\*) do rmdir /s /q "%%i" 2>nul
    for %%i in (deployment-temp\houduan\uploads\*.*) do del /q "%%i" 2>nul
)

echo.
echo 📄 复制配置和脚本文件...

REM 复制批处理脚本
for %%f in (*.bat) do (
    if exist "%%f" (
        echo   - 复制 %%f
        copy "%%f" deployment-temp\ >nul
    )
)

REM 复制文档文件
for %%f in (*.md) do (
    if exist "%%f" (
        echo   - 复制 %%f
        copy "%%f" deployment-temp\ >nul
    )
)

REM 复制根目录配置文件
if exist "package.json" copy package.json deployment-temp\ >nul
if exist "ecosystem.config.js" copy ecosystem.config.js deployment-temp\ >nul

echo.
echo 📦 创建部署包...

REM 生成时间戳
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,8%-%dt:~8,6%"

set "package_name=rental-platform-deploy-%timestamp%.zip"

REM 使用PowerShell创建压缩包
powershell -Command "Compress-Archive -Path 'deployment-temp\*' -DestinationPath '%package_name%' -Force"

if %errorlevel% neq 0 (
    echo ❌ 创建压缩包失败
    goto cleanup
)

echo.
echo ✅ 部署包创建成功！
echo 📦 文件名: %package_name%
echo 📊 文件大小:
for %%A in ("%package_name%") do echo    %%~zA 字节

echo.
echo 📋 部署包内容:
echo    - houduan/          (后端代码)
echo    - qianduan/         (前端代码)
echo    - shujuku/          (数据库脚本)
echo    - *.bat             (部署脚本)
echo    - *.md              (文档文件)
echo    - 配置文件

echo.
echo 🚀 下一步操作:
echo    1. 将 %package_name% 上传到服务器
echo    2. 在服务器上解压: unzip %package_name%
echo    3. 运行部署脚本或手动部署
echo    4. 配置环境变量和数据库连接
echo    5. 安装依赖并启动服务

:cleanup
echo.
echo 🧹 清理临时文件...
if exist deployment-temp rmdir /s /q deployment-temp

echo.
echo ==========================================
echo 部署包创建完成
echo ==========================================
pause
exit /b 0