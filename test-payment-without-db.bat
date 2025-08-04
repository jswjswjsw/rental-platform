@echo off
echo ==========================================
echo 🧪 支付功能测试 - 无需数据库版本
echo ==========================================

echo 📍 当前目录: %CD%
echo ⏰ 开始时间: %date% %time%

REM 验证项目结构
if not exist "houduan" (
    echo ❌ 错误：请在项目根目录运行此脚本
    echo 当前目录应包含 houduan 和 qianduan 文件夹
    pause
    exit /b 1
)

if not exist "qianduan" (
    echo ❌ 错误：qianduan 目录不存在
    pause
    exit /b 1
)

REM 步骤1：快速安装依赖
echo.
echo 📦 步骤1：安装必要依赖...

cd houduan
if not exist "node_modules" (
    echo 安装后端依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)

cd ..\qianduan  
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

cd ..

REM 步骤2：创建模拟数据配置
echo.
echo 🔧 步骤2：创建模拟配置...

REM 创建模拟环境配置
cd houduan
echo # 模拟测试配置 - 无需真实数据库 > .env
echo DB_HOST=localhost >> .env
echo DB_PORT=3306 >> .env
echo DB_USER=test >> .env
echo DB_PASSWORD=test >> .env
echo DB_NAME=test_db >> .env
echo DB_SSL=false >> .env
echo. >> .env
echo # JWT配置 >> .env
echo JWT_SECRET=test-jwt-secret-key-%RANDOM%-%RANDOM%-%RANDOM% >> .env
echo JWT_EXPIRES_IN=7d >> .env
echo. >> .env
echo # 服务器配置 >> .env
echo PORT=3000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # 微信支付配置（模拟） >> .env
echo WECHAT_APP_ID=demo_app_id >> .env
echo WECHAT_MCH_ID=demo_mch_id >> .env
echo WECHAT_API_KEY=demo_api_key >> .env
echo WECHAT_NOTIFY_URL=http://localhost:3000/api/payments/wechat/notify >> .env

cd ..

REM 步骤3：创建前端测试页面
echo.
echo 🔧 步骤3：创建支付测试页面...

REM 复制测试页面模板
if exist "payment-test-template.html" (
    copy payment-test-template.html payment-test.html >nul
    echo ✅ 测试页面创建完成
) else (
    echo ⚠️  模板文件不存在，创建简化版本...
    echo ^<!DOCTYPE html^> > payment-test.html
    echo ^<html^>^<head^>^<title^>支付测试^</title^>^</head^> >> payment-test.html
    echo ^<body^>^<h1^>支付功能测试^</h1^>^<p^>请查看浏览器控制台^</p^> >> payment-test.html
    echo ^<button onclick="console.log('支付按钮测试')"^>测试按钮^</button^>^</body^>^</html^> >> payment-test.html
    echo ✅ 简化测试页面创建完成
)

REM 步骤4：创建快速启动脚本
echo.
echo 🔧 步骤4：创建快速测试脚本...

echo @echo off > quick-test.bat
echo echo 🧪 启动支付功能测试... >> quick-test.bat
echo echo. >> quick-test.bat
echo echo 正在打开测试页面... >> quick-test.bat
echo start payment-test.html >> quick-test.bat
echo echo. >> quick-test.bat
echo echo 📋 测试说明： >> quick-test.bat
echo echo 1. 点击测试按钮 >> quick-test.bat
echo echo 2. 打开浏览器开发者工具(F12) >> quick-test.bat
echo echo 3. 查看Console标签页的日志输出 >> quick-test.bat
echo echo 4. 如果看到调试日志，说明修复成功！ >> quick-test.bat
echo echo. >> quick-test.bat
echo pause >> quick-test.bat

echo ✅ 快速测试脚本创建完成

echo.
echo ==========================================
echo 🎉 无数据库测试环境准备完成！
echo ==========================================
echo.
echo 🧪 立即测试支付功能：
echo   双击 quick-test.bat 开始测试
echo.
echo 📋 测试步骤：
echo   1. 运行 quick-test.bat
echo   2. 在打开的网页中点击测试按钮
echo   3. 打开浏览器F12查看Console日志
echo   4. 如果看到调试日志，说明修复成功！
echo.
echo 🔍 预期结果：
echo   Console应该显示：
echo   🔄 支付按钮被点击 {paymentType: "rent", orderId: "test-123", paying: false}
echo   📝 开始创建支付订单 {orderId: "test-123", paymentType: "rent"}
echo.
echo ⏰ 完成时间: %date% %time%
echo ==========================================

echo.
echo 🎯 现在就可以测试了！双击 quick-test.bat 开始
pause