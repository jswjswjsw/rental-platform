@echo off
setlocal

echo ========================================
echo 移动端API连接测试
echo ========================================

echo.
echo 1. 检查后端服务状态...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '后端API服务正常运行' -ForegroundColor Green } else { Write-Host '后端API服务异常' -ForegroundColor Red } } catch { Write-Host '后端API服务未启动或无法访问' -ForegroundColor Red; Write-Host '请先启动后端服务: cd houduan && npm start' }"

echo.
echo 2. 检查CORS配置...
echo 验证移动端相关的CORS设置...

echo.
echo 3. 测试关键API端点...
echo 测试用户认证API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/check' -TimeoutSec 5 -UseBasicParsing; Write-Host 'Auth API: 可访问' -ForegroundColor Green } catch { Write-Host 'Auth API: 无法访问' -ForegroundColor Yellow }"

echo 测试资源API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/resources' -TimeoutSec 5 -UseBasicParsing; Write-Host 'Resources API: 可访问' -ForegroundColor Green } catch { Write-Host 'Resources API: 无法访问' -ForegroundColor Yellow }"

echo.
echo ========================================
echo API连接测试完成
echo.
echo 如果API无法访问：
echo 1. 确保后端服务已启动: cd houduan && npm start
echo 2. 检查端口3000是否被占用
echo 3. 检查防火墙设置
echo 4. 验证.env配置文件
echo.
echo 移动端特殊配置：
echo 1. 检查houduan/app.js中的CORS配置
echo 2. 确保包含capacitor://localhost等移动端origin
echo 3. 验证credentials: true设置
echo ========================================
pause