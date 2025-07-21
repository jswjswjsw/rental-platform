<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo" @click="$router.push('/')">
        <el-icon size="28" color="#409eff">
          <Box />
        </el-icon>
        <span>闲置租赁</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          @select="handleSelect"
          background-color="transparent"
          text-color="#333"
          active-text-color="#409eff"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/resources">找物品</el-menu-item>
          <el-menu-item index="/publish">发布物品</el-menu-item>
          <el-menu-item index="/orders">我的订单</el-menu-item>
        </el-menu>
      </nav>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索物品..."
          @keyup.enter="handleSearch"
          clearable
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 用户菜单 -->
      <div class="user-menu">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :src="userStore.user.avatar" :size="32">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.user.username }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="my-resources">
                  <el-icon><Box /></el-icon>
                  我的物品
                </el-dropdown-item>
                <el-dropdown-item command="my-favorites">
                  <el-icon><Star /></el-icon>
                  我的收藏
                </el-dropdown-item>
                <el-dropdown-item command="my-orders">
                  <el-icon><List /></el-icon>
                  我的订单
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="text" @click="showLoginDialog = true">登录</el-button>
          <el-button type="primary" @click="showRegisterDialog = true">注册</el-button>
        </template>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="showMobileMenu = true">
        <el-icon size="24"><Menu /></el-icon>
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="showMobileMenu"
      title="菜单"
      direction="rtl"
      size="280px"
    >
      <div class="mobile-menu">
        <div v-if="userStore.isLoggedIn" class="mobile-user-info">
          <el-avatar :src="userStore.user.avatar" :size="48">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="user-details">
            <div class="username">{{ userStore.user.username }}</div>
            <div class="user-email">{{ userStore.user.email }}</div>
          </div>
        </div>
        
        <el-menu
          :default-active="activeIndex"
          @select="handleMobileSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/resources">
            <el-icon><Search /></el-icon>
            <span>找物品</span>
          </el-menu-item>
          <el-menu-item index="/publish">
            <el-icon><Plus /></el-icon>
            <span>发布物品</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
          
          <template v-if="userStore.isLoggedIn">
            <el-menu-item index="/profile">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
            <el-menu-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </template>
          <template v-else>
            <el-menu-item @click="showLoginDialog = true">
              <el-icon><User /></el-icon>
              <span>登录</span>
            </el-menu-item>
            <el-menu-item @click="showRegisterDialog = true">
              <el-icon><UserFilled /></el-icon>
              <span>注册</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
    </el-drawer>

    <!-- 登录对话框 -->
    <el-dialog v-model="showLoginDialog" title="用户登录" width="400px">
      <LoginForm @success="handleLoginSuccess" />
    </el-dialog>

    <!-- 注册对话框 -->
    <el-dialog v-model="showRegisterDialog" title="用户注册" width="400px">
      <RegisterForm @success="handleRegisterSuccess" />
    </el-dialog>
  </header>
</template>

<!--
  应用头部导航组件
  
  功能说明：
  - 提供全站导航菜单
  - 用户登录状态显示和操作
  - 搜索功能入口
  - 响应式移动端菜单
  - 登录注册对话框
  
  组件特性：
  - 固定定位在页面顶部
  - 响应式设计适配移动端
  - 用户状态动态显示
  - 搜索功能集成
  - 移动端抽屉菜单
  
  交互功能：
  - 导航菜单点击跳转
  - 用户下拉菜单操作
  - 搜索关键词提交
  - 登录注册弹窗
  - 移动端菜单切换
-->

<script setup>
/**
 * 头部导航组件脚本
 * 
 * 功能实现：
 * - 导航菜单管理
 * - 用户状态管理
 * - 搜索功能处理
 * - 登录注册流程
 * - 移动端适配
 * 
 * 使用的Vue3特性：
 * - Composition API
 * - 响应式数据
 * - 计算属性
 * - 组件通信
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Box, Search, User, ArrowDown, Menu, House, Plus, List, 
  SwitchButton, UserFilled, Star 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

// ==================== 实例和Store ====================

/** 路由实例 */
const router = useRouter()

/** 当前路由信息 */
const route = useRoute()

/** 用户状态管理 */
const userStore = useUserStore()

// ==================== 响应式数据 ====================

/** @type {Ref<string>} 搜索关键词 */
const searchKeyword = ref('')

/** @type {Ref<boolean>} 移动端菜单显示状态 */
const showMobileMenu = ref(false)

/** @type {Ref<boolean>} 登录对话框显示状态 */
const showLoginDialog = ref(false)

/** @type {Ref<boolean>} 注册对话框显示状态 */
const showRegisterDialog = ref(false)

// 计算当前激活的菜单项
const activeIndex = computed(() => {
  return route.path
})

// 处理菜单选择
const handleSelect = (key) => {
  router.push(key)
}

// 处理移动端菜单选择
const handleMobileSelect = (key) => {
  showMobileMenu.value = false
  router.push(key)
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/resources',
      query: { search: searchKeyword.value.trim() }
    })
  }
}

// 处理用户菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'my-resources':
      router.push('/profile?tab=resources')
      break
    case 'my-favorites':
      router.push('/profile?tab=favorites')
      break
    case 'my-orders':
      router.push('/orders')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    userStore.logout()
    ElMessage.success('已退出登录')
    
    // 如果当前页面需要登录，跳转到首页
    if (route.meta.requiresAuth) {
      router.push('/')
    }
  } catch {
    // 用户取消
  }
}

// 处理登录成功
const handleLoginSuccess = () => {
  showLoginDialog.value = false
  ElMessage.success('登录成功')
}

// 处理注册成功
const handleRegisterSuccess = () => {
  showRegisterDialog.value = false
  showLoginDialog.value = true
  ElMessage.success('注册成功，请登录')
}

// 页面加载时的初始化操作
onMounted(() => {
  // 初始化操作（如果需要的话）
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-right: 2rem;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
}

.nav-menu .el-menu {
  border-bottom: none;
}

/* 搜索框 */
.search-box {
  width: 300px;
  margin: 0 2rem;
}

/* 用户菜单 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 0.9rem;
  color: #333;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.mobile-menu-btn:hover {
  background-color: #f5f7fa;
}

/* 移动端菜单 */
.mobile-menu {
  padding: 1rem 0;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 1rem;
}

.user-details {
  flex: 1;
}

.user-details .username {
  font-weight: bold;
  margin-bottom: 4px;
}

.user-details .user-email {
  font-size: 0.8rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu,
  .search-box {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .user-menu .el-button {
    display: none;
  }
  
  .user-info .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 15px;
  }
  
  .logo span {
    display: none;
  }
}
</style>