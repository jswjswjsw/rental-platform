<template>
  <div class="mobile-nav" v-if="isMobile">
    <router-link 
      to="/" 
      class="mobile-nav-item"
      :class="{ active: $route.path === '/' }"
    >
      <el-icon class="icon"><House /></el-icon>
      <span>首页</span>
    </router-link>
    
    <router-link 
      to="/resources" 
      class="mobile-nav-item"
      :class="{ active: $route.path.includes('/resources') }"
    >
      <el-icon class="icon"><Grid /></el-icon>
      <span>资源</span>
    </router-link>
    
    <router-link 
      to="/publish" 
      class="mobile-nav-item"
      :class="{ active: $route.path === '/publish' }"
    >
      <el-icon class="icon"><Plus /></el-icon>
      <span>发布</span>
    </router-link>
    
    <router-link 
      to="/orders" 
      class="mobile-nav-item"
      :class="{ active: $route.path.includes('/orders') }"
    >
      <el-icon class="icon"><List /></el-icon>
      <span>订单</span>
    </router-link>
    
    <router-link 
      to="/profile" 
      class="mobile-nav-item"
      :class="{ active: $route.path.includes('/profile') }"
    >
      <el-icon class="icon"><User /></el-icon>
      <span>我的</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { House, Grid, Plus, List, User } from '@element-plus/icons-vue'

const isMobile = ref(false)

onMounted(() => {
  // 检测是否为移动端
  isMobile.value = Capacitor.isNativePlatform() || window.innerWidth <= 768
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    isMobile.value = Capacitor.isNativePlatform() || window.innerWidth <= 768
  })
})
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  color: #666;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.3s;
}

.mobile-nav-item.active {
  color: #409EFF;
}

.mobile-nav-item .icon {
  font-size: 20px;
  margin-bottom: 4px;
}
</style>