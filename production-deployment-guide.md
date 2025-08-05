# 生产环境部署指南

## 🚨 重要提醒
**不要在生产环境中直接使用 Vite 开发服务器！**

## ✅ 正确的生产部署流程

### 1. 构建前端应用
```bash
cd qianduan
npm run build
```
这会在 `qianduan/dist/` 目录生成优化后的静态文件。

### 2. 使用生产级 Web 服务器

#### 方案A: 使用 Nginx (推荐)
```nginx
server {
    listen 80;
    server_name 116.62.44.24;
    
    # 前端静态文件
    location / {
        root /path/to/qianduan/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 方案B: 使用 PM2 + serve
```bash
# 安装 serve
npm install -g serve

# 使用 PM2 启动
pm2 start "serve -s qianduan/dist -l 8080" --name frontend
```

### 3. 安全配置
- 使用 HTTPS (SSL/TLS)
- 配置防火墙规则
- 设置适当的 CORS 策略
- 启用 Gzip 压缩

## 🔧 开发环境配置
开发时使用：
```bash
# 前端开发服务器
cd qianduan && npm run dev

# 后端开发服务器  
cd houduan && npm run dev
```

Vite 配置应保持：
```javascript
server: {
  host: '0.0.0.0', // 允许局域网访问
  port: 8080
}
```

## 📋 部署检查清单
- [ ] 前端已构建 (`npm run build`)
- [ ] 使用生产级 Web 服务器
- [ ] 配置反向代理到后端 API
- [ ] 启用 HTTPS
- [ ] 配置防火墙
- [ ] 设置监控和日志