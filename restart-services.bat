@echo off
echo 正在重启租赁平台服务...

echo 停止现有服务...
taskkill /f /im node.exe 2>nul

echo 等待服务完全停止...
timeout /t 3 /nobreak >nul

echo 启动后端服务...
cd houduan
start "后端服务" cmd /k "npm start"

echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo 启动前端服务...
cd ../qianduan
start "前端服务" cmd /k "npm run dev"

echo 服务重启完成！
echo 前端地址: http://localhost:8080
echo 后端地址: http://localhost:3000
echo 健康检查: http://localhost:3000/api/health

pause