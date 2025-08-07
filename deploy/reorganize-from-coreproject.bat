@echo off
echo ========================================
echo 从 coreproject 重组项目为中文标准结构
echo ========================================

echo.
echo 第1步：检查 coreproject 目录...
echo ----------------------------------------
if not exist "coreproject" (
    echo ❌ 错误: coreproject 目录不存在
    pause
    exit /b 1
)
echo ✅ coreproject 目录存在

echo.
echo 第2步：创建中文目录结构...
echo ----------------------------------------
mkdir qianduan 2>nul
mkdir houduan 2>nul
mkdir shujuku 2>nul
mkdir deploy 2>nul
echo ✅ 目录结构创建完成

echo.
echo 第3步：移动前端文件到 qianduan/...
echo ----------------------------------------
if exist "coreproject\Front\qianduan" (
    xcopy coreproject\Front\qianduan\* qianduan\ /E /I /Y
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 前端文件移动成功
    ) else (
        echo ❌ 前端文件移动失败
        goto :error
    )
) else if exist "coreproject\Front" (
    xcopy coreproject\Front\* qianduan\ /E /I /Y
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 前端文件移动成功
    ) else (
        echo ❌ 前端文件移动失败
        goto :error
    )
) else (
    echo ⚠️ coreproject\Front 目录不存在
)

echo.
echo 第4步：移动后端文件到 houduan/...
echo ----------------------------------------
if exist "coreproject\Backend\houduan" (
    xcopy coreproject\Backend\houduan\* houduan\ /E /I /Y
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 后端文件移动成功
    ) else (
        echo ❌ 后端文件移动失败
        goto :error
    )
) else if exist "coreproject\Backend" (
    xcopy coreproject\Backend\* houduan\ /E /I /Y
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 后端文件移动成功
    ) else (
        echo ❌ 后端文件移动失败
        goto :error
    )
) else (
    echo ⚠️ coreproject\Backend 目录不存在
)

echo.
echo 第5步：移动数据库文件到 shujuku/...
echo ----------------------------------------
if exist "coreproject\Datebase" (
    xcopy coreproject\Datebase\* shujuku\ /E /I /Y
    echo ✅ 数据库文件移动成功
) else (
    echo ⚠️ coreproject\Datebase 目录不存在
)

REM 也移动根目录下的数据库文件
for %%f in (*.sql) do (
    if exist "%%f" (
        copy "%%f" "shujuku\" /Y
        echo 已移动: %%f
    )
)

echo.
echo 第6步：移动部署文件到 deploy/...
echo ----------------------------------------
if exist "coreproject\DeploymentScript" (
    xcopy coreproject\DeploymentScript\* deploy\ /E /I /Y
    echo ✅ 部署脚本移动成功
) else (
    echo ⚠️ coreproject\DeploymentScript 目录不存在
)

REM 移动根目录下的部署文件
for %%f in (*.bat) do (
    if not "%%f"=="reorganize-from-coreproject.bat" (
        if exist "%%f" (
            copy "%%f" "deploy\" /Y
        )
    )
)

if exist "final-deployment" (
    xcopy final-deployment\* deploy\final-deployment\ /E /I /Y
)

echo.
echo 第7步：创建新的 README.md...
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
echo ### 1. 安装依赖
echo ```bash
echo cd qianduan ^&^& npm install
echo cd ../houduan ^&^& npm install
echo ```
echo.
echo ### 2. 启动服务
echo ```bash
echo # 启动后端
echo cd houduan ^&^& npm run dev
echo.
echo # 启动前端  
echo cd qianduan ^&^& npm run dev
echo ```
echo.
echo ### 3. 访问应用
echo - 前端: http://localhost:5173
echo - 后端API: http://localhost:3000
) > new-README.md
echo ✅ README.md 创建完成

echo.
echo ========================================
echo 🎉 重组完成！
echo ========================================
echo.
echo 📁 新的目录结构：
echo   qianduan/  - 前端代码
echo   houduan/   - 后端代码  
echo   shujuku/   - 数据库脚本
echo   deploy/    - 部署脚本
echo.
echo 📋 下一步：
echo 1. 检查文件是否正确移动
echo 2. 可以删除空的 frontend/ 和 backend/ 目录
echo 3. 将 new-README.md 重命名为 README.md
echo 4. 提交到 GitHub
echo ========================================
pause
exit /b 0

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
echo 如果需要恢复，请手动删除已创建的目录
echo ========================================
pause
exit /b 1