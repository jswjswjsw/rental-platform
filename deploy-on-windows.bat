@echo off
echo ==========================================
echo 🚀 Windows环境部署脚本 - 支付功能修复
echo ==========================================

echo 📍 当前目录: %CD%
echo ⏰ 开始时间: %date% %time%

REM 检查当前目录
if not exist "package.json" (
    if not exist "houduan" (
        if not exist "qianduan" (
            echo ❌ 错误：请在项目根目录运行此脚本
            pause
            exit /b 1
        )
    )
)

REM 步骤1：恢复阿里云RDS配置
echo.
echo 🔧 步骤1：恢复数据库配置...
cd houduan

if exist ".env.backup" (
    copy .env.backup .env >nul
    echo ✅ 已恢复阿里云RDS配置
) else (
    echo ⚠️  .env.backup不存在，手动创建.env配置...
    echo # 数据库配置 - 阿里云RDS > .env
    echo DB_HOST=rm-bp1sva9582w011209.mysql.rds.aliyuncs.com >> .env
    echo DB_PORT=3306 >> .env
    echo DB_USER=root >> .env
    echo DB_PASSWORD=Mysql_11010811 >> .env
    echo DB_NAME=rental_platform >> .env
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
    echo # 微信支付配置 >> .env
    echo WECHAT_APP_ID=your_wechat_app_id >> .env
    echo WECHAT_MCH_ID=your_merchant_id >> .env
    echo WECHAT_API_KEY=your_api_key >> .env
    echo WECHAT_NOTIFY_URL=http://116.62.44.24:3000/api/payments/wechat/notify >> .env
    echo ✅ 已创建.env配置文件
)

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

REM 步骤4：构建前端
echo.
echo 🏗️  步骤4：构建前端项目...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo ✅ 前端构建成功
) else (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

cd ..

echo.
echo ==========================================
echo 🎉 本地部署完成！
echo ==========================================
echo 🌐 现在可以启动服务：
echo.
echo 启动后端服务：
echo   cd houduan
echo   npm run dev
echo.
echo 启动前端服务：
echo   cd qianduan  
echo   npm run dev
echo.
echo 或者使用一键启动：
echo   start-all-services.bat
echo.
echo 🧪 测试支付功能：
echo   1. 访问 http://localhost:8080
echo   2. 登录用户账号
echo   3. 创建订单进入支付页面
echo   4. 打开浏览器开发者工具(F12)
echo   5. 点击支付按钮查看Console日志
echo   6. 应该看到: 🔄 支付按钮被点击
echo.
echo ⏰ 完成时间: %date% %time%
echo ==========================================

pause