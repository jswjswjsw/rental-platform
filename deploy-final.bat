@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo   闲置租赁平台 - 完整部署脚本 v2.0
echo ==========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if errorlevel 1 (
    echo ⚠️  建议以管理员身份运行此脚本以获得最佳效果
    echo.
)

:: 检查当前目录
echo [1/10] 检查部署环境...
if not exist "qianduan" (
    echo ❌ 错误: 请在项目根目录运行此脚本
    echo 当前目录: %CD%
    echo 请确保在包含qianduan和houduan文件夹的目录中运行
    pause
    exit /b 1
)
if not exist "houduan" (
    echo ❌ 错误: 未找到houduan目录
    pause
    exit /b 1
)
echo ✅ 项目目录结构确认

:: 停止现有服务
echo.
echo [2/10] 停止现有服务...
pm2 delete all >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul
echo ✅ 现有服务已停止

:: 创建必要目录
echo.
echo [3/10] 创建必要目录...
if not exist logs mkdir logs
if not exist houduan\uploads mkdir houduan\uploads
echo ✅ 目录创建完成

:: 检查Node.js和npm
echo.
echo [4/10] 检查运行环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js
    pause
    exit /b 1
)
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到npm
    pause
    exit /b 1
)
echo ✅ Node.js和npm环境正常

:: 安装根目录依赖
echo.
echo [5/10] 安装根目录依赖...
npm install express http-proxy-middleware
if errorlevel 1 (
    echo ❌ 根目录依赖安装失败
    pause
    exit /b 1
)
echo ✅ 根目录依赖安装完成

:: 安装后端依赖
echo.
echo [6/10] 安装后端依赖...
cd houduan
npm install
if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 后端依赖安装完成
cd ..

:: 安装前端依赖并构建
echo.
echo [7/10] 构建前端项目...
cd qianduan
if not exist node_modules (
    echo 📦 安装前端依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo 🔨 构建前端项目...
npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
cd ..

:: 配置防火墙
echo.
echo [8/10] 配置Windows防火墙...
netsh advfirewall firewall delete rule name="Rental Platform 8080" >nul 2>&1
netsh advfirewall firewall delete rule name="Rental Platform 3000" >nul 2>&1
netsh advfirewall firewall add rule name="Rental Platform 8080" dir=in action=allow protocol=TCP localport=8080 >nul 2>&1
netsh advfirewall firewall add rule name="Rental Platform 3000" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
echo ✅ 防火墙配置完成

:: 启动PM2服务
echo.
echo [9/10] 启动PM2服务...
pm2 start ecosystem.config.js
if errorlevel 1 (
    echo ❌ PM2服务启动失败
    echo 正在查看错误日志...
    pm2 logs --lines 10
    pause
    exit /b 1
)
echo ✅ PM2服务启动成功

:: 保存PM2配置并设置开机自启
echo.
echo [10/10] 完成部署配置...
pm2 save >nul 2>&1
echo ✅ PM2配置已保存

:: 等待服务完全启动
echo.
echo ⏳ 等待服务完全启动...
timeout /t 5 >nul

:: 显示部署结果
echo.
echo ==========================================
echo   🎉 部署完成！
echo ==========================================
echo.
pm2 status
echo.
echo 📍 访问地址:
echo   • 前端应用: http://116.62.44.24:8080
echo   • 后端API:  http://116.62.44.24:3000/api/health
echo   • 本地测试: http://localhost:8080
echo.
echo 🔧 常用管理命令:
echo   pm2 status           - 查看服务状态
echo   pm2 logs             - 查看所有日志
echo   pm2 logs rental-frontend - 查看前端日志
echo   pm2 logs rental-backend  - 查看后端日志
echo   pm2 restart all      - 重启所有服务
echo   pm2 monit            - 实时监控面板
echo   pm2 stop all         - 停止所有服务
echo.
echo 📋 部署检查清单:
echo   ✅ Windows防火墙已配置
echo   ⚠️  请确保阿里云安全组已开放8080和3000端口
echo   ⚠️  请确保数据库连接配置正确
echo.
echo 🔍 如果遇到问题:
echo   1. 运行 pm2 logs 查看详细日志
echo   2. 检查 houduan\.env 数据库配置
echo   3. 确认阿里云安全组规则
echo.
pause