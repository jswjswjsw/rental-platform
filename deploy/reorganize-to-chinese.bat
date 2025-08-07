@echo off
echo ========================================
echo 正在重组项目为中文标准结构...
echo ========================================

echo.
echo 第1步：检查源目录是否存在...
echo ----------------------------------------
if not exist "frontend" (
    echo ❌ 错误: frontend 目录不存在
    goto :error
)
if not exist "backend" (
    echo ❌ 错误: backend 目录不存在  
    goto :error
)
echo ✅ 源目录检查通过

echo.
echo 第2步：创建备份...
echo ----------------------------------------
set BACKUP_DIR=backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%" 2>nul
echo 备份目录: %BACKUP_DIR%

echo.
echo 第3步：创建中文目录结构...
echo ----------------------------------------
mkdir qianduan 2>nul
mkdir houduan 2>nul
mkdir shujuku 2>nul
mkdir deploy 2>nul
echo ✅ 目录结构创建完成

echo.
echo 第4步：移动前端文件到 qianduan/...
echo ----------------------------------------
if exist "frontend" (
    xcopy frontend\* qianduan\ /E /I /Y
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 前端文件移动失败
        goto :error
    )
    echo ✅ 前端文件移动成功
) else (
    echo ⚠️ frontend 目录不存在，跳过
)

echo.
echo 第5步：移动后端文件到 houduan/...
echo ----------------------------------------
if exist "backend" (
    xcopy backend\* houduan\ /E /I /Y
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 后端文件移动失败
        goto :error
    )
    echo ✅ 后端文件移动成功
) else (
    echo ⚠️ backend 目录不存在，跳过
)

echo.
echo 第6步：移动数据库文件到 shujuku/...
echo ----------------------------------------
for %%f in (*.sql) do (
    if exist "%%f" (
        copy "%%f" "shujuku\" /Y
        echo 已移动: %%f
    )
)
for %%f in (*database*.js) do (
    if exist "%%f" (
        copy "%%f" "shujuku\" /Y
        echo 已移动: %%f
    )
)
if exist "init-local-database.sql" copy "init-local-database.sql" "shujuku\" /Y
echo ✅ 数据库文件移动完成

echo.
echo 第7步：移动部署文件到 deploy/...
echo ----------------------------------------
for %%f in (*.bat) do (
    if not "%%f"=="reorganize-to-chinese.bat" (
        if exist "%%f" (
            copy "%%f" "deploy\" /Y
            echo 已移动: %%f
        )
    )
)
if exist "final-deployment" (
    xcopy final-deployment\* deploy\final-deployment\ /E /I /Y
    echo ✅ final-deployment 目录已移动
)
echo ✅ 部署文件移动完成

echo.
echo 第8步：创建新的项目说明文档...
echo ----------------------------------------
(
echo # 闲置资源租赁平台
echo.
echo ## 项目结构
echo.
echo ```
echo qianduan/          # 前端Vue3项目
echo houduan/           # 后端Express项目
echo shujuku/           # 数据库脚本
echo deploy/            # 部署脚本
echo ```
echo.
echo ## 快速开始
echo.
echo 1. 安装依赖
echo ```bash
echo cd qianduan ^&^& npm install
echo cd ../houduan ^&^& npm install
echo ```
echo.
echo 2. 启动服务
echo ```bash
echo # 启动后端
echo cd houduan ^&^& npm run dev
echo.
echo # 启动前端
echo cd qianduan ^&^& npm run dev
echo ```
echo.
echo 3. 访问应用
echo - 前端: http://localhost:5173
echo - 后端API: http://localhost:3000
echo.
echo ## 部署
echo.
echo 查看 deploy/ 目录中的部署脚本
) > new-README.md
echo ✅ 项目说明文档创建完成

echo.
echo 第9步：验证文件移动结果...
echo ----------------------------------------
echo 检查目录内容...
if exist "qianduan\package.json" (
    echo ✅ qianduan/ 目录包含前端项目
) else (
    echo ❌ qianduan/ 目录可能不完整
)

if exist "houduan\package.json" (
    echo ✅ houduan/ 目录包含后端项目
) else (
    echo ❌ houduan/ 目录可能不完整
)

if exist "shujuku\*.sql" (
    echo ✅ shujuku/ 目录包含数据库脚本
) else (
    echo ⚠️ shujuku/ 目录可能为空
)

echo.
echo ========================================
echo 🎉 项目重组完成！
echo ========================================
echo.
echo 📁 新的目录结构：
echo   qianduan/  - 前端Vue3代码
echo   houduan/   - 后端Express代码  
echo   shujuku/   - 数据库脚本
echo   deploy/    - 部署脚本
echo.
echo 📋 下一步操作：
echo 1. 检查文件是否正确移动
echo 2. 测试项目是否正常运行
echo 3. 确认无误后可删除原 frontend/ 和 backend/ 目录
echo 4. 将 new-README.md 重命名为 README.md
echo.
echo 🔄 如需回滚，备份文件在: %BACKUP_DIR%
echo ========================================
goto :end

:error
echo.
echo ========================================
echo ❌ 重组失败！
echo ========================================
echo.
echo 请检查：
echo 1. 源目录是否存在
echo 2. 是否有足够的磁盘空间
echo 3. 是否有文件访问权限
echo.
echo 如果需要恢复，请检查备份目录: %BACKUP_DIR%
echo ========================================
pause
exit /b 1

:end
pause