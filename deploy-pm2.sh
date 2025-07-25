#!/bin/bash

echo "=== 使用PM2部署租赁平台 ==="

# 1. 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    npm install -g pm2
fi

# 2. 创建日志目录
echo "创建日志目录..."
mkdir -p logs

# 3. 停止现有服务
echo "停止现有服务..."
pm2 delete all 2>/dev/null || true

# 4. 构建前端
echo "构建前端项目..."
cd qianduan
npm run build
cd ..

# 5. 启动服务
echo "启动PM2服务..."
pm2 start ecosystem.config.js

# 6. 保存PM2配置
echo "保存PM2配置..."
pm2 save

# 7. 显示服务状态
echo "=== 服务状态 ==="
pm2 status

echo "=== 部署完成 ==="
echo "访问地址: http://你的服务器IP:8080"
echo "查看日志: pm2 logs"
echo "监控服务: pm2 monit"