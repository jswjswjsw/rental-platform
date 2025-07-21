# 🚀 租赁平台部署指南

## 方案3：免费平台部署（推荐）

使用 **Vercel（前端）+ Railway（后端+数据库）** 的组合部署。

### 📋 部署前准备

1. **GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/rental-platform.git
   git push -u origin main
   ```

### 🚄 Railway后端部署

#### 1. 创建Railway项目
- 访问 [Railway](https://railway.app)
- 使用GitHub账号登录
- 点击 "Start a New Project"

#### 2. 部署MySQL数据库
- 选择 "Provision MySQL"
- 等待数据库创建完成
- 记录连接信息（在Variables标签页）

#### 3. 部署后端服务
- 在同一项目中点击 "New Service"
- 选择 "GitHub Repo" → 选择你的仓库
- 设置根目录为 `houduan`

#### 4. 配置环境变量
在Railway后端服务的Variables中添加：
```
DB_HOST=你的MySQL主机地址
DB_PORT=你的MySQL端口
DB_USER=你的MySQL用户名
DB_PASSWORD=你的MySQL密码
DB_NAME=你的MySQL数据库名
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
```

#### 5. 初始化数据库
部署完成后，在Railway控制台的服务日志中查看数据库初始化结果。

### 🌐 Vercel前端部署

#### 1. 准备Vercel部署
- 访问 [Vercel](https://vercel.com)
- 使用GitHub账号登录

#### 2. 导入项目
- 点击 "New Project"
- 选择你的GitHub仓库
- 设置根目录为 `qianduan`

#### 3. 配置环境变量
在Vercel项目设置的Environment Variables中添加：
```
VITE_API_BASE_URL=https://你的Railway后端域名
```

#### 4. 部署设置
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 🔧 部署后配置

#### 1. 更新前端API地址
部署完成后，将Railway提供的后端域名更新到：
- `qianduan/.env.production` 文件
- Vercel环境变量中

#### 2. 测试部署
- 访问Vercel提供的前端域名
- 测试用户注册、登录功能
- 测试资源发布、浏览功能
- 测试订单和收藏功能

### 📱 域名配置（可选）

#### Railway自定义域名
- 在Railway服务设置中添加自定义域名
- 配置DNS记录

#### Vercel自定义域名
- 在Vercel项目设置中添加域名
- 配置DNS记录

### 🔍 故障排除

#### 常见问题
1. **数据库连接失败**
   - 检查Railway环境变量配置
   - 查看服务日志

2. **前端API调用失败**
   - 检查CORS配置
   - 确认API地址正确

3. **构建失败**
   - 检查package.json依赖
   - 查看构建日志

#### 调试命令
```bash
# 本地测试生产构建
cd qianduan
npm run build
npm run preview

# 测试后端连接
node test-connection.js
```

### 💰 费用说明

- **Railway**: 免费额度每月500小时运行时间
- **Vercel**: 免费额度每月100GB带宽
- **总成本**: 个人项目完全免费

### 🎉 部署完成

恭喜！你的租赁平台已经成功部署到云端，可以通过以下地址访问：
- 前端：https://你的项目名.vercel.app
- 后端：https://你的项目名.up.railway.app

现在你可以分享给朋友使用了！🎊