@echo off
chcp 65001 >nul

echo.
echo ==========================================
echo   闲置租赁平台 - 服务状态检查
echo ==========================================
echo.

:: 检查PM2服务状态
echo [1/4] PM2服务状态:
pm2 status

:: 检查端口占用
echo.
echo [2/4] 端口占用情况:
echo 前端服务 (8080端口):
netstat -ano | findstr :8080
echo.
echo 后端服务 (3000端口):
netstat -ano | findstr :3000

:: 测试服务访问
echo.
echo [3/4] 服务访问测试:
echo 测试前端服务...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080' -TimeoutSec 5; Write-Host '✅ 前端服务正常 (状态码:' $response.StatusCode ')' } catch { Write-Host '❌ 前端服务异常:' $_.Exception.Message }"

echo.
echo 测试后端API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 5; Write-Host '✅ 后端API正常 (状态码:' $response.StatusCode ')' } catch { Write-Host '❌ 后端API异常:' $_.Exception.Message }"

:: 显示最近日志
echo.
echo [4/4] 最近日志 (最后5行):
echo.
echo === 前端日志 ===
pm2 logs rental-frontend --lines 5 --nostream
echo.
echo === 后端日志 ===
pm2 logs rental-backend --lines 5 --nostream

echo.
echo ==========================================
echo   检查完成！
echo ==========================================
echo.
pause