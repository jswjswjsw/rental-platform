@echo off 
echo ========================================== 
echo 🚀 一键启动所有服�?- Windows本地测试 
echo ========================================== 
echo 正在启动后端服务... 
start "后端服务" cmd /k "start-backend-local.bat" 
timeout /t 3 /nobreak > nul 
echo 正在启动前端服务... 
start "前端服务" cmd /k "start-frontend-local.bat" 
echo ========================================== 
echo �?服务启动完成�?
echo ========================================== 
echo 🌐 访问地址�?
echo   前端: http://localhost:8080 
echo   后端: http://localhost:3000 
echo   API: http://localhost:3000/api/health 
echo. 
echo 🧪 测试支付功能�?
echo   1. 访问 http://localhost:8080 
echo   2. 注册/登录用户 
echo   3. 创建订单进入支付页面 
echo   4. 打开浏览器F12开发者工�?
echo   5. 点击支付按钮查看Console日志 
echo   6. 应该看到: 🔄 支付按钮被点�?
echo ========================================== 
pause 
