@echo off
setlocal

echo ========================================
echo 📦 自动生成APK文件
echo ========================================

echo.
echo 1. 检查环境...
if not exist "qianduan\android" (
    echo ❌ 错误: Android项目未找到，请先运行 mobile-dev-setup.bat
    pause
    exit /b 1
)

if not exist "qianduan\node_modules" (
    echo ❌ 错误: 前端依赖未安装
    echo 正在安装依赖...
    cd qianduan
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo 2. 构建前端项目...
cd qianduan
echo 正在构建生产版本...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)

echo.
echo 3. 同步到Android项目...
echo 正在同步Capacitor项目...
call npx cap sync
if errorlevel 1 (
    echo ❌ 同步失败
    pause
    exit /b 1
)

echo.
echo 4. 检查签名配置...
if not exist "android\rental-platform.keystore" (
    echo ⚠️  警告: 签名密钥不存在，将生成调试版APK
    echo 如需发布版本，请先创建签名密钥
    echo.
    echo 生成调试版APK...
    cd android
    call gradlew assembleDebug
    if errorlevel 1 (
        echo ❌ 调试版APK构建失败
        pause
        exit /b 1
    )
    
    echo.
    echo 5. 复制调试版APK文件...
    cd ..\..
    set VERSION=1.0.0-debug
    copy "qianduan\android\app\build\outputs\apk\debug\app-debug.apk" "租赁平台-v%VERSION%.apk"
    
    echo.
    echo ✅ 调试版APK生成成功！
    echo 📁 文件位置: 租赁平台-v%VERSION%.apk
    echo ⚠️  注意: 这是调试版本，仅用于测试
    
) else (
    echo 找到签名密钥，构建发布版APK...
    cd android
    call gradlew assembleRelease
    if errorlevel 1 (
        echo ❌ 发布版APK构建失败，请检查签名配置
        echo 尝试构建调试版本...
        call gradlew assembleDebug
        if errorlevel 1 (
            echo ❌ APK构建完全失败
            pause
            exit /b 1
        )
        
        cd ..\..
        set VERSION=1.0.0-debug
        copy "qianduan\android\app\build\outputs\apk\debug\app-debug.apk" "租赁平台-v%VERSION%.apk"
        echo ✅ 调试版APK生成成功！
    ) else (
        cd ..\..
        set VERSION=1.0.0
        copy "qianduan\android\app\build\outputs\apk\release\app-release.apk" "租赁平台-v%VERSION%.apk"
        echo ✅ 发布版APK生成成功！
    )
    
    echo 📁 文件位置: 租赁平台-v%VERSION%.apk
)

echo.
for %%A in ("租赁平台-v%VERSION%.apk") do echo 📱 文件大小: %%~zA bytes

echo.
echo ========================================
echo 🎉 APK生成完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 测试APK: 
echo    adb install "租赁平台-v%VERSION%.apk"
echo.
echo 2. 上传到服务器:
echo    scp "租赁平台-v%VERSION%.apk" user@116.62.44.24:/var/www/html/downloads/
echo.
echo 3. 更新下载页面链接
echo.
echo 4. 测试功能清单:
echo    - 应用启动
echo    - 用户登录
echo    - 资源浏览
echo    - 相机功能
echo    - 网络请求
echo.
pause