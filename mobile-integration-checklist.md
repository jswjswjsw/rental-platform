# 移动端集成检查清单

## 🔧 配置文件修改需求

### 1. Vite配置适配 (qianduan/vite.config.js)
**问题**: 当前代理配置仅适用于开发环境，移动端需要直接访问API
**解决方案**: 
```javascript
// 需要添加环境变量支持
const isMobile = process.env.VITE_MOBILE === 'true';

export default defineConfig({
  // 移动端构建时需要不同的base路径
  base: isMobile ? './' : '/',
  
  // 移动端不需要代理
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: isMobile ? {} : {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### 2. API基础URL配置 (src/utils/api.js)
**问题**: 需要检查API配置是否支持移动端
**建议**: 创建环境变量区分开发/生产/移动端

### 3. Element Plus移动端适配
**潜在问题**: Element Plus主要为桌面端设计
**建议**: 
- 考虑添加 `@element-plus/mobile` 或 `vant` 作为移动端组件库
- 或者创建移动端专用组件覆盖

## 📱 移动端特有配置需求

### 1. 权限声明文件
需要创建以下配置文件：
- `capacitor.config.ts` - Capacitor主配置
- `android/app/src/main/AndroidManifest.xml` - Android权限
- `ios/App/App/Info.plist` - iOS权限

### 2. 构建脚本更新
需要在package.json中添加移动端构建命令：
```json
{
  "scripts": {
    "build:mobile": "VITE_MOBILE=true vite build",
    "cap:sync": "cap sync",
    "cap:android": "cap open android",
    "cap:ios": "cap open ios"
  }
}
```

## 🚨 潜在技术风险

### 1. CORS问题
**风险**: 移动端请求可能被CORS策略阻止
**预防**: 后端需要添加Capacitor相关的origin

### 2. 文件上传兼容性
**风险**: 当前文件上传可能不兼容移动端
**检查点**: 
- 头像上传功能
- 资源图片上传功能
- 需要适配Capacitor Camera API

### 3. 路由配置
**风险**: Vue Router的history模式在移动端可能有问题
**建议**: 移动端使用hash模式

### 4. 本地存储
**风险**: localStorage在某些移动端环境可能不可用
**建议**: 使用Capacitor Preferences API

## ✅ 实施优先级

### 高优先级 (必须解决)
1. ✅ API配置适配
2. ✅ 构建配置修改
3. ✅ 权限配置文件
4. ✅ CORS后端配置

### 中优先级 (影响体验)
1. 🔄 移动端UI组件适配
2. 🔄 触摸交互优化
3. 🔄 响应式布局调整

### 低优先级 (功能增强)
1. ⏳ 原生功能集成
2. ⏳ 推送通知
3. ⏳ 离线支持

## 🧪 测试策略

### 开发阶段测试
1. Chrome DevTools移动端模拟
2. 浏览器响应式测试
3. 触摸事件测试

### 设备测试
1. Android模拟器测试
2. iOS模拟器测试 (如有Mac)
3. 真机测试

### 功能测试重点
1. 用户登录/注册
2. 资源浏览和搜索
3. 图片上传功能
4. 订单流程
5. 评价系统

## 📋 下一步行动计划

1. **立即执行**: 检查并修改API配置文件
2. **本周内**: 安装Capacitor并完成基础配置
3. **下周**: 开始移动端UI适配
4. **月内**: 完成第一个可测试的移动端版本