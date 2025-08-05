import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rental.platform',
  appName: '闲置资源租赁',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // 允许Capacitor访问本地和远程资源
    allowNavigation: [
      'https://*',
      'http://localhost:*'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#409EFF",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: "#409EFF"
    },
    // 添加必要的权限配置
    Camera: {
      permissions: ['camera', 'photos']
    },
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;