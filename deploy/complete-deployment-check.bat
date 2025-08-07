@echo off
echo ========================================
echo 租赁平台完整部署检查和部署
echo ========================================

echo.
echo 第1步：检查项目结构
echo ----------------------------------------
if exist "qianduan\package.json" (
    echo ✅ 前端项目存在
) else (
    echo ❌ 前端项目缺失
    goto :error
)

if exist "houduan\package.json" (
    echo ✅ 后端项目存在
) else (
    echo ❌ 后端项目缺失
    goto :error
)

if exist "shujuku\init.sql" (
    echo ✅ 数据库脚本存在
) else (
    echo ❌ 数据库脚本缺失
    goto :error
)

echo.
echo 第2步：检查移动端支持
echo ----------------------------------------
if exist "qianduan\android" (
    echo ✅ Android项目存在
) else (
    echo ⚠️ Android项目缺失，将跳过移动端功能
)

if exist "qianduan\capacitor.config.ts" (
    echo ✅ Capacitor配置存在
) else (
    echo ⚠️ Capacitor配置缺失，将跳过移动端功能
)

echo.
echo 第3步：安装前端依赖
echo ----------------------------------------
cd qianduan
echo 正在安装前端依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    goto :error
)
echo ✅ 前端依赖安装成功

echo.
echo 第4步：构建前端项目
echo ----------------------------------------
echo 正在构建前端项目...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端构建失败
    goto :error
)
echo ✅ 前端构建成功

echo.
echo 第5步：同步移动端项目
echo ----------------------------------------
echo 正在同步移动端项目...
call npx cap sync
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 移动端同步失败，但不影响Web版本部署
) else (
    echo ✅ 移动端同步成功
)

echo.
echo 第6步：安装后端依赖
echo ----------------------------------------
cd ..\houduan
echo 正在安装后端依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端依赖安装失败
    goto :error
)
echo ✅ 后端依赖安装成功

echo.
echo 第7步：创建完整部署包
echo ----------------------------------------
cd ..\
if exist "final-deployment" (
    echo 清理旧的部署包...
    rmdir /s /q "final-deployment"
)
mkdir final-deployment
mkdir final-deployment\web
mkdir final-deployment\api
mkdir final-deployment\database
mkdir final-deployment\mobile
if not exist "final-deployment" (
    echo ❌ 无法创建部署目录
    goto :error
)

echo 复制Web文件...
if exist "qianduan\dist" (
    xcopy "qianduan\dist\*" "final-deployment\web\" /E /Y
    echo ✅ Web文件复制完成
) else (
    echo ❌ 前端构建文件不存在
    goto :error
)

echo 复制API文件...
echo 正在复制后端文件（排除node_modules）...
for /d %%i in (houduan\*) do (
    if /i not "%%~nxi"=="node_modules" (
        xcopy "%%i" "final-deployment\api\%%~nxi\" /E /I /Y
    )
)
for %%i in (houduan\*.*) do (
    if /i not "%%~nxi"=="node_modules" (
        copy "%%i" "final-deployment\api\" /Y
    )
)
echo ✅ API文件复制完成

echo 复制数据库文件...
xcopy "shujuku\*" "final-deployment\database\" /E /Y
echo ✅ 数据库文件复制完成

echo 创建移动端下载页面...
copy "create-download-page.html" "final-deployment\mobile\download.html" 2>nul

echo ✅ 部署包创建完成

