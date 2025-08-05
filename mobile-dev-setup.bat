@echo off
echo ========================================
echo 移动端开发环境设置
echo ========================================

echo.
echo 检查必要依赖...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: Node.js 未安装或不在PATH中
    pause
    exit /b 1
)

where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: npx 未找到，请确保Node.js正确安装
    pause
    exit /b 1
)

echo.
echo 1. 构建前端项目...
cd qianduan
if not exist package.json (
    echo 错误: qianduan目录中未找到package.json
    pause
    exit /b 1
)

echo 使用移动端配置构建...
call npm run build:mobile
if %errorlevel% neq 0 (
    echo 错误: 前端构建失败
    pause
    exit /b 1
)

echo.
echo 2. 检查Capacitor配置...
if not exist capacitor.config.ts (
    echo 错误: 未找到capacitor.config.ts，请先运行 npx cap init
    pause
    exit /b 1
)

if not exist android (
    echo 警告: Android平台未添加，正在添加...
    call npx cap add android
    if %errorlevel% neq 0 (
        echo 错误: 添加Android平台失败
        pause
        exit /b 1
    )
)

echo 同步到移动端...
call npx cap sync
if %errorlevel% neq 0 (
    echo 错误: Capacitor同步失败
    pause
    exit /b 1
)

echo.
echo 3. 启动开发服务器...
start cmd /k "npm run dev"

echo.
echo 4. 等待3秒后打开Android Studio...
timeout /t 3

echo.
echo 5. 打开Android项目...
call npx cap open android

echo.
echo ========================================
echo 移动端开发环境已启动！
echo.
echo 开发流程：
echo 1. 修改前端代码
echo 2. 运行 npm run build
echo 3. 运行 npx cap sync
echo 4. 在Android Studio中运行应用
echo ========================================
pause