@echo off
echo ========================================
echo 完整部署：Web + APK
echo ========================================

echo.
echo 第一步：构建Web版本
echo ----------------------------------------
cd qianduan
call npm run build

echo.
echo 第二步：构建APK文件
echo ----------------------------------------
call npx cap sync
cd android
call gradlew assembleRelease

echo.
echo 第三步：准备部署文件
echo ----------------------------------------
cd ..\..

REM 创建部署目录
if not exist "deploy-package" mkdir deploy-package
if not exist "deploy-package\downloads" mkdir deploy-package\downloads

REM 复制Web文件
xcopy "qianduan\dist\*" "deploy-package\" /E /Y

REM 复制APK文件
if exist "qianduan\android\app\build\outputs\apk\release\app-release.apk" (
    copy "qianduan\android\app\build\outputs\apk\release\app-release.apk" "deploy-package\downloads\租赁平台.apk"
    echo ✅ APK文件已准备
) else (
    echo ❌ APK构建失败，跳过APK部署
)

REM 复制下载页面
copy "create-download-page.html" "deploy-package\download.html"

REM 复制后端文件
xcopy "houduan\*" "deploy-package\houduan\" /E /Y

echo.
echo 第四步：显示部署信息
echo ----------------------------------------
echo ✅ 部署包已准备完成！
echo.
echo 📁 部署包位置: deploy-package\
echo 📱 APK下载页面: /download.html
echo 📦 APK文件: /downloads/租赁平台.apk
echo.
echo 第五步：上传到ECS服务器
echo ----------------------------------------
echo 请手动执行以下命令上传到ECS：
echo.
echo scp -r deploy-package/* user@your-ecs-ip:/var/www/html/
echo.
echo 或者使用FTP工具上传 deploy-package 目录中的所有文件
echo.
echo 第六步：用户访问方式
echo ----------------------------------------
echo 🌐 网页版: https://你的域名.com
echo 📱 下载页面: https://你的域名.com/download.html
echo 📦 直接下载: https://你的域名.com/downloads/租赁平台.apk
echo ========================================
pause