@echo off
echo ==========================================
echo 停止闲置资源租赁平台服务
echo ==========================================

echo.
echo 🛑 正在停止所有Node.js进程...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js 进程已停止
) else (
    echo ℹ️  没有运行中的 Node.js 进程
)

echo.
echo 🛑 正在停止所有nodemon进程...
taskkill /f /im nodemon.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ nodemon 进程已停止
) else (
    echo ℹ️  没有运行中的 nodemon 进程
)

echo.
echo 🔍 检查端口占用情况...
netstat -an | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  端口 3000 仍被占用
    echo    可能需要手动停止相关进程
) else (
    echo ✅ 端口 3000 已释放
)

netstat -an | findstr ":8080 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  端口 8080 仍被占用
    echo    可能需要手动停止相关进程
) else (
    echo ✅ 端口 8080 已释放
)

echo.
echo ==========================================
echo 服务停止完成
echo ==========================================
pause