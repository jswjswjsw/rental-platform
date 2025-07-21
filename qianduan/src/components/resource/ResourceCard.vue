<!--
  资源卡片组件
  
  功能说明：
  - 展示单个资源的基本信息
  - 支持网格和列表两种显示模式
  - 提供资源状态、价格、评分等信息
  - 支持收藏和点击查看详情
  - 响应式设计适配不同屏幕
  
  显示模式：
  - grid: 网格模式，适合资源列表页
  - list: 列表模式，显示更多详细信息
  
  组件属性：
  - resource: 资源数据对象
  - viewMode: 显示模式（grid/list）
  
  交互功能：
  - 点击卡片查看详情
  - 收藏按钮操作
  - 状态标签显示
  - 评分和统计信息
-->
<template>
  <div :class="['resource-card', viewMode]" @click="$emit('click')">
    <!-- 网格视图模式 -->
    <template v-if="viewMode === 'grid'">
      <div class="card-image">
        <!-- 资源主图 -->
        <img :src="getResourceImage(resource.images)" :alt="resource.title" />
        
        <!-- 资源状态标签 -->
        <div class="card-status" :class="resource.status">
          {{ getStatusText(resource.status) }}
        </div>
        
        <!-- 操作按钮（悬停显示） -->
        <div class="card-actions">
          <el-button 
            circle 
            size="small" 
            :type="isFavorited ? 'warning' : 'default'"
            :loading="favoriteLoading"
            @click.stop="toggleFavorite"
          >
            <el-icon><Star :filled="isFavorited" /></el-icon>
          </el-button>
        </div>
      </div>
      
      <div class="card-content">
        <h3 class="card-title">{{ resource.title }}</h3>
        <p class="card-location">
          <el-icon><Location /></el-icon>
          {{ resource.location || '位置未知' }}
        </p>
        <div class="card-meta">
          <div class="card-price">
            <span class="price">¥{{ formatPrice(resource.price_per_day) }}</span>
            <span class="unit">/天</span>
          </div>
          <div class="card-rating">
            <el-rate 
              v-model="resource.rating" 
              disabled 
              size="small"
              show-score 
              text-color="#ff9900"
              score-template="{value}"
            />
          </div>
        </div>
        <div class="card-footer">
          <div class="owner-info">
            <el-avatar :src="resource.owner_avatar" :size="24">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span>{{ resource.owner_name }}</span>
          </div>
          <div class="card-stats">
            <span><el-icon><View /></el-icon> {{ resource.view_count || 0 }}</span>
          </div>
        </div>
      </div>
    </template>
    
    <!-- 列表视图 -->
    <template v-else>
      <div class="list-image">
        <img :src="getResourceImage(resource.images)" :alt="resource.title" />
        <div class="list-status" :class="resource.status">
          {{ getStatusText(resource.status) }}
        </div>
      </div>
      
      <div class="list-content">
        <div class="list-header">
          <h3 class="list-title">{{ resource.title }}</h3>
          <div class="list-price">
            <span class="price">¥{{ formatPrice(resource.price_per_day) }}</span>
            <span class="unit">/天</span>
          </div>
        </div>
        
        <p class="list-description">{{ resource.description || '暂无描述' }}</p>
        
        <div class="list-meta">
          <div class="meta-item">
            <el-icon><Location /></el-icon>
            <span>{{ resource.location || '位置未知' }}</span>
          </div>
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>{{ resource.owner_name }}</span>
          </div>
          <div class="meta-item">
            <el-icon><View /></el-icon>
            <span>{{ resource.view_count || 0 }} 次浏览</span>
          </div>
          <div class="meta-item">
            <el-rate 
              v-model="resource.rating" 
              disabled 
              size="small"
              show-score 
              text-color="#ff9900"
              score-template="{value} 分"
            />
          </div>
        </div>
        
        <div class="list-footer">
          <div class="list-time">
            发布于 {{ formatDate(resource.created_at) }}
          </div>
          <div class="list-actions">
            <el-button 
              size="small" 
              :type="isFavorited ? 'warning' : 'default'"
              :loading="favoriteLoading"
              @click.stop="toggleFavorite"
            >
              <el-icon><Star :filled="isFavorited" /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
            <el-button type="primary" size="small" @click.stop="$emit('click')">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * 资源卡片组件脚本
 * 
 * 功能实现：
 * - 资源数据展示和格式化
 * - 图片处理和占位图显示
 * - 状态文本转换
 * - 收藏功能（待实现）
 * - 组件属性验证和事件通信
 * 
 * 使用的Vue3特性：
 * - Composition API
 * - Props验证和默认值
 * - 事件定义和触发
 * - 工具函数集成
 */

