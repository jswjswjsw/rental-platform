@echo off
REM 部署配置文件 - 用户可以修改这些值

REM ECS服务器配置
set ECS_IP=116.62.44.24
set ECS_USER=root
set ECS_PORT=22

REM 部署路径配置
set WEB_PATH=/var/www/html
set API_PATH=/var/www/html/api

REM 应用配置
set APP_NAME=rental-platform
set NODE_ENV=production

REM 数据库配置（如果需要）
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=rental_platform

echo 配置已加载：
echo   服务器: %ECS_USER%@%ECS_IP%:%ECS_PORT%
echo   Web路径: %WEB_PATH%
echo   API路径: %API_PATH%
echo   应用名称: %APP_NAME%