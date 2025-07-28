@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo   闲置租赁平台 - 快速重启脚本
echo ==========================================
echo.

:: 重启PM2服务
echo [1/3] 重启PM2服务...
pm2 restart all
if errorlevel 1 (
    echo ❌ PM2重启失败，尝试重新启动...
    pm2 delete all >nul 2>&1
    pm2 start ecosystem.config.js
)
echo ✅ 服务重启完成

:: 等待服务启动
echo.
echo [2/3] 等待服务启动...
timeout /t 3 >nul

:: 显示服务状态
echo.
echo [3/3] 服务状态检查...
pm2 status

echo.
echo ==========================================
echo   重启完成！
echo ==========================================
echo.
echo 📍 访问地址: http://116.62.44.24:8080
echo 🔧 查看日志: pm2 logs
echo.
pause