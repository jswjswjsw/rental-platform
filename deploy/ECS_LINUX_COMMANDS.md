# ECS Linux服务器部署命令

## 🚀 请在ECS Linux服务器上执行以下命令

### 方法1：SSH连接到ECS服务器
```bash
# 从你的Windows机器连接到ECS
ssh root@116.62.44.24
```

### 方法2：使用阿里云控制台
1. 登录阿里云控制台
2. 进入ECS实例管理
3. 点击"远程连接"
4. 选择"VNC连接"或"Workbench"

## 📋 在ECS Linux上执行的命令

```bash
# 1. 确认当前位置并找到项目目录
pwd
ls -la

# 如果项目不存在，先克隆
if [ ! -d "rental-platform" ]; then
    git clone https://github.com/jswjswjsw/rental-platform.git
fi

# 进入项目目录
cd rental-platform || { echo "项目目录不存在"; exit 1; }

# 2. 拉取最新代码
git pull origin main || { echo "代码拉取失败"; exit 1; }

# 3. 恢复阿里云RDS配置
cd houduan

# 备份现有配置（如果存在）
[ -f .env ] && cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 恢复阿里云RDS配置
if [ -f .env.backup ]; then
    cp .env.backup .env
    echo "✅ 已恢复阿里云RDS配置"
else
    echo "⚠️ .env.backup不存在，请手动配置.env文件"
fi

# 4. 安装后端依赖
npm install
if [ $? -eq 0 ]; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi

# 5. 安装前端依赖
cd ../qianduan
npm install
if [ $? -eq 0 ]; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 6. 构建前端
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi

# 7. 返回根目录
cd ..

# 8. 检查PM2状态
pm2 list

# 9. 重启服务
pm2 restart rental-backend
pm2 restart rental-frontend

# 10. 检查服务状态
pm2 status

# 11. 验证API
curl http://localhost:3000/api/health

# 12. 验证前端
curl http://localhost:8080
```

## 🔧 如果PM2服务不存在，创建新服务

```bash
# 安装PM2（如果没有）
npm install -g pm2

# 启动后端服务
pm2 start houduan/index.js --name rental-backend

# 安装serve（如果没有）
npm install -g serve

# 启动前端服务
pm2 start "serve -s qianduan/dist -l 8080" --name rental-frontend

# 保存PM2配置
pm2 save
pm2 startup
```

## 🧪 验证部署结果

```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs rental-backend
pm2 logs rental-frontend

# 测试API
curl http://localhost:3000/api/health

# 测试前端
curl -I http://localhost:8080
```

## 🌐 访问测试

1. 在浏览器中访问：http://116.62.44.24:8080
2. 登录用户账号
3. 创建订单并进入支付页面
4. 打开浏览器开发者工具(F12)
5. 点击支付按钮
6. 查看Console应该显示：`🔄 支付按钮被点击`

## 🚨 常见问题解决

### 如果端口被占用
```bash
# 查看端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080

# 杀死占用进程
kill -9 <PID>
```

### 如果权限问题
```bash
# 修改文件权限
chmod -R 755 /path/to/project
chown -R $USER:$USER /path/to/project
```

### 如果依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules
npm install
```

---

**重要提醒：** 
- 上述命令需要在ECS Linux服务器上执行，不是在Windows本地
- 如果你现在在Windows本地，需要先SSH连接到ECS服务器