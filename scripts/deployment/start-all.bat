::
:: 闲置资源租赁平台一键启动脚本
:: 
:: 功能说明：
:: - 自动检查Node.js运行环境
:: - 自动安装前后端项目依赖
:: - 同时启动前端和后端服务
:: - 提供服务状态和访问地址信息
:: 
:: 使用方法：
:: 1. 双击运行此脚本文件
:: 2. 或在命令行中执行：start-all.bat
:: 
:: 服务地址：
:: - 前端应用：http://localhost:8080
:: - 后端API：http://localhost:3000
:: - API文档：http://localhost:3000/api/health
:: 
:: 注意事项：
:: - 确保已安装Node.js (版本 >= 14.0.0)
:: - 确保已配置MySQL数据库
:: - 确保后端.env文件配置正确
:: - 首次运行会自动安装依赖包
:: 
:: @author 开发团队
:: @version 1.0.0
:: @since 2024-01-01
::

@echo off
:: 设置控制台编码为UTF-8
chcp 65001 >nul

echo.
echo ==========================================
echo   闲置资源租赁平台 - 一键启动脚本
echo ==========================================
echo.

:: ==================== 环境检查 ====================

echo [1/5] 检查Node.js运行环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js运行环境
    echo.
    echo 请先安装Node.js (推荐版本 >= 16.0.0):
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js环境检查通过: %NODE_VERSION%
)

echo.

:: ==================== 后端服务启动 ====================

echo [2/5] 准备启动后端服务...
cd /d "%~dp0houduan"

:: 检查并安装后端依赖
if not exist node_modules (
    echo 📦 正在安装后端依赖包...
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 后端依赖安装完成
) else (
    echo ✅ 后端依赖已存在
)

:: 检查环境配置文件
if not exist .env (
    echo ⚠️  警告: 未找到.env配置文件
    echo 请确保已正确配置数据库连接信息
    echo.
)

:: 启动后端服务
echo 🚀 启动后端服务...
start "闲置租赁平台-后端服务" cmd /k "echo 后端服务启动中... && npm run dev"

echo.

:: ==================== 前端服务启动 ====================

echo [3/5] 准备启动前端服务...
cd /d "%~dp0qianduan"

:: 检查并安装前端依赖
if not exist node_modules (
    echo 📦 正在安装前端依赖包...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 前端依赖安装完成
) else (
    echo ✅ 前端依赖已存在
)

:: 启动前端服务
echo 🚀 启动前端服务...
start "闲置租赁平台-前端服务" cmd /k "echo 前端服务启动中... && npm run dev"

echo.

:: ==================== 启动完成信息 ====================

echo [4/5] 服务启动完成！
echo.
echo 📍 服务访问地址：
echo   ┌─ 前端应用: http://localhost:8080
echo   ├─ 后端API:  http://localhost:3000/api
echo   └─ 健康检查: http://localhost:3000/api/health
echo.
echo 📋 使用说明：
echo   • 前端服务通常需要1-2分钟完全启动
echo   • 后端服务启动后会自动连接数据库
echo   • 如遇问题请检查控制台错误信息
echo   • 按Ctrl+C可停止对应服务
echo.

echo [5/5] 等待服务完全启动...
echo 正在等待服务启动完成，请稍候...
timeout /t 3 >nul

echo.
echo ✅ 启动脚本执行完成！
echo 请查看新打开的窗口了解服务状态
echo.
echo 按任意键关闭此窗口...
pause >nul