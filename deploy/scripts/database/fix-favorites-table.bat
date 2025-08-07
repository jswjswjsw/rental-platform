@echo off
echo ========================================
echo 修复favorites表缺失问题
echo ========================================

echo 1. 检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js
    pause
    exit /b 1
)

echo 2. 进入数据库脚本目录...
cd /d "%~dp0"

echo 3. 执行favorites表创建脚本...
node create-favorites-table.js
if %errorlevel% neq 0 (
    echo 错误: 创建favorites表失败
    pause
    exit /b 1
)

echo 4. 重启后端服务...
cd ..\..\
pm2 restart rental-backend

echo 5. 查看服务状态...
pm2 status

echo 6. 检查后端日志...
pm2 logs rental-backend --lines 5

echo ========================================
echo favorites表修复完成！
echo ========================================
pause