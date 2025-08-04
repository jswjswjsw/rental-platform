# ECS部署命令

## 🚀 在ECS服务器上执行以下命令：

```bash
# 1. 进入项目目录
cd /path/to/your/project

# 2. 给脚本执行权限
chmod +x quick-deploy-on-ecs.sh

# 3. 运行部署脚本
./quick-deploy-on-ecs.sh
```

## 📋 如果没有部署脚本，手动执行：

```bash
# 1. 恢复数据库配置
cd houduan
cp .env.backup .env

# 2. 安装依赖
npm install

# 3. 安装前端依赖并构建
cd ../qianduan
npm install
npm run build

# 4. 重启服务
cd ..
pm2 restart rental-backend
pm2 restart rental-frontend

# 5. 检查状态
pm2 status
curl http://localhost:3000/api/health
```

## 🧪 测试支付功能：

1. 访问：http://116.62.44.24:8080
2. 登录用户
3. 创建订单
4. 进入支付页面
5. 打开浏览器F12开发者工具
6. 点击支付按钮
7. 查看Console应该显示：`🔄 支付按钮被点击`

## 🔧 如果有问题：

```bash
# 查看服务日志
pm2 logs rental-backend
pm2 logs rental-frontend

# 重启所有服务
pm2 restart all

# 查看端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080
```