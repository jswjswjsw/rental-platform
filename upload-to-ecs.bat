@echo off
echo ==========================================
echo 上传部署包到ECS服务器
echo ==========================================

set /p PACKAGE_NAME="请输入部署包文件名 (例如: rental-platform-20240804_110830.zip): "
set ECS_IP=116.62.44.24
set ECS_USER=root

if not exist "%PACKAGE_NAME%" (
    echo 错误：找不到文件 %PACKAGE_NAME%
    echo 请先运行 create-deploy-package.bat 创建部署包
    pause
    exit /b 1
)

echo 正在上传 %PACKAGE_NAME% 到 %ECS_USER%@%ECS_IP%...
echo.
echo 请输入ECS服务器密码：

scp "%PACKAGE_NAME%" %ECS_USER%@%ECS_IP%:/tmp/

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo 上传成功！
    echo ==========================================
    echo 下一步在ECS服务器上执行：
    echo.
    echo ssh %ECS_USER%@%ECS_IP%
    echo cd /tmp
    echo unzip %PACKAGE_NAME%
    echo cd rental-platform
    echo chmod +x deploy-on-ecs.bat
    echo ./deploy-on-ecs.bat
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo 上传失败！
    echo ==========================================
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. SSH密钥未配置
    echo 3. 服务器地址或用户名错误
    echo.
    echo 请尝试其他上传方法
    echo ==========================================
)

pause