@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo   快速修复404错误 - ECS部署
echo ==========================================
echo.

echo [1/4] 停止可能运行的服务...
taskkill /f /im node.exe >nul 2>&1
echo ✅ 清理完成

echo.
echo [2/4] 构建前端项目...
cd qianduan
if not exist node_modules (
    echo 📦 安装前端依赖...
    npm install
)
echo 🔨 构建前端...
npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
cd ..

echo.
echo [3/4] 安装生产环境依赖...
if not exist node_modules (
    npm install
)
npm install http-proxy-middleware --save >nul 2>&1
echo ✅ 依赖安装完成

echo.
echo [4/4] 启动服务...

:: 启动后端服务
echo 🚀 启动后端服务...
cd houduan
start "后端API服务" cmd /k "echo 后端服务启动中... && npm run dev"
cd ..

:: 等待后端启动
echo ⏳ 等待后端服务启动...
timeout /t 3 >nul

:: 启动生产服务器
echo 🚀 启动前端服务器...
echo.
echo ✅ 修复完成！
echo.
echo 📍 访问地址：
echo   • 本地测试: http://localhost
echo   • ECS访问: http://你的ECS公网IP
echo.
echo 🔧 如果仍有问题，请检查：
echo   1. 后端服务是否正常启动（端口3000）
echo   2. 数据库连接是否正常
echo   3. ECS安全组是否开放80端口
echo.

node production-server.js