# 阿里云部署配置文档

## 🚨 404错误解决方案

### 问题描述
访问Vue应用的路由（如 `/resources`、`/login` 等）时出现404错误。

### 原因分析
Vue单页应用(SPA)使用前端路由，当用户直接访问路由时，服务器找不到对应的物理文件。

### 解决方案

#### 方案1：使用Node.js生产服务器（推荐）

1. **运行部署脚本**
```cmd
deploy-production.bat
```

2. **或手动部署**
```cmd
# 构建前端
cd qianduan
npm run build
cd ..

# 安装代理依赖
npm install http-proxy-middleware

# 启动后端服务
cd houduan
start cmd /k "npm run dev"
cd ..

# 启动生产服务器
node production-server.js
```

3. **访问测试**
- 主页：http://你的ECS公网IP
- 资源页：http://你的ECS公网IP/resources
- 登录页：http://你的ECS公网IP/login

#### 方案2：使用IIS（Windows ECS）

1. **安装IIS URL重写模块**
2. **在dist目录创建web.config**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Handle History Mode and hash fallback" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## ECS环境变量配置

在Windows ECS上，编辑 `houduan\.env` 文件：

```env
# 数据库配置 - 阿里云RDS
DB_HOST=rm-bp1f62b28m6dxaqhf.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=rental_platform
DB_PASSWORD=你在RDS中设置的密码
DB_NAME=rental_platform

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=production

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 部署命令

在ECS的项目目录中执行：

```cmd
# 进入后端目录
cd houduan

# 安装依赖
npm install

# 测试连接
node -e "require('./config/database').testConnection()"

# 启动服务
npm start
```

## 安全组配置

确保ECS安全组开放以下端口：
- 22 (SSH)
- 3000 (后端API)
- 80 (HTTP)
- 443 (HTTPS)

## 域名配置（可选）

1. 购买域名
2. 配置DNS解析指向ECS公网IP
3. 配置SSL证书

## 前端部署

### 方法1：同一台ECS
```cmd
cd qianduan
npm install
npm run build
# 配置IIS或nginx托管dist文件夹
```

### 方法2：OSS + CDN
1. 创建OSS存储桶
2. 上传构建后的文件
3. 配置CDN加速
```

## 监控和维护

- 使用PM2管理Node.js进程
- 配置日志轮转
- 设置自动重启
- 监控资源使用情况