import { ref, onMounted } from 'vue'
import { Star, Location, User, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import api from '@/utils/api'
import { getImageUrl, formatPrice, formatDate, getResourceStatusText } from '@/utils/index'

// ==================== 组件属性 ====================

/**
 * 组件属性定义
 */
const props = defineProps({
  /** 
   * 资源数据对象
   * @type {Object}
   * @required
   */
  resource: {
    type: Object,
    required: true
  },
  /** 
   * 显示模式
   * @type {String}
   * @default 'grid'
   * @values 'grid' | 'list'
   */
  viewMode: {
    type: String,
    default: 'grid'
  }
})

// ==================== 组件事件 ====================

/**
 * 定义组件事件
 * - click: 卡片点击事件
 */
const emit = defineEmits(['click'])

// ==================== 响应式数据 ====================

const userStore = useUserStore()
const isFavorited = ref(false)
const favoriteLoading = ref(false)

// ==================== 工具函数 ====================

/**
 * 获取资源图片URL
 * @param {string} images - 图片JSON字符串
 * @returns {string} 处理后的图片URL
 * 
 * 处理逻辑：
 * 1. 解析JSON格式的图片数组
 * 2. 取第一张图片作为主图
 * 3. 异常情况返回占位图
 */
const getResourceImage = (images) => {
  if (!images) return '/images/placeholder.jpg'
  
  // 如果images已经是数组（MySQL JSON类型）
  if (Array.isArray(images)) {
    return images.length > 0 ? getImageUrl(images[0]) : '/images/placeholder.jpg'
  }
  
  // 如果images是字符串，尝试解析JSON
  try {
    const imageArray = JSON.parse(images)
    return imageArray.length > 0 ? getImageUrl(imageArray[0]) : '/images/placeholder.jpg'
  } catch {
    return '/images/placeholder.jpg'
  }
}

/**
 * 获取资源状态的中文文本
 * @param {string} status - 资源状态英文标识
 * @returns {string} 中文状态文本
 */
const getStatusText = (status) => {
  return getResourceStatusText(status)
}

/**
 * 检查收藏状态
 */
const checkFavoriteStatus = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const response = await api.get(`/favorites/check/${props.resource.id}`)
    if (response.data.status === 'success') {
      isFavorited.value = response.data.data.isFavorited
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

/**
 * 切换收藏状态
 */
const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再收藏')
    return
  }
  
  if (favoriteLoading.value) return
  
  try {
    favoriteLoading.value = true
    
    if (isFavorited.value) {
      // 取消收藏
      await api.delete(`/favorites/${props.resource.id}`)
      isFavorited.value = false
      ElMessage.success('取消收藏成功')
    } else {
      // 添加收藏
      await api.post('/favorites', {
        resource_id: props.resource.id
      })
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    favoriteLoading.value = false
  }
}

// 组件挂载时检查收藏状态
onMounted(() => {
  checkFavoriteStatus()
})
</script>

<style scoped>
.resource-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 网格视图样式 */
.resource-card.grid {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resource-card.grid:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.resource-card.grid:hover .card-image img {
  transform: scale(1.05);
}

.card-status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.card-status.available {
  background: #67c23a;
}

.card-status.rented {
  background: #f56c6c;
}

.card-status.maintenance {
  background: #e6a23c;
}

.card-status.offline {
  background: #909399;
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resource-card.grid:hover .card-actions {
  opacity: 1;
}

.card-content {
  padding: 15px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-location {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}

.unit {
  font-size: 12px;
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.card-stats {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 列表视图样式 */
.resource-card.list {
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resource-card.list:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.list-image {
  position: relative;
  width: 150px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-status {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: white;
  font-weight: bold;
}

.list-status.available {
  background: #67c23a;
}

.list-status.rented {
  background: #f56c6c;
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.list-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.list-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-left: 15px;
}

.list-description {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.list-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.list-time {
  font-size: 12px;
  color: #999;
}

.list-actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resource-card.list {
    flex-direction: column;
  }
  
  .list-image {
    width: 100%;
    height: 180px;
  }
  
  .list-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .list-price {
    margin-left: 0;
  }
  
  .list-meta {
    gap: 15px;
  }
  
  .list-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>