@echo off
echo ========================================
echo 闲置租赁平台 - 全服务部署脚本
echo ========================================

echo 1. 部署后端服务
echo 进入后端目录...
cd houduan

echo 安装后端依赖...
call npm install

echo 停止旧的后端服务...
pm2 delete rental-backend 2>nul

echo 启动后端服务...
pm2 start index.js --name rental-backend
if %errorlevel% neq 0 (
    echo 错误: 后端服务启动失败
    pause
    exit /b 1
)

echo 2. 部署前端服务
echo 返回根目录...
cd ..

echo 进入前端目录...
cd qianduan

echo 安装前端依赖...
call npm install

echo 构建前端...
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 前端构建失败
    pause
    exit /b 1
)

echo 停止旧的前端服务...
pm2 delete rental-frontend 2>nul

echo 启动前端服务...
pm2 serve dist 8080 --name rental-frontend --spa
if %errorlevel% neq 0 (
    echo 错误: 前端服务启动失败
    pause
    exit /b 1
)

echo 3. 保存PM2配置
pm2 save

echo 4. 设置开机自启
pm2 startup

echo.
echo ========================================
echo 全部署完成！
echo ========================================
echo 服务状态:
pm2 status

echo.
echo 访问地址:
echo - 前端: http://116.62.44.24:8080
echo - 后端API: http://116.62.44.24:3000
echo - 健康检查: http://116.62.44.24:3000/api/health
echo ========================================
pause