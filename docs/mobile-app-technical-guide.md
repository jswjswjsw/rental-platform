# 移动App技术实施指南

## 环境要求

### 开发环境
- Node.js >= 16.0.0
- npm >= 8.0.0
- Vue CLI 或 Vite (已有)

### 移动开发工具
- **Android**: Android Studio + Android SDK
- **iOS**: Xcode (仅macOS)
- **Capacitor CLI**: `npm install -g @capacitor/cli`

## 第一阶段：Capacitor集成

### 1. 安装Capacitor
```bash
cd qianduan
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### 2. 初始化Capacitor
```bash
npx cap init "租赁平台" "com.rental.platform"
```

### 3. 配置capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rental.platform',
  appName: '租赁平台',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;
```

## 第二阶段：移动端适配

### 1. 响应式布局调整
- 修改Element Plus组件尺寸
- 调整触摸目标大小 (最小44px)
- 优化表格和列表在小屏幕上的显示

### 2. 导航优化
```javascript
// 添加移动端导航组件
// src/components/layout/MobileNavigation.vue
```

### 3. API配置调整
```javascript
// src/utils/api.js 需要支持移动端请求
const baseURL = import.meta.env.PROD 
  ? 'https://your-api-domain.com/api'
  : 'http://localhost:3000/api';
```

## 第三阶段：原生功能集成

### 1. 相机功能
```bash
npm install @capacitor/camera
```

### 2. 地理位置
```bash
npm install @capacitor/geolocation
```

### 3. 推送通知
```bash
npm install @capacitor/push-notifications
```

### 4. 本地存储
```bash
npm install @capacitor/preferences
```

## 第四阶段：构建和部署

### 1. 构建Web资源
```bash
npm run build
```

### 2. 同步到移动平台
```bash
npx cap add android
npx cap add ios
npx cap sync
```

### 3. 打开IDE进行最终构建
```bash
npx cap open android
npx cap open ios
```

## 潜在问题和解决方案

### 1. CORS问题
移动端请求可能遇到CORS问题，需要在后端配置：
```javascript
// houduan/app.js
app.use(cors({
  origin: ['capacitor://localhost', 'https://localhost'],
  credentials: true
}));
```

### 2. 文件上传适配
移动端文件上传需要特殊处理：
```javascript
// 使用Capacitor Camera API替代传统文件选择
import { Camera, CameraResultType } from '@capacitor/camera';
```

### 3. 权限管理
需要在配置文件中声明所需权限：
- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/App/App/Info.plist`

## 测试策略

### 1. 浏览器测试
```bash
npm run dev
# 使用Chrome DevTools移动端模拟
```

### 2. 设备测试
```bash
npx cap run android
npx cap run ios
```

### 3. 热重载开发
```bash
npx cap run android --livereload --external
```

## 性能优化建议

1. **懒加载**: 路由和组件懒加载
2. **图片优化**: 使用WebP格式，实现图片懒加载
3. **缓存策略**: 利用Capacitor的本地存储
4. **包大小**: 分析和优化打包体积

## 发布准备

### Android
1. 生成签名密钥
2. 配置build.gradle
3. 构建release APK

### iOS
1. 配置开发者账号
2. 设置证书和描述文件
3. 构建IPA文件

## 维护和更新

### 热更新支持
考虑集成Capacitor Live Updates插件，支持应用内容热更新。

### 版本管理
建立移动端版本发布流程，与Web端保持同步。