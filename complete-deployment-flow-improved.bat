@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo 🚀 完整部署流程：Windows测试 → ECS部署
echo ==========================================

echo 📍 当前目录: %CD%
echo ⏰ 开始时间: %date% %time%

REM 设置变量
set "LOCAL_DB_PASSWORD="
set "PRODUCTION_DB_PASSWORD="
set "PROJECT_PATH="

echo.
echo 📋 部署流程说明：
echo 第一阶段：Windows本地完整部署和测试
echo 第二阶段：打包并部署到ECS服务器
echo.

REM ==========================================
REM 环境检查
REM ==========================================

echo ==========================================
echo 🔍 环境检查
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

REM 检查项目结构
if not exist "houduan" (
    echo ❌ 错误：houduan目录不存在
    pause
    exit /b 1
)

if not exist "qianduan" (
    echo ❌ 错误：qianduan目录不存在
    pause
    exit /b 1
)

REM 检查端口占用
echo.
echo 🔍 检查端口占用...
netstat -an | findstr ":3000 " >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  警告：端口3000已被占用，可能需要停止现有服务
)

netstat -an | findstr ":8080 " >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  警告：端口8080已被占用，可能需要停止现有服务
)

REM ==========================================
REM 第一阶段：Windows本地部署
REM ==========================================

echo.
echo ==========================================
echo 🔧 第一阶段：Windows本地完整部署
echo ==========================================

REM 获取数据库密码
echo.
echo 🔐 请输入本地MySQL数据库密码（用于测试）:
set /p LOCAL_DB_PASSWORD="密码: "
if "!LOCAL_DB_PASSWORD!"=="" (
    echo ❌ 数据库密码不能为空
    pause
    exit /b 1
)

REM 步骤1：配置本地环境
echo.
echo 🔧 步骤1：配置Windows本地环境...
cd houduan

REM 备份现有配置
if exist ".env" (
    copy .env .env.backup.%date:~0,4%%date:~5,2%%date:~8,2% >nul
    echo ✅ 已备份现有配置
)

REM 创建本地测试配置
call :create_local_env "!LOCAL_DB_PASSWORD!"

echo ✅ 本地配置创建完成

REM 步骤2：安装依赖
echo.
echo 📦 步骤2：安装项目依赖...

echo 安装后端依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端依赖安装失败
    call :cleanup_and_exit
)
echo ✅ 后端依赖安装成功

echo 安装前端依赖...
cd ..\qianduan
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    call :cleanup_and_exit
)
echo ✅ 前端依赖安装成功

cd ..

REM 步骤3：创建启动脚本
echo.
echo 🔧 步骤3：创建服务启动脚本...
call :create_startup_scripts

REM 步骤4：创建测试脚本
echo.
echo 🧪 步骤4：创建测试验证脚本...
call :create_test_scripts

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
goto :eof

REM ==========================================
REM 函数定义
REM ==========================================

:create_local_env
set "db_password=%~1"
(
echo # Windows本地测试配置
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_USER=root
echo DB_PASSWORD=%db_password%
echo DB_NAME=rental_platform_local
echo DB_SSL=false
echo.
echo # JWT配置
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
echo JWT_EXPIRES_IN=7d
echo.
echo # 服务器配置
echo PORT=3000
echo NODE_ENV=development
echo.
echo # 文件上传配置
echo UPLOAD_PATH=./uploads
echo MAX_FILE_SIZE=5242880
echo.
echo # 微信支付配置（开发环境模拟）
echo WECHAT_APP_ID=demo_app_id
echo WECHAT_MCH_ID=demo_mch_id
echo WECHAT_API_KEY=demo_api_key
echo WECHAT_NOTIFY_URL=http://localhost:3000/api/payments/wechat/notify
) > .env
goto :eof

:create_startup_scripts
REM 创建后端启动脚本
(
echo @echo off
echo echo ==========================================
echo echo 🚀 启动后端服务 - Windows本地测试
echo echo ==========================================
echo cd houduan
echo echo 后端服务地址: http://localhost:3000
echo echo API健康检查: http://localhost:3000/api/health
echo echo 支付功能已修复，包含调试日志
echo echo ==========================================
echo npm run dev
) > start-backend-local.bat

REM 创建前端启动脚本
(
echo @echo off
echo echo ==========================================
echo echo 🚀 启动前端服务 - Windows本地测试
echo echo ==========================================
echo cd qianduan
echo echo 前端服务地址: http://localhost:8080
echo echo 支付功能测试页面已准备就绪
echo echo ==========================================
echo npm run dev
) > start-frontend-local.bat

REM 创建一键启动脚本
(
echo @echo off
echo echo ==========================================
echo echo 🚀 一键启动所有服务 - Windows本地测试
echo echo ==========================================
echo echo 正在启动后端服务...
echo start "后端服务" cmd /k "start-backend-local.bat"
echo timeout /t 3 /nobreak ^> nul
echo echo 正在启动前端服务...
echo start "前端服务" cmd /k "start-frontend-local.bat"
echo echo ==========================================
echo echo ✅ 服务启动完成！
echo echo ==========================================
echo echo 🌐 访问地址：
echo echo   前端: http://localhost:8080
echo echo   后端: http://localhost:3000
echo echo   API: http://localhost:3000/api/health
echo echo.
echo echo 🧪 测试支付功能：
echo echo   1. 访问 http://localhost:8080
echo echo   2. 注册/登录用户
echo echo   3. 创建订单进入支付页面
echo echo   4. 打开浏览器F12开发者工具
echo echo   5. 点击支付按钮查看Console日志
echo echo   6. 应该看到: 🔄 支付按钮被点击
echo echo ==========================================
echo pause
) > start-all-local.bat

echo ✅ 启动脚本创建完成
goto :eof

:create_test_scripts
(
echo @echo off
echo echo ==========================================
echo echo 🧪 支付功能修复验证
echo echo ==========================================
echo echo.
echo echo 📋 验证步骤：
echo echo.
echo echo 1️⃣ 确保服务已启动
echo echo    - 后端: http://localhost:3000
echo echo    - 前端: http://localhost:8080
echo echo.
echo echo 2️⃣ 打开浏览器访问前端
echo echo    - 地址: http://localhost:8080
echo echo.
echo echo 3️⃣ 注册或登录用户账号
echo echo.
echo echo 4️⃣ 创建订单并进入支付页面
echo echo.
echo echo 5️⃣ 打开浏览器开发者工具
echo echo    - 按F12键
echo echo    - 切换到Console标签页
echo echo.
echo echo 6️⃣ 点击支付按钮
echo echo.
echo echo 7️⃣ 验证修复效果
echo echo    ✅ 应该看到: 🔄 支付按钮被点击
echo echo    ✅ 应该看到: 📝 开始创建支付订单
echo echo    ✅ 应该看到: 开发环境：模拟微信支付成功
echo echo.
echo echo 🎉 如果看到以上日志，说明修复成功！
echo echo ==========================================
echo echo.
echo echo 💡 测试成功后，运行 prepare-for-ecs.bat 准备ECS部署
echo echo ==========================================
echo pause
) > test-payment-fix.bat

echo ✅ 测试脚本创建完成
goto :eof

:cleanup_and_exit
echo.
echo 🧹 清理临时文件...
if exist "houduan\.env.backup.*" (
    echo 恢复配置文件...
    cd houduan
    for %%f in (.env.backup.*) do (
        copy "%%f" .env >nul
        break
    )
    cd ..
)
echo ❌ 部署失败，已清理临时文件
pause
exit /b 1

endlocal