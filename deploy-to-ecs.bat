@echo off
echo ========================================
echo 阿里云ECS部署脚本
echo ========================================
echo 目标RDS: rm-bp1f62b28m6dxaqhf1219
echo ========================================
echo.

echo 1. 运行RDS连接诊断...
node aliyun-rds-check.js

echo.
echo 2. 停止现有服务...
pm2 stop rental-backend

echo.
echo 3. 更新环境变量并重启服务...
pm2 start houduan/index.js --name rental-backend --update-env

echo.
echo 4. 查看服务状态...
pm2 status

echo.
echo 5. 查看最新日志...
pm2 logs rental-backend --lines 15

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 如果仍有连接问题，请检查：
echo 1. 阿里云RDS白名单是否包含ECS IP: 172.18.152.12
echo 2. ECS安全组是否允许出站3306端口
echo 3. RDS实例状态是否正常
echo 4. 数据库用户权限是否正确
echo ========================================

pause