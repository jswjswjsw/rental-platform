@echo off
chcp 65001 >nul
echo ========================================
echo ECS Service Fix Script
echo ========================================

echo.
echo Step 1: Check current status
echo ----------------------------------------
echo Checking PM2 services...
pm2 status

echo.
echo Checking ports...
netstat -an | findstr ":80\|:3000\|:8080"

echo.
echo Checking processes...
echo Nginx processes:
tasklist | findstr nginx
echo Node processes:
tasklist | findstr node

echo.
echo Step 2: Test API connections
echo ----------------------------------------
echo Testing backend API...
curl http://localhost:3000/api/health

echo.
echo Testing nginx proxy...
curl http://localhost/api/health

echo.
echo Step 3: Stop all services
echo ----------------------------------------
echo Stopping all node processes...
taskkill /f /im node.exe >nul 2>&1

echo Stopping nginx processes...
taskkill /f /im nginx.exe >nul 2>&1

echo.
echo Step 4: Restart backend service
echo ----------------------------------------
set PROJECT_PATH=%~dp0
if not exist "%PROJECT_PATH%houduan" (
    echo [ERROR] Backend directory not found: %PROJECT_PATH%houduan
    pause
    exit /b 1
)
cd "%PROJECT_PATH%houduan"
pm2 delete all >nul 2>&1
pm2 start app.js --name rental-platform

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Step 5: Start nginx
echo ----------------------------------------
if exist "C:\nginx\nginx-1.24.0" (
    cd C:\nginx\nginx-1.24.0
    start /b nginx.exe
) else (
    echo [WARNING] Nginx not found at C:\nginx\nginx-1.24.0
    echo Please check nginx installation path
)

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Step 6: Prepare frontend
echo ----------------------------------------
if not exist "%PROJECT_PATH%qianduan\dist" (
    echo [ERROR] Frontend dist directory not found: %PROJECT_PATH%qianduan\dist
    echo Please run 'npm run build' in qianduan directory first
    pause
    exit /b 1
)
cd "%PROJECT_PATH%qianduan\dist"

echo Copying test page...
if exist "..\..\test-api.html" (
    copy ..\..\test-api.html . >nul 2>&1
) else (
    echo [WARNING] test-api.html not found, skipping copy
)

echo.
echo Step 7: Start frontend server
echo ----------------------------------------
echo Starting http-server in background...
start "Frontend" cmd /c "http-server . -p 8080 -a 0.0.0.0 --cors"

echo Waiting 5 seconds for services to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 8: Verify services
echo ----------------------------------------
echo Checking PM2 status...
pm2 status

echo.
echo Checking nginx processes...
tasklist | findstr nginx

echo.
echo Checking port 8080...
netstat -an | findstr ":8080"

echo.
echo Testing local connections...
curl http://localhost:8080 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend service is running
) else (
    echo [ERROR] Frontend service failed
)

curl http://localhost:3000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend API is running
) else (
    echo [ERROR] Backend API failed
)

echo.
echo Step 9: Test URLs
echo ----------------------------------------
echo Please test these URLs in your browser:
echo.
echo 1. Frontend: http://116.62.44.24:8080
echo 2. API Test: http://116.62.44.24:8080/test-api.html
echo 3. Backend:  http://116.62.44.24:3000/api/health
echo 4. Nginx:    http://116.62.44.24
echo.
echo ========================================
echo Service fix completed!
echo ========================================
echo.
echo If still not working, check:
echo 1. Aliyun security group for port 8080
echo 2. ECS public IP configuration
echo 3. Network connectivity
echo.
pause