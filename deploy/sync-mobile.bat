@echo off
echo ========================================
echo 快速同步移动端代码
echo ========================================

cd qianduan

echo.
echo 1. 构建前端项目...
call npm run build

echo.
echo 2. 同步到移动端...
call npx cap sync

echo.
echo ========================================
echo 同步完成！可以在Android Studio中运行应用
echo ========================================
pause