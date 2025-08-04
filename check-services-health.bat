@echo off
echo ==========================================
echo 检查服务健康状态
echo ==========================================

echo.
echo 🔍 检查后端服务 (端口 3000)...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务正常运行
) else (
    echo ❌ 后端服务未响应
    echo    请检查后端服务是否正常启动
)

echo.
echo 🔍 检查前端服务 (端口 8080)...
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 前端服务正常运行
) else (
    echo ❌ 前端服务未响应
    echo    请检查前端服务是否正常启动
)

echo.
echo 🔍 检查端口占用情况...
netstat -an | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 端口 3000 已被占用 (后端服务)
) else (
    echo ❌ 端口 3000 未被占用
)

netstat -an | findstr ":8080 " >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 端口 8080 已被占用 (前端服务)
) else (
    echo ❌ 端口 8080 未被占用
)

echo.
echo ==========================================
echo 健康检查完成
echo ==========================================
pause