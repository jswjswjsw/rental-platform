@echo off
echo ========================================
echo ECS服务诊断和修复脚本
echo ========================================

echo.
echo 第1步：检查当前服务状态
echo ----------------------------------------
echo 检查PM2服务...
pm2 status

echo.
echo 检查端口监听...
netstat -an | findstr ":80\|:3000\|:8080"

echo.
echo 检查进程状态...
echo Nginx进程:
tasklist | findstr nginx
echo Node进程:
tasklist | findstr node

echo.
echo 第2步：测试API连接
echo ----------------------------------------
echo 测试后端API...
curl http://localhost:3000/api/health

echo.
echo 测试Nginx代理...
curl http://localhost/api/health

echo.
echo 第3步：检查防火墙状态
echo ----------------------------------------
netsh advfirewall show allprofiles state

echo.
echo 第4步：检查文件是否存在
echo ----------------------------------------
echo 检查前端dist目录...
set PROJECT_PATH=%~dp0
if exist "%PROJECT_PATH%qianduan\dist" (
    dir "%PROJECT_PATH%qianduan\dist"
) else (
    echo ❌ dist目录不存在: %PROJECT_PATH%qianduan\dist
)

echo.
echo 检查测试页面...
if exist "%PROJECT_PATH%test-api.html" (
    echo ✅ 测试页面存在
) else (
    echo ❌ 测试页面不存在: %PROJECT_PATH%test-api.html
)

echo.
echo 第5步：自动修复服务
echo ----------------------------------------
echo 停止所有相关进程...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im nginx.exe >nul 2>&1

echo.
echo 重新启动后端服务...
cd "%PROJECT_PATH%houduan"
pm2 delete all >nul 2>&1
pm2 start app.js --name rental-platform

echo.
echo 等待3秒...
timeout /t 3 /nobreak >nul

echo.
echo 重新启动Nginx...
cd C:\nginx\nginx-1.24.0
start /b nginx.exe

echo.
echo 等待2秒...
timeout /t 2 /nobreak >nul

echo.
echo 重新启动前端服务...
cd C:\Users\Administrator\rental-platform\qianduan\dist
echo 复制测试页面...
copy ..\..\test-api.html . >nul 2>&1

echo.
echo 启动http-server...
echo 注意：http-server将在后台启动，请在新窗口中检查
start "Frontend Server" cmd /c "http-server . -p 8080 -a 0.0.0.0 --cors"

echo.
echo 第6步：验证修复结果
echo ----------------------------------------
echo 等待5秒让服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 检查服务状态...
pm2 status
tasklist | findstr nginx
netstat -an | findstr ":8080"

echo.
echo 测试本地连接...
curl http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 前端服务正常
) else (
    echo ❌ 前端服务异常
)

curl http://localhost:3000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 后端API正常
) else (
    echo ❌ 后端API异常
)

echo.
echo 第7步：访问测试
echo ----------------------------------------
echo 请在浏览器中测试以下地址：
echo.
echo 1. 前端页面：http://116.62.44.24:8080
echo 2. API测试页面：http://116.62.44.24:8080/test-api.html
echo 3. 后端API：http://116.62.44.24:3000/api/health
echo 4. Nginx代理：http://116.62.44.24
echo.
echo ========================================
echo 诊断和修复完成！
echo ========================================
echo.
echo 如果仍有问题，请检查：
echo 1. 阿里云安全组是否开放8080端口
echo 2. ECS实例是否有公网IP
echo 3. 网络连接是否正常
echo.
pause