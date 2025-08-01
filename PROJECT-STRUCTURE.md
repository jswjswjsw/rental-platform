# 租赁平台项目结构

## 📁 目录结构

```
rental-platform/
├── 📁 houduan/                 # 后端代码
│   ├── config/                 # 数据库配置
│   ├── middleware/             # 中间件
│   ├── routes/                 # API路由
│   ├── uploads/                # 文件上传目录
│   ├── .env                    # 环境变量
│   └── index.js                # 后端入口文件
│
├── 📁 qianduan/                # 前端代码
│   ├── src/                    # 源代码
│   ├── dist/                   # 构建输出
│   ├── .env.development        # 开发环境配置
│   ├── .env.production         # 生产环境配置
│   └── package.json            # 前端依赖
│
├── 📁 scripts/                 # 脚本文件
│   ├── 📁 deployment/          # 部署相关脚本
│   │   ├── start-all-services.bat      # 启动所有服务
│   │   ├── restart-services.bat        # 重启服务
│   │   ├── deploy-frontend-complete.bat # 完整前端部署
│   │   ├── clear-ports.bat             # 清理端口占用
│   │   └── ...                         # 其他部署脚本
│   │
│   ├── 📁 testing/             # 测试脚本
│   │   ├── test-*.js           # 各种功能测试
│   │   ├── debug-*.js          # 调试脚本
│   │   └── quick-test.js       # 快速测试
│   │
│   ├── 📁 database/            # 数据库脚本
│   │   ├── *.sql               # SQL脚本
│   │   ├── init-*.js           # 数据库初始化
│   │   └── fix-image-data.js   # 数据修复
│   │
│   └── 📁 utilities/           # 工具脚本
│       ├── production-server*.js # 生产服务器
│       ├── serve-static.js     # 静态文件服务
│       └── fix-*.bat           # 修复工具
│
├── 📁 config/                  # 配置文件
│   ├── ecosystem*.config.js    # PM2配置
│   ├── nginx.conf              # Nginx配置
│   └── railway.toml            # Railway部署配置
│
├── 📁 docs/                    # 文档文件
│   ├── README*.md              # 项目说明
│   ├── DEPLOYMENT.md           # 部署文档
│   ├── mobile-app-setup.md     # 移动端设置
│   └── 项目完整说明文档.md      # 完整说明
│
├── 📁 shujuku/                 # 数据库文件
├── 📁 ziyuan/                  # 资源文件
└── 📁 node_modules/            # 依赖包
```

## 🚀 快速启动

### 开发环境
```bash
# 启动所有服务
scripts\deployment\start-all-services.bat

# 或者分别启动
cd houduan && pm2 start index.js --name rental-backend
cd qianduan && pm2 serve dist 8080 --name rental-frontend --spa
```

### 生产环境
```bash
# 完整部署
scripts\deployment\deploy-frontend-complete.bat

# 重启服务
scripts\deployment\restart-services.bat
```

## 🔧 常用命令

### 服务管理
```bash
pm2 status                    # 查看服务状态
pm2 logs                      # 查看所有日志
pm2 logs rental-backend       # 查看后端日志
pm2 logs rental-frontend      # 查看前端日志
pm2 restart all               # 重启所有服务
pm2 stop all                  # 停止所有服务
```

### 端口管理
```bash
scripts\deployment\clear-ports.bat    # 清理端口占用
netstat -ano | findstr :3000          # 查看3000端口
netstat -ano | findstr :8080          # 查看8080端口
```

## 📡 访问地址

- **前端页面**: http://116.62.44.24:8080
- **后端API**: http://116.62.44.24:3000
- **健康检查**: http://116.62.44.24:3000/api/health

## 🛠️ 维护工具

- **测试脚本**: `scripts/testing/` 目录下的各种测试工具
- **数据库工具**: `scripts/database/` 目录下的数据库管理工具
- **部署工具**: `scripts/deployment/` 目录下的部署脚本
- **实用工具**: `scripts/utilities/` 目录下的各种实用工具