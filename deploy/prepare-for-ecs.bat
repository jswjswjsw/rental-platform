@echo off 
echo ========================================== 
echo 🚀 准备ECS部署 
echo ========================================== 
echo. 
echo 📋 ECS部署准备�?
echo. 
echo 1️⃣ 创建ECS配置文件 
echo 正在创建阿里云RDS配置... 
 
REM 创建ECS环境配置 
echo # 阿里云RDS配置 - ECS生产环境 > houduan\.env.ecs 
echo DB_HOST=rm-bp1sva9582w011209.mysql.rds.aliyuncs.com >> houduan\.env.ecs 
echo DB_PORT=3306 >> houduan\.env.ecs 
echo DB_USER=root >> houduan\.env.ecs 
echo DB_PASSWORD=Mysql_11010811 >> houduan\.env.ecs 
echo DB_NAME=rental_platform >> houduan\.env.ecs 
echo DB_SSL=false >> houduan\.env.ecs 
echo. >> houduan\.env.ecs 
echo # JWT配置 >> houduan\.env.ecs 
echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> houduan\.env.ecs 
echo JWT_EXPIRES_IN=7d >> houduan\.env.ecs 
echo. >> houduan\.env.ecs 
echo # 服务器配�?>> houduan\.env.ecs 
echo PORT=3000 >> houduan\.env.ecs 
echo NODE_ENV=production >> houduan\.env.ecs 
echo. >> houduan\.env.ecs 
echo # 文件上传配置 >> houduan\.env.ecs 
echo UPLOAD_PATH=./uploads >> houduan\.env.ecs 
echo MAX_FILE_SIZE=5242880 >> houduan\.env.ecs 
echo. >> houduan\.env.ecs 
echo # 微信支付配置 >> houduan\.env.ecs 
echo WECHAT_APP_ID=your_wechat_app_id >> houduan\.env.ecs 
echo WECHAT_MCH_ID=your_merchant_id >> houduan\.env.ecs 
echo WECHAT_API_KEY=your_api_key >> houduan\.env.ecs 
echo WECHAT_NOTIFY_URL=http://116.62.44.24:3000/api/payments/wechat/notify >> houduan\.env.ecs 
echo �?ECS配置文件创建完成 
echo. 
echo 2️⃣ 提交代码到Git 
echo 正在提交修复后的代码... 
git add . 
git commit -m "fix: Windows测试完成，支付功能修复验证成功，准备部署到ECS" 
git push origin main 
echo �?代码提交完成 
echo. 
echo 3️⃣ 创建ECS部署指令 
echo ========================================== 
echo 🚀 ECS部署指令 
echo ========================================== 
echo 请在ECS服务器上执行以下命令�?
echo. 
echo # 1. SSH连接到ECS 
echo ssh root@116.62.44.24 
echo. 
echo # 2. 进入项目目录 
echo cd /path/to/your/project 
echo. 
echo # 3. 拉取最新代�?
echo git pull origin main 
echo. 
echo # 4. 使用ECS配置 
echo cd houduan 
echo cp .env.ecs .env 
echo. 
echo # 5. 安装依赖 
echo npm install 
echo cd ../qianduan 
echo npm install 
echo npm run build 
echo. 
echo # 6. 重启服务 
echo cd .. 
echo pm2 restart rental-backend 
echo pm2 restart rental-frontend 
echo. 
echo # 7. 验证部署 
echo curl http://localhost:3000/api/health 
echo pm2 status 
echo. 
echo ========================================== 
echo 🎉 ECS部署完成后访�? http://116.62.44.24:8080 
echo ========================================== 
pause 
