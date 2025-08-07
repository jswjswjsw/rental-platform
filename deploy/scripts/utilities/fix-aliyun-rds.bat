@echo off
echo ========================================
echo 阿里云RDS连接问题修复脚本
echo ========================================
echo.

echo 1. 运行RDS连接诊断...
node aliyun-rds-check.js

echo.
echo 2. 重启后端服务...
pm2 restart rental-backend --update-env

echo.
echo 3. 查看服务状态...
pm2 status

echo.
echo 4. 查看最新日志...
pm2 logs rental-backend --lines 10

echo.
echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 如果仍有问题，请检查：
echo 1. 阿里云RDS白名单设置
echo 2. ECS安全组配置
echo 3. RDS实例状态
echo ========================================

pause