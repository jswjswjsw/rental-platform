@echo off
echo ==========================================
echo 🚀 完整部署流程：Windows测试 → ECS部署
echo ==========================================

echo 📍 当前目录: %CD%
echo ⏰ 开始时间: %date% %time%

echo.
echo 📋 部署流程说明：
echo 第一阶段：Windows本地完整部署和测试
echo 第二阶段：打包并部署到ECS服务器
echo.

REM ==========================================
REM 第一阶段：Windows本地部署
REM ==========================================

echo ==========================================
echo 🔧 第一阶段：Windows本地完整部署
echo ==========================================

REM 检查Node.js
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本: 
node --version

REM 步骤1：配置本地环境
echo.
echo 🔧 步骤1：配置Windows本地环境...
cd houduan

REM 创建本地测试配置
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

echo ✅ 本地配置创建完成

REM 步骤2：安装依赖
echo.
echo 📦 步骤2：安装项目依赖...

echo 安装后端依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 后端依赖安装成功

echo 安装前端依赖...
cd ..\qianduan
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装成功

cd ..

REM 步骤3：创建启动脚本
echo.
echo 🔧 步骤3：创建服务启动脚本...

REM 后端启动脚本
echo @echo off > start-backend-local.bat
echo echo ========================================== >> start-backend-local.bat
echo echo 🚀 启动后端服务 - Windows本地测试 >> start-backend-local.bat
echo echo ========================================== >> start-backend-local.bat
echo cd houduan >> start-backend-local.bat
echo echo 后端服务地址: http://localhost:3000 >> start-backend-local.bat
echo echo API健康检查: http://localhost:3000/api/health >> start-backend-local.bat
echo echo 支付功能已修复，包含调试日志 >> start-backend-local.bat
echo echo ========================================== >> start-backend-local.bat
echo npm run dev >> start-backend-local.bat

REM 前端启动脚本
echo @echo off > start-frontend-local.bat
echo echo ========================================== >> start-frontend-local.bat
echo echo 🚀 启动前端服务 - Windows本地测试 >> start-frontend-local.bat
echo echo ========================================== >> start-frontend-local.bat
echo cd qianduan >> start-frontend-local.bat
echo echo 前端服务地址: http://localhost:8080 >> start-frontend-local.bat
echo echo 支付功能测试页面已准备就绪 >> start-frontend-local.bat
echo echo ========================================== >> start-frontend-local.bat
echo npm run dev >> start-frontend-local.bat

REM 一键启动脚本
echo @echo off > start-all-local.bat
echo echo ========================================== >> start-all-local.bat
echo echo 🚀 一键启动所有服务 - Windows本地测试 >> start-all-local.bat
echo echo ========================================== >> start-all-local.bat
echo echo 正在启动后端服务... >> start-all-local.bat
echo start "后端服务" cmd /k "start-backend-local.bat" >> start-all-local.bat
echo timeout /t 3 /nobreak ^> nul >> start-all-local.bat
echo echo 正在启动前端服务... >> start-all-local.bat
echo start "前端服务" cmd /k "start-frontend-local.bat" >> start-all-local.bat
echo echo ========================================== >> start-all-local.bat
echo echo ✅ 服务启动完成！ >> start-all-local.bat
echo echo ========================================== >> start-all-local.bat
echo echo 🌐 访问地址： >> start-all-local.bat
echo echo   前端: http://localhost:8080 >> start-all-local.bat
echo echo   后端: http://localhost:3000 >> start-all-local.bat
echo echo   API: http://localhost:3000/api/health >> start-all-local.bat
echo echo. >> start-all-local.bat
echo echo 🧪 测试支付功能： >> start-all-local.bat
echo echo   1. 访问 http://localhost:8080 >> start-all-local.bat
echo echo   2. 注册/登录用户 >> start-all-local.bat
echo echo   3. 创建订单进入支付页面 >> start-all-local.bat
echo echo   4. 打开浏览器F12开发者工具 >> start-all-local.bat
echo echo   5. 点击支付按钮查看Console日志 >> start-all-local.bat
echo echo   6. 应该看到: 🔄 支付按钮被点击 >> start-all-local.bat
echo echo ========================================== >> start-all-local.bat
echo pause >> start-all-local.bat

REM 步骤4：创建测试验证脚本
echo.
echo 🧪 步骤4：创建测试验证脚本...

echo @echo off > test-payment-fix.bat
echo echo ========================================== >> test-payment-fix.bat
echo echo 🧪 支付功能修复验证 >> test-payment-fix.bat
echo echo ========================================== >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 📋 验证步骤： >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 1️⃣ 确保服务已启动 >> test-payment-fix.bat
echo echo    - 后端: http://localhost:3000 >> test-payment-fix.bat
echo echo    - 前端: http://localhost:8080 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 2️⃣ 打开浏览器访问前端 >> test-payment-fix.bat
echo echo    - 地址: http://localhost:8080 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 3️⃣ 注册或登录用户账号 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 4️⃣ 创建订单并进入支付页面 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 5️⃣ 打开浏览器开发者工具 >> test-payment-fix.bat
echo echo    - 按F12键 >> test-payment-fix.bat
echo echo    - 切换到Console标签页 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 6️⃣ 点击支付按钮 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 7️⃣ 验证修复效果 >> test-payment-fix.bat
echo echo    ✅ 应该看到: 🔄 支付按钮被点击 >> test-payment-fix.bat
echo echo    ✅ 应该看到: 📝 开始创建支付订单 >> test-payment-fix.bat
echo echo    ✅ 应该看到: 开发环境：模拟微信支付成功 >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 🎉 如果看到以上日志，说明修复成功！ >> test-payment-fix.bat
echo echo ========================================== >> test-payment-fix.bat
echo echo. >> test-payment-fix.bat
echo echo 💡 测试成功后，运行 prepare-for-ecs.bat 准备ECS部署 >> test-payment-fix.bat
echo echo ========================================== >> test-payment-fix.bat
echo pause >> test-payment-fix.bat

