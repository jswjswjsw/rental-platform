# 项目设置指南

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/jswjswjsw/rental-platform.git
cd rental-platform
```

### 2. 环境配置

#### 后端配置
```bash
cd houduan
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息
```

#### 前端配置
```bash
cd qianduan
# 开发环境会自动使用 .env.development
# 生产环境会自动使用 .env.production
```

### 3. 安装依赖
```bash
# 后端依赖
cd houduan
npm install

# 前端依赖
cd ../qianduan
npm install
```

### 4. 数据库初始化

#### 方法1：使用完整初始化脚本（推荐新项目）
```bash
# 在MySQL中执行
mysql -h your_host -u your_user -p your_database < scripts/database/complete-init.sql
```

#### 方法2：使用迁移系统（推荐现有项目）
```bash
cd scripts/database
node migrations.js
```

### 5. 创建必要目录
```bash
mkdir houduan/uploads/resources
mkdir houduan/uploads/avatars
```

### 6. 启动服务

#### 开发环境
```bash
# 后端
cd houduan
npm run dev

# 前端
cd qianduan
npm run dev
```

#### 生产环境
```bash
# 使用PM2
scripts/deployment/start-all-services.bat
```

## 🔧 数据库迁移

### 自动迁移
项目包含自动迁移系统，会检查并执行必要的数据库结构更新：

```bash
cd scripts/database
node migrations.js
```

### 手动迁移
如果需要手动执行特定迁移：

```bash
# 创建favorites表
cd scripts/database
node create-favorites-table.js
```

## 📋 必需的数据库表

- `users` - 用户表
- `categories` - 分类表  
- `resources` - 资源表
- `rental_orders` - 订单表
- `reviews` - 评价表
- `favorites` - 收藏表 ⭐ 新增
- `migrations` - 迁移记录表

## 🚨 常见问题

### 1. "Table 'favorites' doesn't exist" 错误
```bash
# 执行迁移脚本
cd scripts/database
node migrations.js
```

### 2. 图片上传失败
```bash
# 确保上传目录存在
mkdir houduan/uploads/resources
mkdir houduan/uploads/avatars
```

### 3. 服务启动失败
```bash
# 检查环境变量配置
cat houduan/.env

# 检查数据库连接
cd scripts/testing
node test-db-connection.js
```

## 🔄 更新项目

当从Git拉取最新代码后：

```bash
# 1. 拉取代码
git pull origin main

# 2. 更新依赖
cd houduan && npm install
cd ../qianduan && npm install

# 3. 执行数据库迁移
cd ../scripts/database
node migrations.js

# 4. 重启服务
pm2 restart all
```

## 📞 技术支持

如果遇到问题，请检查：
1. 数据库连接配置
2. 环境变量设置
3. 必要目录是否存在
4. 数据库表结构是否完整