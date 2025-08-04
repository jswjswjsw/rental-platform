# ECS服务器部署指南

## 🚀 更新支付功能修复到ECS

### 步骤1：连接到ECS服务器
```bash
# 使用SSH连接到你的ECS服务器
ssh root@YOUR_ECS_IP
# 或者使用你的用户名
ssh your_username@YOUR_ECS_IP

# 替换 YOUR_ECS_IP 为你的实际ECS公网IP地址
```

### 步骤2：进入项目目录
```bash
cd /path/to/your/project
# 例如：cd /root/rental-platform 或 cd /home/user/trade
```

### 步骤3：拉取最新代码
```bash
# 拉取最新的代码更新
git pull origin main

# 如果有冲突，先备份本地修改
git stash
git pull origin main
git stash pop
```

### 步骤4：检查更新的文件
```bash
# 查看最近的提交
git log --oneline -5

# 查看修改的文件
git show --name-only HEAD
```

### 步骤5：验证环境变量
```bash
# 检查必需的环境变量
cd houduan
node -e "
require('dotenv').config();
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ 缺少环境变量:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ 环境变量配置完整');
}
"
```

### 步骤6：恢复阿里云RDS配置
由于我们在本地修改了数据库配置为localhost，需要在ECS上恢复阿里云RDS配置：

```bash
# 进入后端目录
cd houduan

# 恢复阿里云RDS配置
cp .env.backup .env

# 或者手动编辑.env文件
nano .env
```

确保.env文件包含正确的阿里云RDS配置：
```env
# 数据库配置 - 阿里云RDS
DB_HOST=your-rds-endpoint.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-secure-password
DB_NAME=rental_platform
DB_SSL=false

# ⚠️ 安全警告：请使用实际的数据库凭据替换上述占位符

# 其他配置保持不变...
```

### 步骤7：重启服务

#### 方法1：使用PM2重启（推荐）
```bash
# 查看当前PM2服务列表
pm2 list

# 重启后端服务（根据实际服务名调整）
pm2 restart rental-backend

# 重启前端服务（根据实际服务名调整）
pm2 restart rental-frontend

# 查看服务状态
pm2 status
```

#### 方法2：手动重启
```bash
# 停止现有服务
pkill -f "node.*houduan"
pkill -f "npm.*run.*dev"

# 启动后端服务
cd houduan
nohup npm run dev > ../logs/backend.log 2>&1 &

# 启动前端服务
cd ../qianduan
nohup npm run dev > ../logs/frontend.log 2>&1 &
```

### 步骤8：验证服务状态
```bash
# 检查服务是否正常运行
curl http://localhost:3000/api/health
curl http://localhost:8080

# 查看服务日志
tail -f logs/backend.log
tail -f logs/frontend.log

# 或者使用PM2查看日志
pm2 logs rental-backend
pm2 logs rental-frontend
```

### 步骤9：测试支付功能
1. 打开浏览器访问：http://YOUR_ECS_IP:8080
2. 登录用户账号
3. 创建订单并进入支付页面
4. 打开浏览器开发者工具(F12)
5. 点击支付按钮，查看Console日志：
   ```
   🔄 支付按钮被点击 {paymentType: "rent", orderId: "123", paying: false}
   📝 开始创建支付订单 {orderId: "123", paymentType: "rent"}
   ```

## 🔧 故障排除

### 如果git pull失败：
```bash
# 查看状态
git status

# 如果有未提交的修改
git stash
git pull
git stash pop

# 如果有冲突，手动解决后
git add .
git commit -m "resolve conflicts"
```

### 如果服务启动失败：
```bash
# 检查端口占用
netstat -tlnp | grep :3000
netstat -tlnp | grep :8080

# 杀死占用端口的进程
kill -9 <PID>

# 检查依赖是否完整
cd houduan && npm install
cd ../qianduan && npm install
```

### 如果数据库连接失败：
```bash
# 检查.env配置
cat houduan/.env

# 测试数据库连接
cd houduan
node -e "
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'your-rds-endpoint.mysql.rds.aliyuncs.com',
  user: 'root',
  password: 'your-secure-password',
  database: 'rental_platform',
  timeout: 10000
});
conn.connect(err => {
  if (err) console.error('连接失败:', err);
  else console.log('连接成功');
  conn.end();
});
"
```

## 📊 部署检查清单

- [ ] 代码成功拉取到ECS
- [ ] .env文件配置正确（阿里云RDS）
- [ ] 后端服务启动成功 (端口3000)
- [ ] 前端服务启动成功 (端口8080)
- [ ] 数据库连接正常
- [ ] API健康检查通过
- [ ] 支付按钮可以点击
- [ ] 浏览器控制台有调试日志
- [ ] 网络请求正常发送

## 🎉 部署完成

如果所有步骤都成功完成，支付功能应该已经修复。现在用户点击支付按钮时：

1. ✅ 按钮会正常响应
2. ✅ 控制台会显示调试日志
3. ✅ 会发送API请求到后端
4. ✅ 在开发环境会模拟支付成功

---

**部署时间：** $(date)  
**修复内容：** 支付按钮无响应问题  
**主要修改：** 环境变量使用方式 + 调试日志