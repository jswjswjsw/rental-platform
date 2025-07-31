@echo off
echo ========================================
echo 闲置租赁平台 - 前端部署脚本
echo ========================================

echo 1. 检查Node.js环境
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 2. 检查PM2
pm2 --version
if %errorlevel% neq 0 (
    echo 安装PM2...
    npm install -g pm2
)

echo 3. 进入前端目录
cd qianduan
if %errorlevel% neq 0 (
    echo 错误: 未找到前端目录
    pause
    exit /b 1
)

echo 4. 清理旧的构建文件
if exist dist rmdir /s /q dist

echo 5. 安装/更新依赖
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 6. 构建生产版本
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 构建失败
    pause
    exit /b 1
)

echo 7. 检查构建结果
if not exist dist (
    echo 错误: 构建文件夹不存在
    pause
    exit /b 1
)

echo 8. 停止旧的前端服务
pm2 delete rental-frontend 2>nul

echo 9. 启动前端服务
pm2 serve dist 8080 --name rental-frontend --spa
if %errorlevel% neq 0 (
    echo 错误: 前端服务启动失败
    pause
    exit /b 1
)

echo 10. 保存PM2配置
pm2 save

echo 11. 设置PM2开机自启
pm2 startup

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo 前端访问地址:
echo - 本地: http://localhost:8080
echo - 外网: http://116.62.44.24:8080
echo.
echo 服务管理命令:
echo - 查看状态: pm2 status
echo - 查看日志: pm2 logs rental-frontend
echo - 重启服务: pm2 restart rental-frontend
echo - 停止服务: pm2 stop rental-frontend
echo ========================================

pm2 status
pause