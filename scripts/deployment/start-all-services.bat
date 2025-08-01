@echo off
echo ========================================
echo 启动租赁平台所有服务
echo ========================================

echo 1. 检查环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装
    pause
    exit /b 1
)

pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 安装PM2...
    npm install -g pm2
)

echo 2. 清理旧服务...
pm2 stop all 2>nul
pm2 delete all 2>nul

echo 3. 准备后端服务...
cd houduan
if not exist .env (
    echo 错误: 后端缺少.env配置文件
    pause
    exit /b 1
)

echo 安装后端依赖...
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败！
    pause
    exit /b 1
)

echo 启动后端服务...
pm2 start index.js --name rental-backend
if %errorlevel% neq 0 (
    echo 后端启动失败！
    pause
    exit /b 1
)

echo 4. 准备前端服务...
cd ../qianduan

echo 安装前端依赖...
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)

echo 构建前端...
call npm run build
if %errorlevel% neq 0 (
    echo 前端构建失败！
    pause
    exit /b 1
)

echo 启动前端服务...
pm2 serve dist 8080 --name rental-frontend --spa
if %errorlevel% neq 0 (
    echo 前端启动失败！
    pause
    exit /b 1
)

echo 4. 保存PM2配置...
pm2 save

echo 5. 显示服务状态...
pm2 status

echo ========================================
echo 所有服务启动完成！
echo ========================================
echo 前端访问: http://116.62.44.24:8080
echo 后端API: http://116.62.44.24:3000
echo ========================================
echo.
echo 常用管理命令:
echo pm2 status          - 查看服务状态
echo pm2 logs            - 查看所有日志
echo pm2 logs rental-backend  - 查看后端日志
echo pm2 logs rental-frontend - 查看前端日志
echo pm2 restart all     - 重启所有服务
echo pm2 stop all        - 停止所有服务
echo ========================================
pause