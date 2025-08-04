@echo off
echo ==========================================
echo 启动闲置资源租赁平台 - 前后端服务
echo ==========================================

echo.
echo 🔍 检查系统环境...

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查npm是否可用
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 不可用，请检查 Node.js 安装
    pause
    exit /b 1
)

REM 检查后端目录
if not exist "houduan" (
    echo ❌ 后端目录 houduan 不存在
    pause
    exit /b 1
)

REM 检查前端目录
if not exist "qianduan" (
    echo ❌ 前端目录 qianduan 不存在
    pause
    exit /b 1
)

REM 检查后端package.json
if not exist "houduan\package.json" (
    echo ❌ 后端 package.json 不存在
    pause
    exit /b 1
)

REM 检查前端package.json
if not exist "qianduan\package.json" (
    echo ❌ 前端 package.json 不存在
    pause
    exit /b 1
)

REM 检查环境配置文件
if not exist "houduan\.env" (
    echo ⚠️  警告: 后端 .env 文件不存在，可能导致数据库连接失败
    echo    请确保已配置数据库连接信息
    timeout /t 3 /nobreak > nul
)

echo ✅ 环境检查通过

echo.
echo 🚀 正在启动后端服务...
echo    端口: 3000
echo    目录: houduan
echo    命令: npm run dev
start "后端服务 - 闲置租赁平台" cmd /k "cd /d houduan && npm run dev"

echo.
echo ⏳ 等待后端服务启动...
timeout /t 8 /nobreak > nul

echo.
echo 🌐 正在启动前端服务...
echo    端口: 8080
echo    目录: qianduan
echo    命令: npm run dev
start "前端服务 - 闲置租赁平台" cmd /k "cd /d qianduan && npm run dev"

echo.
echo ⏳ 等待前端服务启动...
timeout /t 5 /nobreak > nul

echo.
echo ==========================================
echo 🎉 服务启动完成！
echo ==========================================
echo 📱 前端访问地址: http://localhost:8080
echo 🔧 后端API地址: http://localhost:3000/api
echo 🏥 健康检查: http://localhost:3000/api/health
echo ==========================================
echo.
echo 💡 使用说明:
echo    1. 请等待服务完全启动后再访问前端地址
echo    2. 如需停止服务，请关闭对应的命令行窗口
echo    3. 如果端口被占用，请先停止占用端口的程序
echo    4. 数据库连接问题请检查 houduan\.env 配置
echo.
echo 🔧 故障排除:
echo    - 如果后端启动失败，请检查数据库连接
echo    - 如果前端启动失败，请运行: cd qianduan ^&^& npm install
echo    - 如果端口冲突，请修改配置文件中的端口设置
echo.
pause