# ECS HTTP部署指南

## 🚀 使用HTTP方式更新代码到ECS

### 方法1：使用HTTP克隆（如果是新部署）
```bash
# 连接到ECS服务器
ssh root@116.62.44.24

# 克隆项目（HTTP方式）
git clone https://github.com/jswjswjsw/rental-platform.git
cd rental-platform
```

### 方法2：更新现有项目（推荐）
```bash
# 连接到ECS服务器
ssh root@116.62.44.24

# 进入项目目录
cd /path/to/your/project

# 设置远程仓库为HTTP（如果之前是SSH）
git remote set-url origin https://github.com/jswjswjsw/rental-platform.git

# 拉取最新代码
git pull origin main
```

### 方法3：直接下载ZIP文件
```bash
# 连接到ECS服务器
ssh root@116.62.44.24

# 下载最新代码的ZIP文件
wget https://github.com/jswjswjsw/rental-platform/archive/refs/heads/main.zip

# 解压文件
unzip main.zip

# 重命名目录
mv rental-platform-main rental-platform

# 进入项目目录
cd rental-platform
```

### 方法4：使用curl下载特定文件
如果只需要更新特定文件，可以直接下载：

```bash
# 下载修复后的WechatPay组件
curl -o qianduan/src/components/payment/WechatPay.vue \
  https://raw.githubusercontent.com/jswjswjsw/rental-platform/main/qianduan/src/components/payment/WechatPay.vue

# 下载环境配置备份
curl -o houduan/.env.backup \
  https://raw.githubusercontent.com/jswjswjsw/rental-platform/main/houduan/.env.backup
```

## 🔧 部署步骤

### 1. 更新代码后的配置
```bash
# 进入项目目录
cd rental-platform

# 恢复阿里云RDS配置
cd houduan
cp .env.backup .env

# 或者手动创建.env文件
cat > .env << 'EOF'
# 数据库配置 - 阿里云RDS
DB_HOST=rm-bp1sva9582w011209.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Mysql_11010811
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
WECHAT_NOTIFY_URL=http://116.62.44.24:3000/api/payments/wechat/notify
EOF
```

### 2. 安装依赖
```bash
# 安装后端依赖
cd houduan
npm install

# 安装前端依赖
cd ../qianduan
npm install
```

### 3. 构建前端项目
```bash
# 在qianduan目录下构建生产版本
npm run build
```

### 4. 启动服务

#### 使用PM2（推荐）
```bash
# 安装PM2（如果还没安装）
npm install -g pm2

# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'rental-backend',
      script: './houduan/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'rental-frontend',
      script: 'serve',
      args: '-s qianduan/dist -l 8080',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
EOF

# 启动服务
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save
pm2 startup
```

#### 手动启动
```bash
# 启动后端
cd houduan
nohup npm start > ../logs/backend.log 2>&1 &

# 启动前端（使用serve）
npm install -g serve
cd ../qianduan
nohup serve -s dist -l 8080 > ../logs/frontend.log 2>&1 &
```

### 5. 配置Nginx（可选，用于反向代理）
```bash
# 安装Nginx
yum install -y nginx  # CentOS/RHEL
# 或
apt install -y nginx  # Ubuntu/Debian

# 创建Nginx配置
cat > /etc/nginx/conf.d/rental-platform.conf << 'EOF'
server {
    listen 80;
    server_name 116.62.44.24;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件上传
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 启动Nginx
systemctl start nginx
systemctl enable nginx
```

## 🧪 验证部署

### 1. 检查服务状态
```bash
# 检查PM2服务
pm2 status

# 检查端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080

# 检查服务响应
curl http://localhost:3000/api/health
curl http://localhost:8080
```

### 2. 测试支付功能
```bash
# 在浏览器中访问
echo "请在浏览器中访问: http://116.62.44.24"
echo "或者: http://116.62.44.24:8080"

# 测试API
curl -X GET http://116.62.44.24:3000/api/health
```

### 3. 查看日志
```bash
# PM2日志
pm2 logs rental-backend
pm2 logs rental-frontend

# 或者查看文件日志
tail -f logs/backend.log
tail -f logs/frontend.log
```

## 🔧 故障排除

### 如果HTTP拉取失败
```bash
# 检查网络连接
ping github.com

# 使用代理（如果需要）
git config --global http.proxy http://proxy-server:port
git config --global https.proxy https://proxy-server:port

# 或者直接下载ZIP
wget https://github.com/jswjswjsw/rental-platform/archive/refs/heads/main.zip
```

### 如果权限问题
```bash
# 修改文件权限
chmod -R 755 rental-platform
chown -R $USER:$USER rental-platform
```

### 如果端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :8080

# 杀死进程
kill -9 <PID>
```

## 📋 部署检查清单

- [ ] 代码成功下载到ECS
- [ ] .env文件配置正确（阿里云RDS）
- [ ] 依赖安装完成
- [ ] 前端项目构建成功
- [ ] 后端服务启动成功 (端口3000)
- [ ] 前端服务启动成功 (端口8080)
- [ ] API健康检查通过
- [ ] 支付页面可以访问
- [ ] 支付按钮有响应
- [ ] 浏览器控制台有调试日志

---

**部署方式：** HTTP  
**访问地址：** http://116.62.44.24  
**API地址：** http://116.62.44.24:3000/api