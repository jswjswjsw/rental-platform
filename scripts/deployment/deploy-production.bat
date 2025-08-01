@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo   生产环境部署脚本 - ECS服务器
echo ==========================================
echo.

:: 检查Node.js环境
echo [1/6] 检查运行环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

:: 安装生产依赖
echo.
echo [2/6] 安装生产环境依赖...
if not exist node_modules (
    npm install
)
npm install http-proxy-middleware --save
echo ✅ 依赖安装完成

:: 构建前端项目
echo.
echo [3/6] 构建前端项目...
cd qianduan
if not exist node_modules (
    npm install
)
npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
cd ..

:: 安装后端依赖
echo.
echo [4/6] 准备后端服务...
cd houduan
if not exist node_modules (
    npm install
)
echo ✅ 后端依赖准备完成
cd ..

:: 启动后端服务
echo.
echo [5/6] 启动后端服务...
cd houduan
start "后端服务" cmd /k "npm run dev"
cd ..

:: 等待后端启动
echo 等待后端服务启动...
timeout /t 5 >nul

:: 启动生产服务器
echo.
echo [6/6] 启动生产服务器...
echo 🚀 启动生产环境服务器...
echo.
echo 📍 访问地址: http://你的ECS公网IP
echo 📍 本地测试: http://localhost
echo.
node production-server.js

pause