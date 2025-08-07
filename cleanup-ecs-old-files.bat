@echo off
echo ========================================
echo ECS旧文件清理脚本
echo ========================================

echo.
echo 此脚本将清理ECS上之前部署的旧文件：
echo - C:\var\www\html\ (之前的部署目录)
echo - 其他可能的临时文件
echo.

echo 请在ECS服务器上执行以下命令：
echo.
echo ========================================
echo # 1. 停止所有PM2服务
echo pm2 stop all
echo pm2 delete all
echo.
echo # 2. 清理旧的部署目录
echo cd C:\
echo if exist "C:\var\www\html" (
echo     echo 删除旧的 C:\var\www\html 目录...
echo     rmdir /S /Q "C:\var\www\html"
echo )
echo.
echo # 3. 清理可能的临时目录
echo if exist "C:\var\www\html-backup" (
echo     echo 删除备份目录...
echo     rmdir /S /Q "C:\var\www\html-backup"
echo )
echo.
echo # 4. 清理nginx配置中的旧路径引用
echo echo 检查nginx配置...
echo cd C:\nginx\nginx-1.24.0\conf
echo type nginx.conf
echo.
echo # 5. 检查是否还有其他旧文件
echo echo 检查C盘根目录是否有项目相关文件...
echo dir C:\ ^| findstr -i "rental platform trade"
echo.
echo # 6. 清理可能的uploads目录
echo if exist "C:\var\www\html\api\uploads" (
echo     echo 备份uploads目录到新位置...
echo     xcopy "C:\var\www\html\api\uploads" "C:\Users\Administrator\rental-platform\houduan\uploads\" /E /I /Y
echo )
echo.
echo ========================================
echo.
echo 清理完成后，确保只有以下目录存在：
echo - C:\Users\Administrator\rental-platform\ (新的标准项目)
echo - C:\Users\Administrator\rental-platform-backup-* (备份)
echo - C:\nginx\ (nginx服务器)
echo.
echo ========================================

pause