@echo off
setlocal enabledelayedexpansion
echo ========================================
echo 重新整理租赁平台项目文件
echo ========================================

REM 设置计数器
set /a moved_files=0
set /a failed_moves=0

REM 检查是否已经整理过
if exist "scripts\deployment" if exist "scripts\testing" if exist "scripts\database" (
    echo.
    echo ⚠️  检测到项目可能已经整理过
    echo    如果确定要重新整理，请先手动删除 scripts 目录
    echo.
    pause
    exit /b 1
)

REM 创建新的目录结构
echo 创建目录结构...
mkdir scripts 2>nul
mkdir scripts\deployment 2>nul
mkdir scripts\testing 2>nul
mkdir scripts\database 2>nul
mkdir scripts\utilities 2>nul
mkdir docs 2>nul
mkdir config 2>nul

REM 移动部署相关脚本
echo 整理部署脚本...
if exist deploy-all-services.bat move deploy-all-services.bat scripts\deployment\
if exist deploy-frontend.bat move deploy-frontend.bat scripts\deployment\
if exist deploy-frontend-complete.bat move deploy-frontend-complete.bat scripts\deployment\
if exist deploy-final.bat move deploy-final.bat scripts\deployment\
if exist deploy-pm2.bat move deploy-pm2.bat scripts\deployment\
if exist deploy-pm2.sh move deploy-pm2.sh scripts\deployment\
if exist deploy-production.bat move deploy-production.bat scripts\deployment\
if exist deploy-setup.bat move deploy-setup.bat scripts\deployment\
if exist deploy-to-ecs.bat move deploy-to-ecs.bat scripts\deployment\

REM 移动启动和重启脚本
echo 整理启动脚本...
if exist start-all-services.bat move start-all-services.bat scripts\deployment\
if exist start-all.bat move start-all.bat scripts\deployment\
if exist start.bat move start.bat scripts\deployment\
if exist restart-services.bat move restart-services.bat scripts\deployment\
if exist restart.bat move restart.bat scripts\deployment\
if exist clear-ports.bat move clear-ports.bat scripts\deployment\

REM 移动修复和检查脚本
echo 整理维护脚本...
if exist fix-404.bat move fix-404.bat scripts\utilities\
if exist fix-aliyun-rds.bat move fix-aliyun-rds.bat scripts\utilities\
if exist check-status.bat move check-status.bat scripts\utilities\
if exist check-network.js move check-network.js scripts\utilities\

REM 移动测试脚本
echo 整理测试脚本...
if exist test-*.js move test-*.js scripts\testing\
if exist debug-*.js move debug-*.js scripts\testing\
if exist quick-test.js move quick-test.js scripts\testing\
if exist aliyun-rds-check.js move aliyun-rds-check.js scripts\testing\

REM 移动数据库相关文件
echo 整理数据库文件...
REM 注意：保持shujuku目录中的SQL文件不动，只移动根目录的SQL文件
for %%f in (*.sql) do (
    if exist "%%f" (
        echo 移动数据库文件: %%f
        move "%%f" scripts\database\
    )
)
if exist init-aliyun-rds.js move init-aliyun-rds.js scripts\database\
if exist init-railway-db.js move init-railway-db.js scripts\database\
if exist init-database.bat move init-database.bat scripts\database\
if exist fix-image-data.js move fix-image-data.js scripts\database\

REM 移动配置文件
echo 整理配置文件...
if exist ecosystem*.config.js move ecosystem*.config.js config\
if exist nginx.conf move nginx.conf config\
if exist railway.toml move railway.toml config\

REM 移动服务器文件
echo 整理服务器文件...
if exist production-server*.js move production-server*.js scripts\utilities\
if exist serve-static.js move serve-static.js scripts\utilities\

REM 移动文档文件
echo 整理文档文件...
if exist README*.md move README*.md docs\
if exist DEPLOYMENT.md move DEPLOYMENT.md docs\
if exist mobile-app-setup.md move mobile-app-setup.md docs\
if exist 项目完整说明文档.md move 项目完整说明文档.md docs\
if exist test.html move test.html docs\

REM 清理临时文件
echo 清理临时文件...
if exist "14.0.0)" del "14.0.0)" 2>nul

echo ========================================
echo 文件整理完成！
echo ========================================
echo.
echo 新的目录结构:
echo ├── scripts/
echo │   ├── deployment/     # 部署相关脚本
echo │   ├── testing/        # 测试脚本
echo │   ├── database/       # 数据库脚本
echo │   └── utilities/      # 工具脚本
echo ├── config/             # 配置文件
echo ├── docs/               # 文档文件
echo ├── houduan/            # 后端代码
echo ├── qianduan/           # 前端代码
echo ├── shujuku/            # 数据库文件
echo └── ziyuan/             # 资源文件
echo.
pause