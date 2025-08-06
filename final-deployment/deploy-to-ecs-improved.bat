@echo off
setlocal

echo ========================================
echo 部署租赁平台到阿里云ECS (改进版)
echo ========================================

REM 配置变量 - 用户可以修改这些值
set ECS_IP=116.62.44.24
set ECS_USER=root
set WEB_PATH=/var/www/html
set API_PATH=/var/www/html/api

echo.
echo 配置信息：
echo 服务器IP: %ECS_IP%
echo 用户名: %ECS_USER%
echo Web路径: %WEB_PATH%
echo API路径: %API_PATH%

echo.
echo 第1步：检查本地环境...
echo ----------------------------------------

REM 检查必要工具
where scp >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: scp命令未找到
    echo 请安装以下工具之一：
    echo 1. Git for Windows (包含SSH工具)
    echo 2. Windows OpenSSH 功能
    echo 3. 使用 WinSCP 等图形化工具手动上传
    goto :error
)

where ssh >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: ssh命令未找到，请安装OpenSSH或Git Bash
    goto :error
)

echo ✅ SSH工具检查通过

echo.
echo 第2步：检查项目文件...
echo ----------------------------------------

if not exist "web" (
    echo ❌ 错误: web目录不存在
    echo 请确保已运行构建脚本创建了部署文件
    goto :error
)

if not exist "api" (
    echo ❌ 错误: api目录不存在
    echo 请检查项目结构是否正确
    goto :error
)

REM 检查关键文件
if not exist "web\index.html" (
    echo ❌ 错误: web目录中缺少index.html
    goto :error
)

if not exist "api\app.js" (
    echo ❌ 错误: api目录中缺少app.js
    goto :error
)

if not exist "api\package.json" (
    echo ❌ 错误: api目录中缺少package.json
    goto :error
)

echo ✅ 项目文件检查通过

echo.
echo 第3步：测试服务器连接...
echo ----------------------------------------
ssh -o ConnectTimeout=10 %ECS_USER%@%ECS_IP% "echo 'SSH连接测试成功'"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 无法连接到服务器 %ECS_IP%
    echo 请检查：
    echo 1. 服务器IP地址是否正确
    echo 2. SSH密钥是否配置正确
    echo 3. 网络连接是否正常
    goto :error
)
echo ✅ 服务器连接测试通过

echo.
echo 第4步：备份服务器现有文件...
echo ----------------------------------------
ssh %ECS_USER%@%ECS_IP% "if [ -d '%WEB_PATH%' ]; then cp -r %WEB_PATH% %WEB_PATH%.backup.$(date +%%Y%%m%%d_%%H%%M%%S); echo '备份完成'; else echo '无需备份'; fi"

echo.
echo 第5步：创建服务器目录结构...
echo ----------------------------------------
ssh %ECS_USER%@%ECS_IP% "mkdir -p %WEB_PATH% && mkdir -p %API_PATH%"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 创建目录失败
    goto :error
)
echo ✅ 目录结构创建成功

echo.
echo 第6步：上传Web前端文件...
echo ----------------------------------------
echo 正在上传前端文件...
scp -r web/* %ECS_USER%@%ECS_IP%:%WEB_PATH%/
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Web文件上传失败
    goto :error
)
echo ✅ Web文件上传成功

echo.
echo 第7步：上传后端API文件...
echo ----------------------------------------
echo 正在上传后端文件...
scp -r api/* %ECS_USER%@%ECS_IP%:%API_PATH%/
if %ERRORLEVEL% NEQ 0 (
    echo ❌ API文件上传失败
    goto :error
)
echo ✅ API文件上传成功

echo.
echo 第8步：在服务器上安装依赖...
echo ----------------------------------------
echo 正在安装Node.js依赖...
ssh %ECS_USER%@%ECS_IP% "cd %API_PATH% && npm install --production"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 依赖安装可能有问题，但继续部署...
) else (
    echo ✅ 依赖安装成功
)

echo.
echo 第9步：配置和启动服务...
echo ----------------------------------------
echo 正在配置PM2服务...
ssh %ECS_USER%@%ECS_IP% "cd %API_PATH% && pm2 stop rental-platform 2>/dev/null || true && pm2 start app.js --name rental-platform --watch"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ PM2服务启动可能有问题
    echo 尝试直接启动Node.js服务...
    ssh %ECS_USER%@%ECS_IP% "cd %API_PATH% && nohup node app.js > app.log 2>&1 &"
) else (
    echo ✅ PM2服务启动成功
)

echo.
echo 第10步：验证部署结果...
echo ----------------------------------------
echo 检查服务状态...
ssh %ECS_USER%@%ECS_IP% "pm2 list | grep rental-platform || ps aux | grep 'node app.js' | grep -v grep"

echo.
echo 测试Web服务...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://%ECS_IP%' -TimeoutSec 10 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '✅ Web服务正常' } else { Write-Host '⚠️ Web服务状态异常' } } catch { Write-Host '⚠️ Web服务无法访问，可能需要时间启动' }"

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
echo.
echo 📋 部署后检查清单：
echo   □ 访问网页版确认功能正常
echo   □ 测试API接口响应
echo   □ 检查数据库连接
echo   □ 验证文件上传功能
echo   □ 测试移动端适配
echo ========================================
goto :end

:error
echo.
echo ========================================
echo ❌ 部署失败！
echo.
echo 🔍 故障排除建议：
echo 1. 检查网络连接和服务器状态
echo 2. 验证SSH密钥配置
echo 3. 确认服务器有足够的磁盘空间
echo 4. 检查Node.js和npm是否已安装
echo 5. 查看服务器日志：ssh %ECS_USER%@%ECS_IP% "tail -f %API_PATH%/app.log"
echo.
echo 📞 如需帮助，请联系技术支持
echo ========================================
pause
exit /b 1

:end
echo.
echo 按任意键退出...
pause