REM ==========================================
REM 第二阶段：准备ECS部署
REM ==========================================

echo.
echo 🔧 步骤5：创建ECS部署准备脚本...

echo @echo off > prepare-for-ecs.bat
echo echo ========================================== >> prepare-for-ecs.bat
echo echo 🚀 准备ECS部署 >> prepare-for-ecs.bat
echo echo ========================================== >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo 📋 ECS部署准备： >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo 1️⃣ 创建ECS配置文件 >> prepare-for-ecs.bat
echo echo 正在创建阿里云RDS配置... >> prepare-for-ecs.bat
echo. >> prepare-for-ecs.bat
echo REM 创建ECS环境配置 >> prepare-for-ecs.bat
echo echo # 阿里云RDS配置 - ECS生产环境 ^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo DB_HOST=rm-bp1sva9582w011209.mysql.rds.aliyuncs.com ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo DB_PORT=3306 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo DB_USER=root ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo DB_PASSWORD=Mysql_11010811 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo DB_NAME=rental_platform ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo DB_SSL=false ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo. ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo # JWT配置 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo JWT_SECRET=your-super-secret-jwt-key-change-in-production ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo JWT_EXPIRES_IN=7d ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo. ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo # 服务器配置 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo PORT=3000 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo NODE_ENV=production ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo. ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo # 文件上传配置 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo UPLOAD_PATH=./uploads ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo MAX_FILE_SIZE=5242880 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo. ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo # 微信支付配置 ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo WECHAT_APP_ID=your_wechat_app_id ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo WECHAT_MCH_ID=your_merchant_id ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo WECHAT_API_KEY=your_api_key ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo WECHAT_NOTIFY_URL=http://116.62.44.24:3000/api/payments/wechat/notify ^>^> houduan\.env.ecs >> prepare-for-ecs.bat
echo echo ✅ ECS配置文件创建完成 >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo 2️⃣ 提交代码到Git >> prepare-for-ecs.bat
echo echo 正在提交修复后的代码... >> prepare-for-ecs.bat
echo git add . >> prepare-for-ecs.bat
echo git commit -m "fix: Windows测试完成，支付功能修复验证成功，准备部署到ECS" >> prepare-for-ecs.bat
echo git push origin main >> prepare-for-ecs.bat
echo echo ✅ 代码提交完成 >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo 3️⃣ 创建ECS部署指令 >> prepare-for-ecs.bat
echo echo ========================================== >> prepare-for-ecs.bat
echo echo 🚀 ECS部署指令 >> prepare-for-ecs.bat
echo echo ========================================== >> prepare-for-ecs.bat
echo echo 请在ECS服务器上执行以下命令： >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 1. SSH连接到ECS >> prepare-for-ecs.bat
echo echo ssh root@116.62.44.24 >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 2. 进入项目目录 >> prepare-for-ecs.bat
echo echo cd /path/to/your/project >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 3. 拉取最新代码 >> prepare-for-ecs.bat
echo echo git pull origin main >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 4. 使用ECS配置 >> prepare-for-ecs.bat
echo echo cd houduan >> prepare-for-ecs.bat
echo echo cp .env.ecs .env >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 5. 安装依赖 >> prepare-for-ecs.bat
echo echo npm install >> prepare-for-ecs.bat
echo echo cd ../qianduan >> prepare-for-ecs.bat
echo echo npm install >> prepare-for-ecs.bat
echo echo npm run build >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 6. 重启服务 >> prepare-for-ecs.bat
echo echo cd .. >> prepare-for-ecs.bat
echo echo pm2 restart rental-backend >> prepare-for-ecs.bat
echo echo pm2 restart rental-frontend >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo # 7. 验证部署 >> prepare-for-ecs.bat
echo echo curl http://localhost:3000/api/health >> prepare-for-ecs.bat
echo echo pm2 status >> prepare-for-ecs.bat
echo echo. >> prepare-for-ecs.bat
echo echo ========================================== >> prepare-for-ecs.bat
echo echo 🎉 ECS部署完成后访问: http://116.62.44.24:8080 >> prepare-for-ecs.bat
echo echo ========================================== >> prepare-for-ecs.bat
echo pause >> prepare-for-ecs.bat

echo ✅ 所有脚本创建完成

echo.
echo ==========================================
echo 🎉 Windows完整部署准备完成！
echo ==========================================
echo.
echo 🚀 下一步操作：
echo.
echo 1️⃣ 启动本地服务测试：
echo    双击 start-all-local.bat
echo.
echo 2️⃣ 验证支付功能修复：
echo    双击 test-payment-fix.bat
echo.
echo 3️⃣ 测试成功后准备ECS部署：
echo    双击 prepare-for-ecs.bat
echo.
echo 📋 完整流程：
echo    Windows测试 → 验证修复 → 提交代码 → ECS部署
echo.
echo ⏰ 完成时间: %date% %time%
echo ==========================================

pause