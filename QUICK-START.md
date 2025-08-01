# 🚀 快速启动指南

## 一键启动所有服务

```bash
# 方法1：使用启动脚本（推荐）
scripts\deployment\start-all-services.bat

# 方法2：手动启动
cd houduan
pm2 start index.js --name rental-backend
cd ../qianduan
pm2 serve dist 8080 --name rental-frontend --spa
pm2 status
```

## 常用操作

### 🔄 重启服务
```bash
scripts\deployment\restart-services.bat
```

### 🧹 清理端口
```bash
scripts\deployment\clear-ports.bat
```

### 📊 查看状态
```bash
pm2 status
pm2 logs
```

### 🌐 访问地址
- 前端: http://116.62.44.24:8080
- 后端: http://116.62.44.24:3000

## 故障排除

### 网络连接失败
1. 检查后端服务是否启动: `pm2 status`
2. 如果没有启动: `cd houduan && pm2 start index.js --name rental-backend`
3. 检查端口占用: `netstat -ano | findstr :3000`

### 端口被占用
```bash
scripts\deployment\clear-ports.bat
```

### 服务无响应
```bash
pm2 restart all
```