# 移动App开发指南

## 方案2：Cordova混合App开发

### 安装Cordova
```bash
npm install -g cordova
```

### 创建Cordova项目
```bash
# 创建新的Cordova项目
cordova create rental-app com.example.rental "闲置租赁"
cd rental-app

# 添加平台支持
cordova platform add android
cordova platform add ios
```

### 集成Web应用
1. 构建Vue应用：
```bash
cd qianduan
npm run build
```

2. 复制构建文件到Cordova：
```bash
# 将dist目录内容复制到rental-app/www/
```

3. 配置config.xml：
```xml
<widget id="com.example.rental" version="1.0.0">
    <name>闲置租赁</name>
    <description>闲置资源租赁平台移动应用</description>
    <content src="index.html" />
    <access origin="*" />
    <allow-navigation href="*" />
</widget>
```

### 构建App
```bash
# Android
cordova build android

# iOS (需要Mac)
cordova build ios
```

## 方案3：Capacitor - 现代混合App

### 安装Capacitor
```bash
cd qianduan
npm install @capacitor/core @capacitor/cli
npx cap init "闲置租赁" "com.example.rental"
```

### 添加平台
```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### 构建和同步
```bash
npm run build
npx cap sync
```

### 打开IDE开发
```bash
# Android Studio
npx cap open android

# Xcode
npx cap open ios
```

## 方案4：React Native/Flutter重写

### React Native
- 需要完全重写前端
- 使用React Native组件
- 可以复用后端API

### Flutter
- 需要学习Dart语言
- 完全重写前端
- 性能最好的方案

## 方案5：Electron桌面应用

### 安装Electron
```bash
cd qianduan
npm install electron --save-dev
```

### 配置main.js
```javascript
const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  win.loadURL('http://localhost:8080')
}

app.whenReady().then(createWindow)
```

### 打包桌面应用
```bash
npm install electron-builder --save-dev
npm run electron:build
```