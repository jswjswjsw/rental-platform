@echo off
echo ==========================================
echo 创建ECS部署包
echo ==========================================

set DEPLOY_DIR=deploy-package
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 正在创建部署目录...
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%

echo 复制项目文件...
xcopy /E /I /H /Y houduan %DEPLOY_DIR%\houduan
xcopy /E /I /H /Y qianduan %DEPLOY_DIR%\qianduan
xcopy /E /I /H /Y shujuku %DEPLOY_DIR%\shujuku

echo 复制配置文件...
copy package.json %DEPLOY_DIR%\ 2>nul
copy README.md %DEPLOY_DIR%\ 2>nul
copy *.md %DEPLOY_DIR%\ 2>nul

echo 清理不必要的文件...
rmdir /s /q %DEPLOY_DIR%\houduan\node_modules 2>nul
rmdir /s /q %DEPLOY_DIR%\qianduan\node_modules 2>nul
rmdir /s /q %DEPLOY_DIR%\qianduan\dist 2>nul
del /q %DEPLOY_DIR%\houduan\.env 2>nul

echo 创建部署脚本...
echo @echo off > %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 开始在ECS上部署... >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 安装后端依赖... >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo cd houduan >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo npm install >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 恢复环境配置... >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo cp .env.backup .env >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 安装前端依赖... >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo cd ../qianduan >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo npm install >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 构建前端... >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo npm run build >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 重启服务... >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo cd .. >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo pm2 restart rental-backend >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo pm2 restart rental-frontend >> %DEPLOY_DIR%\deploy-on-ecs.bat
echo echo 部署完成！ >> %DEPLOY_DIR%\deploy-on-ecs.bat

echo 创建压缩包...
powershell -command "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath 'rental-platform-%TIMESTAMP%.zip' -Force"

echo ==========================================
echo 部署包创建完成！
echo ==========================================
echo 文件名: rental-platform-%TIMESTAMP%.zip
echo 大小: 
for %%A in (rental-platform-%TIMESTAMP%.zip) do echo %%~zA bytes
echo.
echo 下一步：
echo 1. 将zip文件上传到ECS服务器
echo 2. 在ECS上解压并运行deploy-on-ecs.bat
echo ==========================================
pause