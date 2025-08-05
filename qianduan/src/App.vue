<!--
  应用根组件
  
  功能说明：
  - 定义应用的整体布局结构
  - 包含固定的头部导航和底部信息
  - 提供主内容区域用于路由视图渲染
  - 响应式布局适配不同屏幕尺寸
  
  布局结构：
  - AppHeader: 顶部导航栏（固定定位）
  - main: 主内容区域（路由视图容器）
  - AppFooter: 底部信息栏
  
  样式特性：
  - Flexbox布局确保页面占满视口
  - 为固定头部预留空间
  - 响应式设计支持移动端
-->
<template>
  <div id="app">
    <!-- 应用头部导航 -->
    <AppHeader />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 路由视图容器 -->
      <router-view />
    </main>
    
    <!-- 桌面端底部信息 -->
    <AppFooter v-if="!isMobile" />
    
    <!-- 移动端底部导航 -->
    <MobileNavigation v-if="isMobile" />
  </div>
</template>

<script setup>
/**
 * 根组件脚本
 * 
 * 使用Vue3 Composition API
 * 导入布局组件：头部导航和底部信息
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileNavigation from '@/components/mobile/MobileNavigation.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isMobile = ref(false)

// 窗口大小变化处理函数
const handleResize = () => {
  isMobile.value = Capacitor.isNativePlatform() || window.innerWidth <= 768
}

// 应用启动时检查认证状态和平台类型
onMounted(async () => {
  await userStore.checkAuth()
  
  // 检测移动端
  handleResize()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 添加移动端样式类
  if (isMobile.value) {
    document.body.classList.add('mobile-platform')
    // 动态导入移动端样式
    import('@/styles/mobile.css').catch(console.warn)
  } else {
    document.body.classList.add('web-platform')
  }
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 60px; /* 为固定头部留出空间 */
}
</style>