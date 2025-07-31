@echo off
echo 开始部署前端...

echo 1. 进入前端目录
cd qianduan
if not exist package.json (
    echo 错误: 找不到package.json文件
    pause
    exit /b 1
)

echo 2. 安装依赖
call npm install
if %errorlevel% neq 0 (
    echo 错误: npm install 失败
    pause
    exit /b 1
)

echo 3. 构建生产版本
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 构建失败
    pause
    exit /b 1
)

echo 4. 验证构建结果
if not exist dist (
    echo 错误: dist目录不存在，构建可能失败
    pause
    exit /b 1
)

echo 5. 停止旧的前端服务（如果存在）
pm2 delete rental-frontend 2>nul

echo 6. 启动新的前端服务
set FRONTEND_PORT=8080
pm2 serve dist %FRONTEND_PORT% --name rental-frontend --spa
if %errorlevel% neq 0 (
    echo 错误: PM2服务启动失败
    pause
    exit /b 1
)

echo 7. 保存PM2配置
pm2 save

echo 8. 查看服务状态
pm2 status

echo.
echo 前端部署完成！
echo 访问地址: http://localhost:%FRONTEND_PORT%
echo 或者: http://116.62.44.24:%FRONTEND_PORT%
echo.
echo 提示: 确保后端服务正在运行在端口3000
echo 后端API地址: http://116.62.44.24:3000/api
echo.
pause