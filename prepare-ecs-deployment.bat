@echo off
echo ==========================================
echo 🚀 准备ECS部署
echo ==========================================

REM 获取生产环境配置
echo.
echo 🔐 请输入生产环境数据库密码:
set /p PROD_DB_PASSWORD="密码: "
if "%PROD_DB_PASSWORD%"=="" (
    echo ❌ 数据库密码不能为空
    pause
    exit /b 1
)

echo.
echo 📝 请输入ECS服务器项目路径:
set /p PROJECT_PATH="路径 (例如: /root/rental-platform): "
if "%PROJECT_PATH%"=="" (
    set "PROJECT_PATH=/root/rental-platform"
    echo 使用默认路径: %PROJECT_PATH%
)

REM 创建ECS环境配置
echo.
echo 🔧 创建ECS环境配置...
cd houduan

(
echo # 阿里云RDS配置 - ECS生产环境
echo DB_HOST=rm-bp1sva9582w011209.mysql.rds.aliyuncs.com
echo DB_PORT=3306
echo DB_USER=root
echo DB_PASSWORD=%PROD_DB_PASSWORD%
echo DB_NAME=rental_platform
echo DB_SSL=false
echo.
echo # JWT配置
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
echo JWT_EXPIRES_IN=7d
echo.
echo # 服务器配置
echo PORT=3000
echo NODE_ENV=production
echo.
echo # 文件上传配置
echo UPLOAD_PATH=./uploads
echo MAX_FILE_SIZE=5242880
echo.
echo # 微信支付配置
echo WECHAT_APP_ID=your_wechat_app_id
echo WECHAT_MCH_ID=your_merchant_id
echo WECHAT_API_KEY=your_api_key
echo WECHAT_NOTIFY_URL=http://116.62.44.24:3000/api/payments/wechat/notify
) > .env.ecs

echo ✅ ECS配置文件创建完成

cd ..

REM 创建ECS部署脚本
echo.
echo 📜 创建ECS部署脚本...
(
echo #!/bin/bash
echo echo "🚀 开始ECS部署..."
echo.
echo # 进入项目目录
echo cd %PROJECT_PATH%
echo.
echo # 拉取最新代码
echo echo "📥 拉取最新代码..."
echo git pull origin main
echo.
echo # 使用ECS配置
echo echo "🔧 配置生产环境..."
echo cd houduan
echo cp .env.ecs .env
echo.
echo # 安装依赖
echo echo "📦 安装依赖..."
echo npm install
echo cd ../qianduan
echo npm install
echo npm run build
echo.
echo # 重启服务
echo echo "🔄 重启服务..."
echo cd ..
echo pm2 restart rental-backend ^|^| pm2 start houduan/index.js --name rental-backend
echo pm2 restart rental-frontend ^|^| pm2 start "serve -s qianduan/dist -l 8080" --name rental-frontend
echo.
echo # 验证部署
echo echo "🧪 验证部署..."
echo sleep 5
echo curl http://localhost:3000/api/health
echo pm2 status
echo.
echo echo "🎉 ECS部署完成！访问: http://116.62.44.24:8080"
) > deploy-to-ecs.sh

echo ✅ ECS部署脚本创建完成

echo.
echo ==========================================
echo 📋 ECS部署指令
echo ==========================================
echo.
echo 1. 将 deploy-to-ecs.sh 上传到ECS服务器
echo 2. SSH连接到ECS: ssh root@116.62.44.24
echo 3. 执行部署脚本: chmod +x deploy-to-ecs.sh ^&^& ./deploy-to-ecs.sh
echo.
echo 或者手动执行以下命令：
echo.
echo cd %PROJECT_PATH%
echo git pull origin main