# 环境变量配置指南

## 🎯 建议改进

为了更好的配置管理，建议使用环境变量替代硬编码的IP地址：

### 1. 创建环境变量
```bash
# .env.production
VITE_API_BASE_URL=http://116.62.44.24:3000
VITE_UPLOAD_BASE_URL=http://116.62.44.24:3000/uploads
SERVER_HOST=116.62.44.24
```

### 2. 更新前端配置
```javascript
// qianduan/src/config/api.js
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL + '/api'
  }
  // 开发环境默认值
  return 'http://localhost:3000/api'
}
```

### 3. 更新后端CORS配置
```javascript
// houduan/app.js
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'http://localhost:8080',
      `http://${process.env.SERVER_HOST}:8080`,
      `http://${process.env.SERVER_HOST}`
    ]
  : true;
```

## 🔒 安全最佳实践

1. **不要在代码中硬编码敏感信息**
2. **使用环境变量管理配置**
3. **生产环境使用HTTPS**
4. **配置适当的CORS策略**