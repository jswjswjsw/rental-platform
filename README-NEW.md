# 🏠 闲置资源租赁平台

一个功能完整的闲置物品租赁平台，基于现代Web技术栈构建，支持用户注册、物品发布、租赁管理等核心功能。

## ✨ 功能特性

### 🔐 用户系统
- 用户注册与登录
- JWT身份验证
- 个人资料管理
- 权限控制

### 📦 物品管理
- 物品发布与编辑
- 分类管理
- 图片上传
- 搜索与筛选

### 💰 租赁系统
- 租赁订单创建
- 订单状态管理
- 价格计算
- 租期管理

### ⭐ 互动功能
- 物品收藏
- 评价系统
- 用户评分
- 消息通知

## 🛠️ 技术栈

### 前端技术
- **Vue 3** - 渐进式JavaScript框架
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Element Plus** - UI组件库
- **Axios** - HTTP客户端
- **Vite** - 构建工具

### 后端技术
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **MySQL** - 关系型数据库
- **JWT** - 身份验证
- **Multer** - 文件上传
- **Helmet** - 安全中间件

### 部署工具
- **PM2** - 进程管理器
- **Nginx** - 反向代理（可选）

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- MySQL >= 5.7
- npm >= 6.0.0

### 一键部署（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd rental-platform

# 运行一键部署脚本
deploy-final.bat
```

### 手动安装

```bash
# 1. 安装根目录依赖
npm install

# 2. 安装前端依赖
cd qianduan
npm install
cd ..

# 3. 安装后端依赖
cd houduan
npm install
cd ..

# 4. 构建前端
npm run build

# 5. 启动服务
npm run pm2:start
```

## ⚙️ 配置说明

### 数据库配置

编辑 `houduan/.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=rental_platform

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=production
```

### 阿里云ECS部署

1. **安全组配置**
   - 开放端口：8080（前端）、3000（后端）
   - 协议类型：TCP
   - 授权对象：0.0.0.0/0

2. **防火墙配置**
   ```bash
   # Windows防火墙（脚本自动配置）
   netsh advfirewall firewall add rule name="Rental Platform 8080" dir=in action=allow protocol=TCP localport=8080
   netsh advfirewall firewall add rule name="Rental Platform 3000" dir=in action=allow protocol=TCP localport=3000
   ```

## 🌐 访问地址

- **前端应用**: http://your-server-ip:8080
- **后端API**: http://your-server-ip:3000/api
- **健康检查**: http://your-server-ip:3000/api/health

## 🎯 使用指南

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 前端开发服务器
cd qianduan && npm run dev

# 后端开发服务器
cd houduan && npm run dev
```

### 生产环境

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start

# 使用PM2管理
npm run pm2:start    # 启动服务
npm run pm2:restart  # 重启服务
npm run pm2:stop     # 停止服务
npm run pm2:logs     # 查看日志
npm run pm2:monit    # 监控面板
```

### 常用命令

```bash
# 快速重启
npm run restart

# 检查服务状态
npm run status

# 完整部署
npm run deploy
```

## 🔧 故障排除

### 常见问题

1. **404错误**
   - 确保前端已构建：`npm run build`
   - 检查生产服务器配置
   - 验证路由配置

2. **数据库连接失败**
   - 检查 `.env` 配置
   - 确认数据库服务运行
   - 验证网络连接

3. **端口被占用**
   - 检查端口占用：`netstat -ano | findstr :8080`
   - 停止冲突进程：`taskkill /f /pid <PID>`

4. **PM2服务异常**
   - 查看日志：`pm2 logs`
   - 重启服务：`pm2 restart all`
   - 重新部署：`pm2 delete all && pm2 start ecosystem.config.js`

### 日志查看

```bash
# PM2日志
pm2 logs                    # 所有日志
pm2 logs rental-frontend    # 前端日志
pm2 logs rental-backend     # 后端日志

# 系统日志
dir logs\                   # 查看日志文件
```

## 📄 许可证

本项目采用 MIT 许可证

## 👥 作者

开发团队

---

**⭐ 如果这个项目对你有帮助，请给它一个星标！**