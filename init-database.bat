@echo off
echo 初始化数据库脚本
echo ==================

echo 请确保MySQL服务已启动...
echo.

echo 正在初始化数据库...
mysql -u root -p < shujuku\init.sql

if %errorlevel% equ 0 (
    echo ✅ 数据库初始化成功！
) else (
    echo ❌ 数据库初始化失败，请检查：
    echo 1. MySQL服务是否启动
    echo 2. 用户名密码是否正确
    echo 3. 是否有创建数据库的权限
)

echo.
pause