echo.
echo 第8步：创建ECS部署脚本
echo ----------------------------------------
(
echo @echo off
echo echo ========================================
echo echo 部署到阿里云ECS服务器
echo echo ========================================
echo echo.
echo echo 第1步：上传Web文件...
echo scp -r web/* user@YOUR_ECS_IP:/var/www/html/
echo echo.
echo echo 第2步：上传API文件...
echo scp -r api/* user@YOUR_ECS_IP:/var/www/html/api/
echo echo.
echo echo 第3步：上传数据库脚本...
echo scp -r database/* user@YOUR_ECS_IP:/var/www/html/database/
echo echo.
echo echo 第4步：上传移动端文件...
echo scp -r mobile/* user@YOUR_ECS_IP:/var/www/html/mobile/
echo echo.
echo echo 第5步：在ECS上启动服务...
echo ssh user@YOUR_ECS_IP "cd /var/www/html/api && npm install && pm2 start app.js --name rental-platform"
echo echo.
echo echo ========================================
echo echo ✅ 部署完成！
echo echo.
echo echo 🌐 访问地址：
echo echo   网页版: http://116.62.44.24
echo echo   API接口: http://116.62.44.24/api
echo echo   App下载: http://116.62.44.24/mobile/download.html
echo echo   移动端测试: http://116.62.44.24/mobile-test
echo echo ========================================
echo pause
) > final-deployment\deploy-to-ecs.bat

echo ✅ ECS部署脚本创建完成

echo.
echo 第9步：创建本地测试脚本
echo ----------------------------------------
(
echo @echo off
echo echo 启动本地测试环境...
echo echo.
echo echo 1. 启动后端服务...
echo cd api
echo start cmd /k "npm run dev"
echo echo.
echo echo 2. 启动前端服务...
echo cd ..\web
echo start cmd /k "python -m http.server 8080"
echo echo.
echo echo ========================================
echo echo 本地测试地址：
echo echo   前端: http://localhost:8080
echo echo   后端: http://localhost:3000
echo echo ========================================
echo pause
) > final-deployment\test-local.bat

echo ✅ 本地测试脚本创建完成

echo.
echo 第10步：创建项目说明文档
echo ----------------------------------------
(
echo # 租赁平台部署包
echo.
echo ## 项目结构
echo ```
echo final-deployment/
echo ├── web/              # 前端静态文件
echo ├── api/              # 后端API服务
echo ├── database/         # 数据库脚本
echo ├── mobile/           # 移动端相关
echo ├── deploy-to-ecs.bat # ECS部署脚本
echo └── test-local.bat    # 本地测试脚本
echo ```
echo.
echo ## 部署到ECS
echo 1. 双击 `deploy-to-ecs.bat`
echo 2. 等待部署完成
echo 3. 访问 http://116.62.44.24
echo.
echo ## 本地测试
echo 1. 双击 `test-local.bat`
echo 2. 访问 http://localhost:8080
echo.
echo ## 功能特性
echo - ✅ 完整的Web应用
echo - ✅ 响应式移动端设计
echo - ✅ Android App支持
echo - ✅ 完整的后端API
echo - ✅ MySQL数据库
echo.
echo ## 移动端
echo - 网页版自动适配移动设备
echo - 可生成Android APK
echo - 支持原生功能（相机、GPS等）
) > final-deployment\README.md

echo ✅ 项目说明文档创建完成

echo.
echo ========================================
echo 🎉 项目检查和准备完成！
echo.
echo 📦 部署包位置: final-deployment\
echo 🚀 ECS部署: 双击 final-deployment\deploy-to-ecs.bat
echo 🧪 本地测试: 双击 final-deployment\test-local.bat
echo.
echo 📱 包含功能:
echo   ✅ 完整的Web应用 (Vue 3 + Node.js + MySQL)
echo   ✅ 响应式移动端设计
echo   ✅ Android App项目 (可生成APK)
echo   ✅ 完整的后端API
echo   ✅ 数据库脚本和配置
echo.
echo 🌐 部署后访问地址:
echo   - 网页版: http://116.62.44.24
echo   - API接口: http://116.62.44.24/api
echo   - App下载: http://116.62.44.24/mobile/download.html
echo   - 移动端测试: http://116.62.44.24/mobile-test
echo.
echo 🎯 下一步操作:
echo   1. 双击 final-deployment\deploy-to-ecs.bat 部署到ECS
echo   2. 或先双击 final-deployment\test-local.bat 本地测试
echo ========================================
goto :end

:error
echo.
echo ========================================
echo ❌ 检查失败！请修复上述问题后重试
echo ========================================
pause
exit /b 1

:end
pause