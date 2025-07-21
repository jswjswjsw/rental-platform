<!--
  首页组件
  
  功能说明：
  - 展示平台的主要功能和特色
  - 提供轮播图展示平台亮点
  - 显示热门分类和精选推荐
  - 展示平台统计数据
  - 引导用户进行各种操作
  
  页面结构：
  - 轮播图区域：平台介绍和引导
  - 分类导航：热门分类快速入口
  - 推荐资源：精选物品展示
  - 统计数据：平台数据展示
  
  交互功能：
  - 分类点击跳转到资源列表
  - 资源卡片点击查看详情
  - 响应式布局适配移动端
-->
<template>
  <div class="home">
    <!-- 轮播图展示区域 -->
    <section class="hero-section">
      <el-carousel height="400px" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="carousel-item" :style="{ backgroundImage: `url(${item.image})` }">
            <div class="carousel-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
              <el-button type="primary" size="large" @click="$router.push('/resources')">
                立即探索
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 分类导航 -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">热门分类</h2>
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            @click="goToCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon size="32">
                <component :is="getCategoryIcon(category.icon)" />
              </el-icon>
            </div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.resource_count }} 件物品</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 推荐资源 -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">精选推荐</h2>
        <div class="resources-grid">
          <div 
            v-for="resource in featuredResources" 
            :key="resource.id"
            class="resource-card"
            @click="goToResource(resource.id)"
          >
            <div class="resource-image">
              <img :src="getResourceImage(resource.images)" :alt="resource.title" />
              <div class="resource-status" :class="resource.status">
                {{ getStatusText(resource.status) }}
              </div>
            </div>
            <div class="resource-info">
              <h3>{{ resource.title }}</h3>
              <p class="resource-location">
                <el-icon><Location /></el-icon>
                {{ resource.location || '位置未知' }}
              </p>
              <div class="resource-meta">
                <span class="price">¥{{ resource.price_per_day }}/天</span>
                <div class="rating">
                  <el-rate 
                    v-model="resource.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center">
          <el-button type="primary" @click="$router.push('/resources')">
            查看更多
          </el-button>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalResources }}</div>
            <div class="stat-label">可租赁物品</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">注册用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalOrders }}</div>
            <div class="stat-label">成功订单</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalCategories }}</div>
            <div class="stat-label">物品分类</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * 首页组件脚本
 * 
 * 功能实现：
 * - 获取和展示分类数据
 * - 获取和展示推荐资源
 * - 展示平台统计数据
 * - 处理用户交互和页面跳转
 * 
 * 使用的Vue3特性：
 * - Composition API
 * - 响应式数据管理
 * - 生命周期钩子
 * - 路由导航
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import api from '@/utils/api'

// 路由实例
const router = useRouter()

// ==================== 响应式数据 ====================

/** @type {Ref<Array>} 分类列表数据 */
const categories = ref([])

/** @type {Ref<Array>} 推荐资源列表数据 */
const featuredResources = ref([])

/** @type {Ref<Object>} 平台统计数据 */
const stats = ref({
  totalResources: 0,    // 可租赁物品总数
  totalUsers: 0,        // 注册用户总数
  totalOrders: 0,       // 成功订单总数
  totalCategories: 0    // 物品分类总数
})

// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '闲置资源，轻松租赁',
    description: '让闲置物品发挥价值，让生活更加便利',
    image: '/images/banner1.jpg'
  },
  {
    id: 2,
    title: '安全可靠，放心交易',
    description: '完善的评价体系，保障每一次交易',
    image: '/images/banner2.jpg'
  },
  {
    id: 3,
    title: '种类丰富，应有尽有',
    description: '从电子设备到生活用品，满足各种需求',
    image: '/images/banner3.jpg'
  }
])

// 获取分类数据
const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    if (response.data.success) {
      categories.value = response.data.data.categories.slice(0, 8) // 只显示前8个
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取推荐资源
const fetchFeaturedResources = async () => {
  try {
    const response = await api.get('/resources', {
      params: {
        limit: 8,
        sort: 'view_count'
      }
    })
    if (response.data.success) {
      featuredResources.value = response.data.data.resources
    }
  } catch (error) {
    console.error('获取推荐资源失败:', error)
  }
}

// 获取统计数据（模拟数据）
const fetchStats = () => {
  stats.value = {
    totalResources: 1234,
    totalUsers: 5678,
    totalOrders: 9012,
    totalCategories: 8
  }
}

// 获取分类图标
const getCategoryIcon = (iconName) => {
  const iconMap = {
    'el-icon-mobile-phone': 'Iphone',
    'el-icon-house': 'House',
    'el-icon-truck': 'Truck',
    'el-icon-basketball': 'Basketball',
    'el-icon-shopping-bag-1': 'ShoppingBag',
    'el-icon-reading': 'Reading',
    'el-icon-setting': 'Setting',
    'el-icon-more': 'More'
  }
  return iconMap[iconName] || 'Box'
}

// 获取资源图片
const getResourceImage = (images) => {
  if (!images) return '/images/placeholder.jpg'
  try {
    const imageArray = JSON.parse(images)
    return imageArray.length > 0 ? imageArray[0] : '/images/placeholder.jpg'
  } catch {
    return '/images/placeholder.jpg'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    available: '可租赁',
    rented: '已租出',
    maintenance: '维护中',
    offline: '已下架'
  }
  return statusMap[status] || '未知'
}

// 跳转到分类页面
const goToCategory = (categoryId) => {
  router.push(`/resources?category=${categoryId}`)
}

// 跳转到资源详情
const goToResource = (resourceId) => {
  router.push(`/resources/${resourceId}`)
}

// 页面加载时获取数据
onMounted(() => {
  fetchCategories()
  fetchFeaturedResources()
  fetchStats()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* 轮播图样式 */
.hero-section {
  margin-bottom: 60px;
}

.carousel-item {
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.carousel-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.carousel-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
}

.carousel-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.carousel-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* 容器样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #333;
  font-weight: bold;
}

/* 分类网格 */
.categories-section {
  padding: 60px 0;
  background: #f8f9fa;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.category-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-icon {
  color: #409eff;
  margin-bottom: 1rem;
}

.category-card h3 {
  margin: 1rem 0 0.5rem;
  color: #333;
}

.category-card p {
  color: #666;
  font-size: 0.9rem;
}

/* 推荐资源 */
.featured-section {
  padding: 60px 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.resource-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.resource-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.resource-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}

.resource-status.available {
  background: #67c23a;
}

.resource-status.rented {
  background: #f56c6c;
}

.resource-info {
  padding: 1.5rem;
}

.resource-info h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.1rem;
}

.resource-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e6a23c;
}

/* 统计数据 */
.stats-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

.text-center {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-content h2 {
    font-size: 1.8rem;
  }
  
  .carousel-content p {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .categories-grid,
  .resources-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>