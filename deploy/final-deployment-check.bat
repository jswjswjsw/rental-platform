@echo off
echo ========================================
echo 租赁平台完整部署检查
echo ========================================

echo.
echo 第1步：检查项目结构
echo ----------------------------------------
if exist "coreproject\前端\qianduan" (
    echo ✅ 前端项目存在
) else (
    echo ❌ 前端项目缺失
    goto :error
)

if exist "coreproject\后端\houduan" (
    echo ✅ 后端项目存在
) else (
    echo ❌ 后端项目缺失
    goto :error
)

if exist "coreproject\数据库\shujuku" (
    echo ✅ 数据库脚本存在
) else (
    echo ❌ 数据库脚本缺失
    goto :error
)

echo.
echo 第2步：检查前端依赖
echo ----------------------------------------
cd coreproject\前端\qianduan
if exist "package.json" (
    echo ✅ 前端package.json存在
) else (
    echo ❌ 前端package.json缺失
    goto :error
)

if exist "src\main.js" (
    echo ✅ 前端入口文件存在
) else (
    echo ❌ 前端入口文件缺失
    goto :error
)

if exist "android" (
    echo ✅ Android项目存在
) else (
    echo ❌ Android项目缺失
    goto :error
)

echo.
echo 第3步：检查后端依赖
echo ----------------------------------------
cd ..\..\后端\houduan
if exist "package.json" (
    echo ✅ 后端package.json存在
) else (
    echo ❌ 后端package.json缺失
    goto :error
)

if exist "app.js" (
    echo ✅ 后端入口文件存在
) else (
    echo ❌ 后端入口文件缺失
    goto :error
)

if exist ".env" (
    echo ✅ 环境配置文件存在
) else (
    echo ⚠️ 环境配置文件缺失，将使用默认配置
)

echo.
echo 第4步：检查并安装前端依赖
echo ----------------------------------------
cd ..\..\前端\qianduan
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 前端依赖安装失败
        goto :error
    )
)

echo.
echo 第4步：构建前端项目
echo ----------------------------------------
echo 正在构建前端项目...
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo ✅ 前端构建成功
) else (
    echo ❌ 前端构建失败
    goto :error
)

echo.
echo 第5步：检查后端依赖
echo ----------------------------------------
cd ..\..\后端\houduan
if not exist "node_modules" (
    echo 正在安装后端依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 后端依赖安装失败
        goto :error
    )
)

echo.
echo 第6步：同步移动端项目
echo ----------------------------------------
cd ..\..\前端\qianduan
echo 正在同步移动端项目...
call npx cap sync
if %ERRORLEVEL% EQU 0 (
    echo ✅ 移动端同步成功
) else (
    echo ❌ 移动端同步失败
    goto :error
)

echo.
echo 第6步：创建部署包
echo ----------------------------------------
cd ..\..\..\
mkdir deployment-package 2>nul
mkdir deployment-package\frontend 2>nul
mkdir deployment-package\backend 2>nul
mkdir deployment-package\database 2>nul
mkdir deployment-package\mobile 2>nul

REM 复制前端构建文件
xcopy "coreproject\前端\qianduan\dist\*" "deployment-package\frontend\" /E /Y

REM 复制后端文件
xcopy "coreproject\后端\houduan\*" "deployment-package\backend\" /E /Y

REM 复制数据库文件
xcopy "coreproject\数据库\shujuku\*" "deployment-package\database\" /E /Y

REM 复制移动端相关文件
if exist "create-download-page.html" (
    copy "create-download-page.html" "deployment-package\mobile\download.html"
    echo ✅ 移动端下载页面已复制
) else (
    echo ⚠️ 移动端下载页面不存在，将跳过
)

echo ✅ 部署包创建完成

echo.
echo 第7步：创建部署脚本
echo ----------------------------------------
(
echo @echo off
echo echo 部署到阿里云ECS...
echo echo.
echo echo 1. 上传前端文件到网站目录
echo scp -r frontend/* user@YOUR_ECS_IP:/var/www/html/
echo echo.
echo echo 2. 上传后端文件
echo scp -r backend/* user@YOUR_ECS_IP:/var/www/html/api/
echo echo.
echo echo 3. 上传数据库脚本
echo scp -r database/* user@YOUR_ECS_IP:/var/www/html/database/
echo echo.
echo echo 4. 上传移动端文件
echo scp -r mobile/* user@YOUR_ECS_IP:/var/www/html/mobile/
echo echo.
echo echo 部署完成！
echo echo 网页版: http://116.62.44.24
echo echo App下载: http://116.62.44.24/mobile/download.html
echo pause
) > deployment-package\deploy-to-ecs.bat

echo ✅ 部署脚本创建完成

echo.
echo ========================================
echo ✅ 项目检查完成！所有组件正常
echo.
echo 📦 部署包位置: deployment-package\
echo 🚀 部署脚本: deployment-package\deploy-to-ecs.bat
echo.
echo 📱 包含功能:
echo   - 网页版 (Vue 3 + Node.js)
echo   - 移动端响应式设计
echo   - Android App项目
echo   - 完整的后端API
echo   - 数据库脚本
echo.
echo 🌐 部署后访问地址:
echo   - 网页版: http://116.62.44.24
echo   - App下载: http://116.62.44.24/mobile/download.html
echo   - API接口: http://116.62.44.24/api
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