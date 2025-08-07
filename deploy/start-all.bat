@echo off
title 闲置资源租赁平台

echo 启动闲置资源租赁平台
echo =======================

echo 启动后端服务...
start "后端服务" cmd /k "cd backend && npm run dev"

echo 等待后端服务启动...
timeout /t 3 >nul

echo 启动前端服务...
start "前端服务" cmd /k "cd frontend && npm run dev"

echo 服务启动完成！
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:5000
echo 按任意键关闭此窗口...
pause >nul
