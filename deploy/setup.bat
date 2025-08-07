@echo off
echo 启动闲置资源租赁平台
echo =======================

echo 正在安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败
    pause
    exit /b 1
)

echo 正在初始化数据库...
call npm run init
if %errorlevel% neq 0 (
    echo 数据库初始化失败，请检查MySQL配置
    pause
    exit /b 1
)

echo 正在安装前端依赖...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败
    pause
    exit /b 1
)

echo 所有依赖安装完成！
echo 现在可以运行以下命令启动服务：
echo 1. 启动后端：cd backend && npm run dev
echo 2. 启动前端：cd frontend && npm run dev
echo.
echo 或者运行 start-all.bat 一键启动所有服务
pause
