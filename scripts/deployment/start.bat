@echo off
echo 闲置资源租赁平台启动脚本
echo ========================

echo 1. 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 2. 检查MySQL服务...
sc query mysql >nul 2>&1
if errorlevel 1 (
    echo 警告: MySQL服务未运行，请先启动MySQL服务
)

echo 3. 安装后端依赖...
cd houduan
if not exist node_modules (
    echo 正在安装后端依赖包...
    npm install
)

echo 4. 检查环境配置...
if not exist .env (
    echo 警告: 未找到.env文件，请确保已配置数据库连接信息
)

echo 5. 安装前端依赖...
cd ..\qianduan
if not exist node_modules (
    echo 正在安装前端依赖包...
    npm install
)

echo 6. 启动服务...
echo 后端API服务: http://localhost:3000
echo 前端页面: http://localhost:8080
echo 按 Ctrl+C 停止服务
echo.

echo 启动后端服务...
start "后端服务" cmd /k "cd /d %~dp0houduan && npm run dev"

echo 等待后端服务启动...
timeout /t 3 /nobreak >nul

echo 启动前端服务...
start "前端服务" cmd /k "cd /d %~dp0qianduan && npm run dev"

echo 服务启动完成！
echo 请在浏览器中访问: http://localhost:8080
pause