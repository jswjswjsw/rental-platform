@echo off
echo ========================================
echo ECS标准化部署脚本
echo ========================================

echo.
echo 此脚本将在ECS服务器上执行以下操作：
echo 1. 停止当前服务
echo 2. 备份现有项目
echo 3. 从GitHub拉取最新代码
echo 4. 安装依赖并配置环境
echo 5. 启动标准化服务
echo.

echo 请在ECS服务器上执行以下命令：
echo.
echo ========================================
echo # 1. 停止当前服务
echo pm2 stop all
echo.
echo # 2. 备份现有项目
echo cd C:\
echo if exist C:\projects\rental-platform move C:\projects\rental-platform C:\projects\rental-platform-backup-%date:~0,4%%date:~5,2%%date:~8,2%
echo.
echo # 3. 重新克隆项目 (请替换为实际的仓库地址)
echo mkdir C:\projects 2^>nul
echo cd C:\projects
echo git clone [YOUR_ACTUAL_REPO_URL] rental-platform
echo.
echo # 4. 进入项目并安装依赖
echo cd rental-platform
echo.
echo # 安装前端依赖
echo cd qianduan
echo npm install
echo.
echo # 安装后端依赖  
echo cd ..\houduan
echo npm install
echo.
echo # 配置环境变量 (确保.env.ecs文件存在)
echo if exist .env.ecs copy .env.ecs .env
echo if not exist .env echo 请手动创建.env文件并配置数据库连接
echo.
echo # 5. 启动后端服务
echo pm2 start app.js --name rental-backend
echo.
echo # 6. 构建并启动前端
echo cd ..\qianduan
echo npm run build
echo.
echo # 使用PM2启动前端服务 (推荐)
echo pm2 serve dist 8080 --name rental-frontend --spa
echo.
echo # 或者使用npx serve (不推荐用于生产)
echo # cd dist
echo # start /b npx serve . -p 8080
echo.
echo ========================================
echo.
echo 部署完成后检查：
echo 1. pm2 status - 检查服务状态
echo 2. pm2 logs - 查看日志
echo 3. 访问测试：
echo    - 前端: http://116.62.44.24:8080
echo    - API: http://116.62.44.24:3000/api/health
echo.
echo 故障排除：
echo - 如果端口被占用: netstat -ano ^| findstr :8080
echo - 检查防火墙设置
echo - 确认数据库连接配置正确
echo.
echo ========================================

pause