@echo off
echo ========================================
echo 项目清理和整理
echo ========================================

echo.
echo 第1步：创建整理后的目录结构
echo ----------------------------------------
mkdir cleaned-project 2>nul
mkdir cleaned-project\docs 2>nul
mkdir cleaned-project\scripts 2>nul
mkdir cleaned-project\mobile 2>nul

echo.
echo 第2步：保留核心项目文件
echo ----------------------------------------
REM 复制核心项目目录
xcopy qianduan cleaned-project\qianduan\ /E /I /Y
xcopy houduan cleaned-project\houduan\ /E /I /Y
xcopy shujuku cleaned-project\shujuku\ /E /I /Y

REM 复制重要配置文件
copy .gitignore cleaned-project\ 2>nul
copy package.json cleaned-project\ 2>nul
copy README.md cleaned-project\ 2>nul

echo.
echo 第3步：整理文档文件
echo ----------------------------------------
copy FINAL_DEPLOYMENT_GUIDE.md cleaned-project\docs\ 2>nul
copy MOBILE_APP_GUIDE.md cleaned-project\docs\ 2>nul
copy ANDROID_STUDIO_APK_GUIDE.md cleaned-project\docs\ 2>nul
copy PROJECT-STRUCTURE.md cleaned-project\docs\ 2>nul

echo.
echo 第4步：整理脚本文件
echo ----------------------------------------
copy setup-dual-platform.bat cleaned-project\scripts\ 2>nul
copy build-apk.bat cleaned-project\scripts\ 2>nul
copy upload-to-ecs.bat cleaned-project\scripts\ 2>nul
copy start-all.bat cleaned-project\scripts\ 2>nul

echo.
echo 第5步：整理移动端相关文件
echo ----------------------------------------
copy create-download-page.html cleaned-project\mobile\ 2>nul
copy mobile-dev-setup.bat cleaned-project\mobile\ 2>nul
copy sync-mobile.bat cleaned-project\mobile\ 2>nul

echo.
echo 第6步：创建简化的启动脚本
echo ----------------------------------------
(
echo @echo off
echo echo 启动租赁平台...
echo echo.
echo echo 1. 启动后端服务...
echo cd houduan
echo start cmd /k "npm run dev"
echo echo.
echo echo 2. 启动前端服务...
echo cd ..\qianduan  
echo start cmd /k "npm run dev"
echo echo.
echo echo 服务已启动！
echo echo 前端: http://localhost:5173
echo echo 后端: http://localhost:3000
echo pause
) > cleaned-project\start.bat

echo.
echo 第7步：创建项目说明文件
echo ----------------------------------------
(
echo # 闲置资源租赁平台
echo.
echo ## 项目结构
echo ```
echo cleaned-project/
echo ├── qianduan/          # 前端Vue3项目
echo ├── houduan/           # 后端Node.js项目  
echo ├── shujuku/           # 数据库脚本
echo ├── docs/              # 项目文档
echo ├── scripts/           # 部署脚本
echo ├── mobile/            # 移动端相关
echo └── start.bat          # 快速启动脚本
echo ```
echo.
echo ## 快速开始
echo 1. 双击 `start.bat` 启动项目
echo 2. 访问 http://localhost:5173 查看网站
echo 3. 查看 docs/ 目录了解详细文档
echo.
echo ## 移动端
echo - 支持响应式Web访问
echo - 可生成Android APK
echo - 查看 mobile/ 目录了解详情
) > cleaned-project\README.md

echo.
echo ========================================
echo ✅ 项目清理完成！
echo.
echo 📁 整理后的项目位置: cleaned-project\
echo 🚀 快速启动: 双击 cleaned-project\start.bat
echo 📖 查看文档: cleaned-project\docs\
echo.
echo 原项目文件保持不变，新的整理版本在 cleaned-project 目录
echo ========================================
pause