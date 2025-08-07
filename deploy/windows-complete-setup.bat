@echo off
echo ==========================================
echo 🚀 Windows完整部署 - 支付功能修复测试
echo ==========================================

echo 📍 当前目录: %CD%
echo ⏰ 开始时间: %date% %time%

REM 检查Node.js是否安装
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本: 
node --version

REM 步骤1：恢复本地数据库配置（用于Windows测试）
echo.
echo 🔧 步骤1：配置本地数据库...
cd houduan

REM 创建Windows本地测试配置
echo # Windows本地测试配置 > .env
echo DB_HOST=localhost >> .env
echo DB_PORT=3306 >> .env
echo DB_USER=root >> .env
echo DB_PASSWORD=123456 >> .env
echo DB_NAME=rental_platform_local >> .env
echo DB_SSL=false >> .env
echo. >> .env
echo # JWT配置 >> .env
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> .env
echo JWT_EXPIRES_IN=7d >> .env
echo. >> .env
echo # 服务器配置 >> .env
echo PORT=3000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # 文件上传配置 >> .env
echo UPLOAD_PATH=./uploads >> .env
echo MAX_FILE_SIZE=5242880 >> .env
echo. >> .env
echo # 微信支付配置（开发环境模拟） >> .env
echo WECHAT_APP_ID=demo_app_id >> .env
echo WECHAT_MCH_ID=demo_mch_id >> .env
echo WECHAT_API_KEY=demo_api_key >> .env
echo WECHAT_NOTIFY_URL=http://localhost:3000/api/payments/wechat/notify >> .env

echo ✅ 已创建Windows本地测试配置

REM 步骤2：安装后端依赖
echo.
echo 📦 步骤2：安装后端依赖...
call npm install
if %ERRORLEVEL% EQU 0 (
    echo ✅ 后端依赖安装成功
) else (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

REM 步骤3：安装前端依赖
echo.
echo 📦 步骤3：安装前端依赖...
cd ..\qianduan
call npm install
if %ERRORLEVEL% EQU 0 (
    echo ✅ 前端依赖安装成功
) else (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

cd ..

REM 步骤4：创建启动脚本
echo.
echo 🔧 步骤4：创建服务启动脚本...

REM 创建后端启动脚本
echo @echo off > start-backend.bat
echo echo 启动后端服务... >> start-backend.bat
echo cd houduan >> start-backend.bat
echo echo 后端服务地址: http://localhost:3000 >> start-backend.bat
echo echo API健康检查: http://localhost:3000/api/health >> start-backend.bat
echo npm run dev >> start-backend.bat

REM 创建前端启动脚本
echo @echo off > start-frontend.bat
echo echo 启动前端服务... >> start-frontend.bat
echo cd qianduan >> start-frontend.bat
echo echo 前端服务地址: http://localhost:8080 >> start-frontend.bat
echo npm run dev >> start-frontend.bat

REM 创建测试脚本
echo @echo off > test-payment.bat
echo echo ==========================================  >> test-payment.bat
echo echo 🧪 支付功能测试指南 >> test-payment.bat
echo echo ==========================================  >> test-payment.bat
echo echo. >> test-payment.bat
echo echo 📋 测试步骤： >> test-payment.bat
echo echo 1. 确保前后端服务都已启动 >> test-payment.bat
echo echo 2. 打开浏览器访问: http://localhost:8080 >> test-payment.bat
echo echo 3. 注册或登录用户账号 >> test-payment.bat
echo echo 4. 创建订单并进入支付页面 >> test-payment.bat
echo echo 5. 打开浏览器开发者工具(F12) >> test-payment.bat
echo echo 6. 点击支付按钮 >> test-payment.bat
echo echo 7. 查看Console应该显示: 🔄 支付按钮被点击 >> test-payment.bat
echo echo. >> test-payment.bat
echo echo 🔍 如果看到调试日志，说明修复成功！ >> test-payment.bat
echo echo. >> test-payment.bat
echo echo 💡 开发环境会模拟支付成功，无需真实支付 >> test-payment.bat
echo echo ==========================================  >> test-payment.bat
echo pause >> test-payment.bat

echo ✅ 启动脚本创建完成

echo.
echo ==========================================
echo 🎉 Windows部署完成！
echo ==========================================
echo.
echo 🚀 启动服务：
echo   1. 双击 start-backend.bat 启动后端
echo   2. 双击 start-frontend.bat 启动前端
echo   3. 或者运行 start-all-services.bat 一键启动
echo.
echo 🧪 测试支付功能：
echo   1. 双击 test-payment.bat 查看测试指南
echo   2. 或直接访问 http://localhost:8080
echo.
echo 🌐 服务地址：
echo   前端: http://localhost:8080
echo   后端: http://localhost:3000
echo   API: http://localhost:3000/api/health
echo.
echo 🔧 支付功能修复内容：
echo   ✅ 修复环境变量使用错误
echo   ✅ 添加详细调试日志  
echo   ✅ 开发环境模拟支付成功
echo.
echo ⏰ 完成时间: %date% %time%
echo ==========================================

echo.
echo 🎯 下一步操作：
echo 1. 启动服务（双击start-backend.bat和start-frontend.bat）
echo 2. 测试支付功能
echo 3. 如果测试成功，再部署到ECS服务器

pause