@echo off
echo 正在清理端口占用...

echo 1. 停止所有PM2服务
pm2 stop all 2>nul
pm2 delete all 2>nul

echo 2. 清理3000端口占用
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%e"=="" (
        echo 结束进程 %%e (端口 %%b)
        taskkill /PID %%e /F 2>nul
    )
)

echo 3. 清理8080端口占用
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :8080') do (
    if not "%%e"=="" (
        echo 结束进程 %%e (端口 %%b)
        taskkill /PID %%e /F 2>nul
    )
)

echo 4. 清理PM2相关进程
taskkill /IM pm2.exe /F 2>nul
echo 注意: 如需清理所有Node.js进程，请手动执行: taskkill /IM node.exe /F

echo 5. 验证端口状态
echo 检查3000端口:
netstat -ano | findstr :3000
echo 检查8080端口:
netstat -ano | findstr :8080

echo 端口清理完成！
pause