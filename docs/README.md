# 闲置资源租赁平台

> 一个基于现代Web技术栈构建的完整闲置资源租赁平台

## 📖 项目简介

这是一个功能完整的闲置资源租赁平台，旨在帮助用户充分利用闲置物品，通过租赁的方式实现资源共享和价值最大化。平台采用前后端分离架构，提供了完整的用户管理、资源发布、订单管理、评价系统等功能。

### 🎯 项目目标

- **资源共享**：让闲置物品发挥更大价值
- **便民服务**：提供便捷的租赁服务体验
- **安全可靠**：完善的用户认证和交易保障
- **技术先进**：采用现代化的技术栈和开发模式

### 🌟 核心特性

- 🔐 **完整的用户系统**：注册、登录、个人信息管理
- 📦 **资源管理**：发布、编辑、搜索、分类管理
- 📋 **订单流程**：从申请到完成的完整订单生命周期
- ⭐ **评价系统**：用户互评，建立信任机制
- 📱 **响应式设计**：完美适配PC和移动设备
- 🔒 **安全保障**：JWT认证、数据验证、权限控制

## 功能特性

- 🔐 用户认证系统（注册、登录、JWT认证）
- 👤 用户管理（个人信息、头像上传）
- 📂 资源分类管理
- 📦 资源发布与管理（图片上传、搜索筛选）
- 📋 租赁订单管理
- ⭐ 评价系统
- 🔒 安全防护（Helmet、限流、CORS）
- 📁 文件上传处理

## 技术栈

### 前端技术
- **框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **样式**: CSS3 + 响应式设计

### 后端技术
- **框架**: Express.js
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **数据验证**: Joi
- **密码加密**: bcryptjs
- **安全防护**: Helmet, express-rate-limit

## 项目结构

```
├── qianduan/                    # 前端Vue应用
│   ├── src/
│   │   ├── components/          # 组件目录
│   │   │   ├── auth/           # 认证相关组件
│   │   │   ├── layout/         # 布局组件
│   │   │   └── resource/       # 资源相关组件
│   │   ├── views/              # 页面组件
│   │   ├── stores/             # Pinia状态管理
│   │   ├── utils/              # 工具函数
│   │   ├── router/             # 路由配置
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 入口文件
│   ├── index.html              # HTML模板
│   ├── package.json            # 前端依赖
│   └── vite.config.js          # Vite配置
├── houduan/                     # 后端API服务
│   ├── app.js                  # 主应用文件
│   ├── config/
│   │   └── database.js         # 数据库配置
│   ├── middleware/
│   │   ├── auth.js            # 认证中间件
│   │   └── upload.js          # 文件上传中间件
│   ├── routes/
│   │   ├── auth.js            # 认证路由
│   │   ├── users.js           # 用户管理路由
│   │   ├── categories.js      # 分类管理路由
│   │   ├── resources.js       # 资源管理路由
│   │   ├── orders.js          # 订单管理路由
│   │   └── reviews.js         # 评价管理路由
│   ├── uploads/               # 文件上传目录
│   ├── package.json           # 后端依赖
│   └── .env                   # 环境配置
├── shujuku/
│   └── init.sql               # 数据库初始化脚本
├── start-all.bat              # 一键启动脚本
└── README.md                  # 项目说明
```

## 快速开始

### 方式一：一键启动（推荐）

```bash
# Windows用户直接双击运行
start-all.bat

# 或者在命令行中运行
./start-all.bat
```

这将自动启动前端和后端服务：
- 前端页面: http://localhost:8080
- 后端API: http://localhost:3000/api

### 方式二：分别启动

#### 1. 数据库设置

1. 确保MySQL服务已启动
2. 执行数据库初始化脚本：

```bash
mysql -u root -p < shujuku/init.sql
```

#### 2. 启动后端服务

```bash
cd houduan
npm install
npm run dev
```

#### 3. 启动前端服务

```bash
cd qianduan
npm install
npm run dev
```

#### 4. 环境配置

编辑 `houduan/.env` 文件，配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rental_platform

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 访问地址

- **前端应用**: http://localhost:8080
- **后端API**: http://localhost:3000/api
- **健康检查**: http://localhost:3000/api/health

## API 接口文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/password` - 修改密码

### 用户管理

- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/profile` - 更新个人信息
- `POST /api/users/avatar` - 上传头像
- `GET /api/users/:id/resources` - 获取用户发布的资源
- `GET /api/users/orders` - 获取用户订单

### 分类管理

- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类（需要认证）
- `PUT /api/categories/:id` - 更新分类（需要认证）
- `DELETE /api/categories/:id` - 删除分类（需要认证）

### 资源管理

- `GET /api/resources` - 获取资源列表（支持搜索筛选）
- `GET /api/resources/:id` - 获取资源详情
- `POST /api/resources` - 发布资源（需要认证）
- `PUT /api/resources/:id` - 更新资源（需要认证）
- `DELETE /api/resources/:id` - 删除资源（需要认证）

### 订单管理

- `GET /api/orders` - 获取订单列表（需要认证）
- `GET /api/orders/:id` - 获取订单详情（需要认证）
- `POST /api/orders` - 创建订单（需要认证）
- `PUT /api/orders/:id/status` - 更新订单状态（需要认证）
- `DELETE /api/orders/:id` - 取消订单（需要认证）

### 评价管理

- `GET /api/reviews/resource/:resourceId` - 获取资源评价
- `GET /api/reviews/user/:userId` - 获取用户评价
- `POST /api/reviews` - 创建评价（需要认证）
- `PUT /api/reviews/:id` - 更新评价（需要认证）
- `DELETE /api/reviews/:id` - 删除评价（需要认证）

## 数据库表结构

### 用户表 (users)
- 用户基本信息、认证信息、状态管理

### 资源分类表 (categories)
- 分类名称、描述、图标、排序

### 资源表 (resources)
- 资源信息、图片、价格、位置、状态、评分

### 租赁订单表 (rental_orders)
- 订单信息、租赁时间、价格、状态

### 评价表 (reviews)
- 用户对资源的评价、评分、评价内容

## 安全特性

- JWT Token认证
- 密码bcrypt加密
- 请求频率限制
- CORS跨域配置
- Helmet安全头设置
- 文件上传安全检查
- SQL注入防护

## 开发说明

### 添加新的API接口

1. 在对应的路由文件中添加路由处理函数
2. 使用Joi进行数据验证
3. 添加适当的认证中间件
4. 处理错误和异常情况
5. 返回统一格式的响应

### 数据库操作

使用mysql2的Promise API进行数据库操作：

```javascript
const [results] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

### 文件上传

使用multer中间件处理文件上传，支持单文件和多文件上传。

## 部署建议

1. 修改JWT_SECRET为强密码
2. 设置NODE_ENV=production
3. 配置反向代理（Nginx）
4. 启用HTTPS
5. 设置数据库连接池
6. 配置日志系统
7. 设置监控和报警

## 许可证

MIT License
