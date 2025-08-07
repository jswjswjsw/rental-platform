@echo off
chcp 65001 >nul 2>&1
echo ==========================================
echo Complete Deployment Flow: Windows Test to ECS
echo ==========================================

echo Current Directory: %CD%
echo Start Time: %date% %time%

REM Validate project structure
if not exist "houduan\package.json" (
    echo ERROR: Backend package.json not found. Are you in the project root?
    pause
    exit /b 1
)
if not exist "qianduan\package.json" (
    echo ERROR: Frontend package.json not found. Are you in the project root?
    pause
    exit /b 1
)

echo.
echo Phase 1: Windows Local Deployment
echo ==========================================

REM Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Node.js Version: 
node --version

REM Step 1: Configure local environment
echo.
echo Step 1: Configure Windows local environment...
cd houduan

REM Create local test configuration
echo # Windows Local Test Configuration > .env
echo DB_HOST=localhost >> .env
echo DB_PORT=3306 >> .env
echo DB_USER=root >> .env
set /p DB_PASSWORD="Enter MySQL root password (or press Enter for default '123456'): "
if "%DB_PASSWORD%"=="" set DB_PASSWORD=123456
echo DB_PASSWORD=%DB_PASSWORD% >> .env
echo DB_NAME=rental_platform_local >> .env
echo DB_SSL=false >> .env
echo. >> .env
echo # JWT Configuration >> .env
REM Generate random JWT secret
for /f %%i in ('powershell -command "[System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()" ^| powershell -command "$input -replace '-','' "') do set JWT_SECRET=%%i
echo JWT_SECRET=%JWT_SECRET% >> .env
echo JWT_EXPIRES_IN=7d >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=3000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # File Upload Configuration >> .env
echo UPLOAD_PATH=./uploads >> .env
echo MAX_FILE_SIZE=5242880 >> .env
echo. >> .env
echo # WeChat Pay Configuration (Development Mock) >> .env
echo WECHAT_APP_ID=demo_app_id >> .env
echo WECHAT_MCH_ID=demo_mch_id >> .env
echo WECHAT_API_KEY=demo_api_key >> .env
echo WECHAT_NOTIFY_URL=http://localhost:3000/api/payments/wechat/notify >> .env

if not exist ".env" (
    echo ERROR: Failed to create .env file
    pause
    exit /b 1
)
echo Local configuration created successfully

REM Step 2: Install dependencies
echo.
echo Step 2: Installing project dependencies...

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend dependencies installation failed
    pause
    exit /b 1
)
echo Backend dependencies installed successfully

echo Installing frontend dependencies...
cd ..\qianduan
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend dependencies installation failed
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully

cd ..

REM Step 3: Create startup scripts
echo.
echo Step 3: Creating service startup scripts...

REM Check for port conflicts
netstat -an | findstr ":3000 " >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Port 3000 is already in use
    echo Please stop the service using this port first
    pause
)

netstat -an | findstr ":8080 " >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Port 8080 is already in use
    echo Please stop the service using this port first
    pause
)

REM Backend startup script
echo @echo off > start-backend-local.bat
echo echo Starting Backend Service - Windows Local Test >> start-backend-local.bat
echo cd houduan >> start-backend-local.bat
echo echo Backend URL: http://localhost:3000 >> start-backend-local.bat
echo echo API Health Check: http://localhost:3000/api/health >> start-backend-local.bat
echo echo Payment function fixed with debug logs >> start-backend-local.bat
echo npm run dev >> start-backend-local.bat

REM Frontend startup script
echo @echo off > start-frontend-local.bat
echo echo Starting Frontend Service - Windows Local Test >> start-frontend-local.bat
echo cd qianduan >> start-frontend-local.bat
echo echo Frontend URL: http://localhost:8080 >> start-frontend-local.bat
echo echo Payment test page ready >> start-frontend-local.bat
echo npm run dev >> start-frontend-local.bat

REM All-in-one startup script
echo @echo off > start-all-local.bat
echo echo Starting All Services - Windows Local Test >> start-all-local.bat
echo echo Starting backend service... >> start-all-local.bat
echo start "Backend Service" cmd /k "start-backend-local.bat" >> start-all-local.bat
echo timeout /t 3 /nobreak ^> nul >> start-all-local.bat
echo echo Starting frontend service... >> start-all-local.bat
echo start "Frontend Service" cmd /k "start-frontend-local.bat" >> start-all-local.bat
echo echo Services started successfully! >> start-all-local.bat
echo echo Frontend: http://localhost:8080 >> start-all-local.bat
echo echo Backend: http://localhost:3000 >> start-all-local.bat
echo pause >> start-all-local.bat

echo Startup scripts created successfully

echo.
echo ==========================================
echo Windows Local Deployment Complete!
echo ==========================================
echo.
echo Next Steps:
echo.
echo 1. Start local services:
echo    Double-click start-all-local.bat
echo.
echo 2. Test payment function:
echo    - Visit http://localhost:8080
echo    - Login/register user
echo    - Create order and go to payment page
echo    - Open browser F12 developer tools
echo    - Click payment button and check Console logs
echo    - Should see: Payment button clicked
echo.
echo 3. If test successful, prepare ECS deployment:
echo    Run prepare-ecs-deployment.bat
echo.
echo Completion Time: %date% %time%
echo ==========================================

pause