#!/bin/bash

echo "=========================================="
echo "🚀 ECS快速部署脚本 - 支付功能修复"
echo "=========================================="

# 检查当前目录
if [ ! -f "package.json" ] && [ ! -d "houduan" ] && [ ! -d "qianduan" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "📍 当前目录: $(pwd)"
echo "⏰ 开始时间: $(date)"

# 安全检查
echo ""
echo "🔒 安全提醒："
echo "   此脚本包含数据库配置信息"
echo "   请确保在安全环境中运行"
echo "   建议设置环境变量 DB_PASSWORD 而非使用默认值"

# 检查是否为root用户（推荐）
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  建议使用root用户运行此脚本以避免权限问题"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤1：恢复阿里云RDS配置
echo ""
echo "🔧 步骤1：恢复数据库配置..."
cd houduan

if [ -f ".env.backup" ]; then
    cp .env.backup .env
    echo "✅ 已恢复阿里云RDS配置"
else
    echo "⚠️  .env.backup不存在，手动创建.env配置..."
    cat > .env << 'EOF'
# 数据库配置 - 阿里云RDS
DB_HOST=rm-bp1sva9582w011209.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=root
DB_PASSWORD=${DB_PASSWORD:-Mysql_11010811}
DB_NAME=rental_platform
DB_SSL=false

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=production

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# 微信支付配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key
WECHAT_NOTIFY_URL=http://\$(curl -s ifconfig.me):3000/api/payments/wechat/notify
EOF
    echo "✅ 已创建.env配置文件"
fi

# 步骤2：安装后端依赖
echo ""
echo "📦 步骤2：安装后端依赖..."
if npm install; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi

# 步骤3：安装前端依赖
echo ""
echo "📦 步骤3：安装前端依赖..."
cd ../qianduan
if npm install; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 步骤4：构建前端
echo ""
echo "🏗️  步骤4：构建前端项目..."
if npm run build; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi

# 步骤5：检查PM2状态
echo ""
echo "🔍 步骤5：检查PM2服务状态..."
cd ..

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    npm install -g pm2
fi

# 检查现有服务
pm2 list

# 步骤6：重启服务
echo ""
echo "🔄 步骤6：重启服务..."

# 尝试重启现有服务
if pm2 restart rental-backend 2>/dev/null; then
    echo "✅ 后端服务重启成功"
else
    echo "⚠️  后端服务不存在，启动新服务..."
    if pm2 start houduan/index.js --name rental-backend; then
        echo "✅ 后端服务启动成功"
    else
        echo "❌ 后端服务启动失败"
        exit 1
    fi
fi

if pm2 restart rental-frontend 2>/dev/null; then
    echo "✅ 前端服务重启成功"
else
    echo "⚠️  前端服务不存在，启动新服务..."
    # 检查serve是否安装
    if ! command -v serve &> /dev/null; then
        echo "📦 安装serve..."
        if ! npm install -g serve; then
            echo "❌ serve安装失败，请手动安装: npm install -g serve"
            exit 1
        fi
    fi
    if pm2 start "serve -s qianduan/dist -l 8080" --name rental-frontend; then
        echo "✅ 前端服务启动成功"
    else
        echo "❌ 前端服务启动失败"
        exit 1
    fi
fi

# 步骤7：验证服务
echo ""
echo "🧪 步骤7：验证服务状态..."

sleep 3

# 检查后端健康状态
echo "检查后端API..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 后端API正常"
else
    echo "❌ 后端API异常"
fi

# 检查前端服务
echo "检查前端服务..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
fi

# 显示PM2状态
echo ""
echo "📊 当前服务状态："
pm2 status

# 步骤8：显示访问信息
echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo "🌐 访问地址："
echo "   前端: http://116.62.44.24:8080"
echo "   后端API: http://116.62.44.24:3000/api"
echo "   健康检查: http://116.62.44.24:3000/api/health"
echo ""
echo "🔧 支付功能修复内容："
echo "   ✅ 修复环境变量使用错误"
echo "   ✅ 添加详细调试日志"
echo "   ✅ 优化错误处理"
echo ""
echo "🧪 测试支付功能："
echo "   1. 访问前端页面"
echo "   2. 登录用户账号"
echo "   3. 创建订单进入支付页面"
echo "   4. 打开浏览器开发者工具(F12)"
echo "   5. 点击支付按钮查看Console日志"
echo "   6. 应该看到: 🔄 支付按钮被点击"
echo ""
echo "📝 查看日志："
echo "   pm2 logs rental-backend"
echo "   pm2 logs rental-frontend"
echo ""
echo "⏰ 完成时间: $(date)"
echo "=========================================="