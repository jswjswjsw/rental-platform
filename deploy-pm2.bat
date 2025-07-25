@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo   使用PM2部署租赁平台 (Windows)
echo ==========================================
echo.

:: 检查PM2是否安装
echo [1/6] 检查PM2安装状态...
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo 📦 安装PM2...
    npm install -g pm2
    if errorlevel 1 (
        echo ❌ PM2安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ PM2已安装
)

:: 停止现有服务
echo.
echo [2/6] 停止现有服务...
pm2 delete all >nul 2>&1
echo ✅ 现有服务已停止

:: 创建日志目录
echo.
echo [3/6] 创建日志目录...
if not exist logs mkdir logs
echo ✅ 日志目录已创建

:: 构建前端
echo.
echo [4/6] 构建前端项目...
cd qianduan
npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
cd ..

:: 启动PM2服务
echo.
echo [5/6] 启动PM2服务...
pm2 start ecosystem.config.js
if errorlevel 1 (
    echo ❌ PM2服务启动失败
    pause
    exit /b 1
)
echo ✅ PM2服务启动成功

:: 保存PM2配置
echo.
echo [6/6] 保存PM2配置...
pm2 save
echo ✅ PM2配置已保存

:: 显示服务状态
echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo.
pm2 status
echo.
echo 📍 访问地址: http://localhost:8080
echo 📍 ECS访问: http://你的ECS公网IP:8080
echo.
echo 🔧 常用命令:
echo   pm2 status     - 查看服务状态
echo   pm2 logs       - 查看日志
echo   pm2 restart all - 重启所有服务
echo   pm2 monit      - 实时监控
echo.
pause