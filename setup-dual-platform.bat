@echo off
echo ========================================
echo 设置双平台访问：网页 + App下载
echo ========================================

echo.
echo 检查环境...
echo ----------------------------------------
if not exist "qianduan" (
    echo ❌ 错误: qianduan 目录不存在
    pause
    exit /b 1
)

if not exist "houduan" (
    echo ❌ 错误: houduan 目录不存在
    pause
    exit /b 1
)

echo.
echo 第1步：构建网页版本
echo ----------------------------------------
cd qianduan
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    cd ..
    pause
    exit /b 1
)

echo.
echo 第2步：创建部署目录结构
echo ----------------------------------------
cd ..
if not exist "dual-platform-deploy" mkdir dual-platform-deploy
if not exist "dual-platform-deploy\downloads" mkdir dual-platform-deploy\downloads
if not exist "dual-platform-deploy\houduan" mkdir dual-platform-deploy\houduan

echo.
echo 第3步：复制网页文件
echo ----------------------------------------
xcopy "qianduan\dist\*" "dual-platform-deploy\" /E /Y

echo.
echo 第4步：复制后端文件
echo ----------------------------------------
echo 正在复制后端文件（排除node_modules）...
for /d %%i in (houduan\*) do (
    if /i not "%%~nxi"=="node_modules" (
        xcopy "%%i" "dual-platform-deploy\houduan\%%~nxi\" /E /I /Y
    )
)
for %%i in (houduan\*.*) do (
    if /i not "%%~nxi"=="node_modules" (
        copy "%%i" "dual-platform-deploy\houduan\" /Y
    )
)

echo.
echo 第5步：创建下载页面
echo ----------------------------------------
if exist "create-download-page.html" (
    copy "create-download-page.html" "dual-platform-deploy\download.html"
    echo ✅ 下载页面已创建
) else (
    echo ⚠️  警告: create-download-page.html 不存在，将创建默认下载页面
    echo 请稍后手动创建下载页面
)

echo.
echo 第6步：创建APK占位文件（稍后替换）
echo ----------------------------------------
echo. > "dual-platform-deploy\downloads\租赁平台.apk"
echo APK文件占位符 - 请稍后使用Android Studio生成真实APK文件 > "dual-platform-deploy\downloads\README.txt"

echo.
echo 第7步：创建用户引导页面
echo ----------------------------------------
(
echo ^<!DOCTYPE html^>
echo ^<html lang="zh-CN"^>
echo ^<head^>
echo     ^<meta charset="UTF-8"^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo     ^<title^>闲置资源租赁平台^</title^>
echo     ^<style^>
echo         body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
echo         .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1^); }
echo         .btn { display: inline-block; padding: 15px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
echo         .btn-primary { background: #409EFF; color: white; }
echo         .btn-secondary { background: #67C23A; color: white; }
echo         .btn:hover { opacity: 0.8; }
echo         h1 { color: #333; margin-bottom: 30px; }
echo         p { color: #666; line-height: 1.6; }
echo     ^</style^>
echo ^</head^>
echo ^<body^>
echo     ^<div class="container"^>
echo         ^<h1^>🏠 闲置资源租赁平台^</h1^>
echo         ^<p^>欢迎使用我们的租赁平台！您可以选择以下方式访问：^</p^>
echo         ^<div style="margin: 30px 0;"^>
echo             ^<a href="/index.html" class="btn btn-primary"^>🌐 立即使用网页版^</a^>
echo             ^<a href="/download.html" class="btn btn-secondary"^>📱 下载手机App^</a^>
echo         ^</div^>
echo         ^<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;"^>
echo             ^<h3^>功能特色^</h3^>
echo             ^<p^>✅ 发布和浏览闲置物品^<br^>✅ 在线预订和支付^<br^>✅ 用户评价系统^<br^>✅ 移动端原生体验^</p^>
echo         ^</div^>
echo     ^</div^>
echo ^</body^>
echo ^</html^>
) > "dual-platform-deploy\welcome.html"

echo.
echo ========================================
echo ✅ 双平台部署包已准备完成！
echo.
echo 📁 部署包位置: dual-platform-deploy\
echo.
echo 🌐 用户访问方式：
echo    欢迎页面: https://你的域名.com/welcome.html
echo    网页版本: https://你的域名.com/
echo    下载页面: https://你的域名.com/download.html
echo.
echo 📱 下一步操作：
echo 1. 上传 dual-platform-deploy 目录到ECS服务器
echo 2. 使用Android Studio生成APK文件
echo 3. 将APK文件上传到 /downloads/ 目录
echo.
echo 🚀 立即部署命令：
echo scp -r dual-platform-deploy/* user@your-ecs:/var/www/html/
echo ========================================
pause