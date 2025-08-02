@echo off
echo 安装微信支付相关依赖...

cd houduan

echo 正在安装 wechatpay-axios-plugin...
npm install wechatpay-axios-plugin --save
if %errorlevel% neq 0 (
    echo ❌ wechatpay-axios-plugin 安装失败
    pause
    exit /b 1
)

echo 正在安装 xml2js...
npm install xml2js --save
if %errorlevel% neq 0 (
    echo ❌ xml2js 安装失败
    pause
    exit /b 1
)

echo ✅ 微信支付依赖安装完成！
echo 注意: crypto 模块是 Node.js 内置模块，无需安装

echo 验证安装结果...
npm list wechatpay-axios-plugin xml2js

pause