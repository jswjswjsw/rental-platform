@echo off
setlocal

echo ========================================
echo 移动端功能测试
echo ========================================

echo.
echo 1. 检查项目依赖...
if not exist "qianduan\node_modules" (
    echo 错误: 前端依赖未安装，请先运行 npm install
    echo 正在自动安装依赖...
    cd qianduan
    npm install
    if errorlevel 1 (
        echo 依赖安装失败，请手动运行: cd qianduan && npm install
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo 2. 启动开发服务器...
cd qianduan
echo 正在启动 Vite 开发服务器...
start cmd /k "npm run dev"

echo.
echo 3. 等待服务器启动...
echo 检查服务器状态...
timeout /t 8

echo.
echo 4. 验证服务器是否启动...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '服务器启动成功' } } catch { Write-Host '服务器可能还在启动中，请稍等...' }"

echo.
echo 5. 打开浏览器测试移动端功能...
start http://localhost:5173/mobile-test

echo.
echo ========================================
echo 测试说明：
echo.
echo 浏览器测试：
echo 1. 在浏览器中测试基本功能
echo 2. 使用F12开发者工具模拟移动设备
echo 3. 测试相机、位置等功能（Web版本）
echo 4. 确认移动端UI显示正常
echo.
echo 移动端测试：
echo 1. 构建项目: npm run build
echo 2. 同步到移动端: npx cap sync
echo 3. 打开Android Studio: npx cap open android
echo 4. 在真实设备或模拟器中运行
echo.
echo 快速移动端测试：
echo 运行 sync-mobile.bat 脚本
echo.
echo 测试功能清单：
echo ✓ 平台检测（Web/移动端）
echo ✓ 相机拍照功能
echo ✓ 地理位置获取
echo ✓ 设备信息获取
echo ✓ 网络状态检测
echo ✓ 移动端导航
echo ========================================

echo.
echo 如果遇到问题：
echo 1. 端口被占用：检查其他服务是否占用5173端口
echo 2. 依赖问题：删除node_modules后重新安装
echo 3. 权限问题：确保相机和位置权限已授权
echo 4. 网络问题：检查API服务器是否正常运行
echo.
pause