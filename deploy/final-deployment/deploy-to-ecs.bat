@echo off
REM 加载配置文件
if exist "config.bat" (
    call config.bat
) else (
    echo ⚠️ 配置文件不存在，使用默认配置
    set ECS_IP=116.62.44.24
    set ECS_USER=root
    set WEB_PATH=/var/www/html
    set API_PATH=/var/www/html/api
)

echo ========================================
echo 部署租赁平台到阿里云ECS
echo 目标服务器: %ECS_USER%@%ECS_IP%
echo ========================================

echo.
echo 包含功能：
echo ✅ 完整的Web应用 (Vue 3 + Node.js)
echo ✅ 响应式移动端设计
echo ✅ Android App支持
echo ✅ 完整的后端API
echo ✅ MySQL数据库支持

echo.
echo 第1步：检查部署文件是否存在...
echo ----------------------------------------
if not exist "web" (
    echo ❌ 错误: web目录不存在，请先运行构建脚本
    goto :error
)
if not exist "api" (
    echo ❌ 错误: api目录不存在，请检查项目结构
    goto :error
)
echo ✅ 部署文件检查通过

echo.
echo 第2步：上传Web前端文件...
echo ----------------------------------------
scp -r web/* %ECS_USER%@%ECS_IP%:%WEB_PATH%/
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Web文件上传失败
    goto :error
)
echo ✅ Web文件上传成功

echo.
echo 第3步：上传后端API文件...
echo ----------------------------------------
scp -r api/* %ECS_USER%@%ECS_IP%:%API_PATH%/
if %ERRORLEVEL% NEQ 0 (
    echo ❌ API文件上传失败
    goto :error
)
echo ✅ API文件上传成功

echo.
echo 第4步：在ECS上安装依赖并启动服务...
echo ----------------------------------------
ssh %ECS_USER%@%ECS_IP% "cd %API_PATH% && npm install && pm2 stop rental-platform; pm2 start app.js --name rental-platform"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 服务启动可能有问题，请手动检查
) else (
    echo ✅ 服务启动成功
)

echo.
echo ========================================
echo 🎉 部署完成！
echo.
echo 🌐 访问地址：
echo   网页版: http://%ECS_IP%
echo   API接口: http://%ECS_IP%/api
echo   移动端测试: http://%ECS_IP%/mobile-test
echo.
echo 📱 移动端功能：
echo   - 响应式设计，手机浏览器完美适配
echo   - 支持Android App开发
echo   - 原生功能：相机、GPS、设备信息等
echo.
echo 🔧 如需生成APK：
echo   1. 安装Android Studio
echo   2. 打开项目：coreproject\Front\qianduan\android
echo   3. 生成APK文件
echo   4. 上传到服务器供用户下载
echo ========================================
goto :end

:error
echo.
echo ========================================
echo ❌ 部署失败！请检查网络连接和服务器配置
echo ========================================
pause
exit /b 1

:end
pause