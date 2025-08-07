@echo off
echo 正在整理项目文件...

REM 创建目录结构
mkdir scripts\deployment 2>nul
mkdir scripts\testing 2>nul
mkdir scripts\database 2>nul
mkdir scripts\utilities 2>nul
mkdir docs 2>nul

REM 移动部署相关文件
echo 移动部署脚本...
move deploy-*.bat scripts\deployment\ 2>nul
move start-*.bat scripts\deployment\ 2>nul
move restart-*.bat scripts\deployment\ 2>nul
move clear-ports.bat scripts\deployment\ 2>nul
move fix-*.bat scripts\deployment\ 2>nul
move check-*.bat scripts\deployment\ 2>nul
move init-*.bat scripts\deployment\ 2>nul
move ecosystem*.config.js scripts\deployment\ 2>nul
move nginx.conf scripts\deployment\ 2>nul
move railway.toml scripts\deployment\ 2>nul

REM 移动测试相关文件
echo 移动测试脚本...
move test-*.js scripts\testing\ 2>nul
move debug-*.js scripts\testing\ 2>nul
move quick-test.js scripts\testing\ 2>nul
move check-*.js scripts\testing\ 2>nul

REM 移动数据库相关文件
echo 移动数据库脚本...
move *.sql scripts\database\ 2>nul
move init-*.js scripts\database\ 2>nul
move aliyun-*.js scripts\database\ 2>nul

REM 移动工具文件
echo 移动工具脚本...
move serve-static.js scripts\utilities\ 2>nul
move production-server*.js scripts\utilities\ 2>nul
move fix-image-data.js scripts\utilities\ 2>nul

REM 移动文档文件
echo 移动文档文件...
move *.md docs\ 2>nul
move test.html docs\ 2>nul

echo 文件整理完成！
pause