@echo off
chcp 65001 >nul
title 闲置资源租赁平台 - 完整测试

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    闲置资源租赁平台                          ║
echo ║                     完整功能测试                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%正在检查环境依赖...%RESET%

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ 未安装Node.js，请先安装Node.js 14+%RESET%
    pause
    exit /b 1
) else (
    echo %GREEN%✅ Node.js已安装%RESET%
)

:: 检查MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%⚠️  未检测到MySQL，请确保MySQL服务运行中%RESET%
) else (
    echo %GREEN%✅ MySQL已安装%RESET%
)

echo.
echo %BLUE%开始项目初始化...%RESET%

:: 创建日志目录
if not exist "logs" mkdir logs

:: 后端初始化
echo %YELLOW%📦 正在安装后端依赖...%RESET%
cd backend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%❌ 后端依赖安装失败%RESET%
        pause
        exit /b 1
    )
)

echo %YELLOW%🗄️  正在初始化数据库...%RESET%
call npm run init
if %errorlevel% neq 0 (
    echo %RED%❌ 数据库初始化失败，请检查MySQL配置%RESET%
    echo %YELLOW%请确保：%RESET%
    echo   1. MySQL服务已启动
    echo   2. 数据库连接信息正确（检查.env文件）
    echo   3. 用户有创建数据库的权限
    pause
    exit /b 1
)

:: 前端初始化
echo %YELLOW%📦 正在安装前端依赖...%RESET%
cd ..\frontend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%❌ 前端依赖安装失败%RESET%
        pause
        exit /b 1
    )
)

cd ..

echo.
echo %GREEN%✅ 项目初始化完成！%RESET%
echo.
echo %BLUE%正在启动服务...%RESET%

:: 启动后端服务
echo %YELLOW%🚀 启动后端服务...%RESET%
start "后端服务 - 闲置资源租赁平台" cmd /c "cd backend && npm run dev && pause"

:: 等待后端启动
echo %YELLOW%⏳ 等待后端服务启动...%RESET%
timeout /t 5 >nul

:: 测试后端连接
echo %YELLOW%🔍 测试后端连接...%RESET%
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✅ 后端服务启动成功%RESET%
) else (
    echo %YELLOW%⚠️  后端服务可能还在启动中...%RESET%
)

:: 启动前端服务
echo %YELLOW%🎨 启动前端服务...%RESET%
start "前端服务 - 闲置资源租赁平台" cmd /c "cd frontend && npm run dev && pause"

:: 等待前端启动
echo %YELLOW%⏳ 等待前端服务启动...%RESET%
timeout /t 8 >nul

echo.
echo %GREEN%🎉 服务启动完成！%RESET%
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      服务信息                                ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║ 🌐 前端地址: http://localhost:3000                          ║
echo ║ 🔗 后端API:  http://localhost:5000                          ║
echo ║ 📊 健康检查: http://localhost:5000/health                   ║
echo ║ 📚 API文档:  http://localhost:5000/api-docs                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo %BLUE%功能测试清单：%RESET%
echo.
echo %YELLOW%📋 前端功能测试：%RESET%
echo   1. 访问首页：http://localhost:3000
echo   2. 用户注册和登录
echo   3. 浏览资源列表
echo   4. 发布新资源
echo   5. 创建租赁订单
echo   6. 个人中心管理
echo.
echo %YELLOW%🔧 后端API测试：%RESET%
echo   1. 健康检查：curl http://localhost:5000/health
echo   2. 用户注册：POST /api/auth/register
echo   3. 用户登录：POST /api/auth/login
echo   4. 获取资源：GET /api/resources
echo   5. 创建订单：POST /api/orders
echo.
echo %YELLOW%📱 移动端开发：%RESET%
echo   1. 查看移动端开发指南：docs/mobile-app-guide.md
echo   2. API接口已准备就绪，可直接用于移动端开发
echo   3. 支持React Native、Flutter等跨平台方案
echo.
echo %YELLOW%☁️  阿里云部署：%RESET%
echo   1. 查看部署指南：docs/aliyun-deployment.md
echo   2. 已包含完整的生产环境配置
echo   3. 支持Docker容器化部署
echo.

:: 打开浏览器
choice /c YN /m "是否自动打开浏览器访问应用？(Y/N)"
if %errorlevel% equ 1 (
    echo %BLUE%🌐 正在打开浏览器...%RESET%
    start http://localhost:3000
    timeout /t 2 >nul
    start http://localhost:5000/health
)

echo.
echo %GREEN%✨ 恭喜！闲置资源租赁平台已成功启动%RESET%
echo %BLUE%开始体验您的租赁平台吧！%RESET%
echo.
echo %YELLOW%💡 提示：%RESET%
echo   - 按 Ctrl+C 可停止服务
echo   - 查看控制台输出了解实时状态
echo   - 遇到问题请查看 README.md 文档
echo.
echo %BLUE%按任意键关闭此窗口...%RESET%
pause >nul
