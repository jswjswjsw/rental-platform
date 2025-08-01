@echo off
echo ========================================
echo 重启租赁平台服务
echo ========================================

echo 1. 清理端口占用...
pm2 stop all 2>nul
pm2 delete all 2>nul

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 2^>nul') do taskkill /PID %%a /F 2>nul

echo 2. 启动后端服务...
cd houduan
pm2 start index.js --name rental-backend
if %errorlevel% neq 0 (
    echo 后端启动失败！
    pause
    exit /b 1
)

echo 3. 启动前端服务...
cd ../qianduan
pm2 serve dist 8080 --name rental-frontend --spa
if %errorlevel% neq 0 (
    echo 前端启动失败！
    pause
    exit /b 1
)

echo 4. 保存PM2配置...
pm2 save

echo 5. 服务状态...
pm2 status

echo ========================================
echo 服务重启完成！
echo 前端: http://116.62.44.24:8080
echo 后端: http://116.62.44.24:3000
echo ========================================
pause