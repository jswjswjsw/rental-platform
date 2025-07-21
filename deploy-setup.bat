@echo off
echo 🚀 租赁平台部署准备脚本
echo.

echo 📋 第一步：准备Git仓库
echo.
echo 请确保你已经：
echo 1. 在GitHub创建了仓库 rental-platform
echo 2. 获得了仓库的Git地址
echo.
set /p repo_url="请输入你的GitHub仓库地址 (例如: https://github.com/username/rental-platform.git): "

echo.
echo 🔄 初始化Git仓库...
git init
git add .
git commit -m "Initial commit - 租赁平台项目"
git branch -M main
git remote add origin %repo_url%

echo.
echo 📤 推送代码到GitHub...
git push -u origin main

echo.
echo ✅ 代码已推送到GitHub！
echo.
echo 📋 接下来请按照以下步骤部署：
echo.
echo 🚄 Railway后端部署：
echo 1. 访问 https://railway.app
echo 2. 使用GitHub登录
echo 3. 创建新项目，添加MySQL数据库
echo 4. 添加GitHub服务，选择你的仓库，根目录设为 houduan
echo 5. 配置环境变量（参考 DEPLOYMENT.md）
echo.
echo 🌐 Vercel前端部署：
echo 1. 访问 https://vercel.com  
echo 2. 使用GitHub登录
echo 3. 导入项目，根目录设为 qianduan
echo 4. 配置环境变量 VITE_API_BASE_URL
echo.
echo 📖 详细步骤请查看 DEPLOYMENT.md 文件
echo.
pause