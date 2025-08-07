@echo off
echo ========================================
echo ECS标准化部署脚本 (正确路径版本)
echo ========================================

echo.
echo 当前ECS项目路径: C:\Users\Administrator\rental-platform
echo.
echo 此脚本将执行以下操作：
echo 1. 停止当前服务
echo 2. 备份现有项目
echo 3. 从GitHub拉取最新代码
echo 4. 安装依赖
echo 5. 启动标准化服务
echo.

echo 请在ECS服务器上执行以下命令：
echo.
echo ========================================
echo # 1. 停止当前服务
echo pm2 stop all
echo.
echo # 2. 备份现有项目
echo cd C:\Users\Administrator
echo move rental-platform rental-platform-backup-20250807
echo.
echo # 3. 重新克隆项目 (请替换为实际仓库地址)
echo git clone [YOUR_ACTUAL_REPO_URL] rental-platform
echo.
echo # 4. 进入项目目录
echo cd rental-platform
echo.
echo # 5. 安装前端依赖
echo cd qianduan
echo npm install
echo.
echo # 6. 安装后端依赖  
echo cd ..\houduan
echo npm install
echo.
echo # 7. 配置环境变量
echo if exist .env.ecs copy .env.ecs .env
echo if not exist .env echo 请手动创建.env文件并配置数据库连接
echo.
echo # 8. 启动后端服务
echo pm2 start app.js --name rental-backend
echo.
echo # 9. 构建前端
echo cd ..\qianduan
echo npm run build
echo.
echo # 10. 启动前端服务 (使用PM2)
echo pm2 serve dist 8080 --name rental-frontend --spa
echo.
echo ========================================
echo.
echo 执行完成后，访问：
echo - 前端: http://116.62.44.24:8080
echo - API: http://116.62.44.24:3000
echo.
echo 部署验证步骤：
echo 1. pm2 status - 检查服务状态
echo 2. pm2 logs - 查看日志
echo 3. 确保MySQL服务运行
echo 4. 检查.env文件配置正确
echo.
echo 新的ECS项目结构：
echo C:\Users\Administrator\rental-platform\
echo ├── qianduan/          # 前端Vue项目
echo ├── houduan/           # 后端Express项目  
echo ├── shujuku/           # 数据库脚本
echo ├── deploy/            # 部署脚本
echo └── README.md
echo.
echo ========================================

pause