@echo off
echo ========================================
echo 构建Android APK文件
echo ========================================

echo.
echo 1. 构建前端项目...
cd qianduan
call npm run build

echo.
echo 2. 同步到Android项目...
call npx cap sync

echo.
echo 3. 构建APK文件...
cd android
call gradlew assembleRelease

echo.
echo 4. 检查APK文件...
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo ✅ APK构建成功！
    echo 文件位置: qianduan\android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo 5. 复制APK到根目录...
    copy "app\build\outputs\apk\release\app-release.apk" "..\..\租赁平台.apk"
    echo ✅ APK已复制到: qianduan\租赁平台.apk
) else (
    echo ❌ APK构建失败，请检查错误信息
)

echo.
echo ========================================
echo APK构建完成！
echo.
echo 下一步：
echo 1. 测试APK文件：安装到Android设备测试
echo 2. 上传到服务器：将APK文件上传到ECS供用户下载
echo 3. 创建下载页面：在网站添加APK下载链接
echo ========================================
pause