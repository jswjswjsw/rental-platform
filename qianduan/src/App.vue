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
    
    <!-- 应用底部信息 -->
    <AppFooter />
  </div>
</template>

<script setup>
/**
 * 根组件脚本
 * 
 * 使用Vue3 Composition API
 * 导入布局组件：头部导航和底部信息
 */
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 应用启动时检查认证状态
onMounted(async () => {
  await userStore.checkAuth()
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