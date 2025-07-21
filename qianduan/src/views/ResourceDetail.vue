<template>
  <div class="resource-detail-page">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <div v-else-if="resource" class="container">
      <!-- 资源详情 -->
      <div class="resource-detail">
        <!-- 图片展示 -->
        <div class="resource-images">
          <el-carousel 
            v-if="resourceImages.length > 1"
            height="400px" 
            indicator-position="outside"
          >
            <el-carousel-item v-for="(image, index) in resourceImages" :key="index">
              <img :src="image" :alt="resource.title" />
            </el-carousel-item>
          </el-carousel>
          <div v-else class="single-image">
            <img :src="resourceImages[0]" :alt="resource.title" />
          </div>
        </div>
        
        <!-- 资源信息 -->
        <div class="resource-info">
          <div class="resource-header">
            <h1>{{ resource.title }}</h1>
            <div class="resource-status">
              <el-tag :type="getStatusType(resource.status)">
                {{ getStatusText(resource.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="resource-meta">
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ resource.location || '位置未知' }}</span>
            </div>
            <div class="meta-item">
              <el-icon><View /></el-icon>
              <span>{{ resource.view_count || 0 }} 次浏览</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>发布于 {{ formatDate(resource.created_at) }}</span>
            </div>
          </div>
          
          <div class="resource-price">
            <div class="price-main">
              <span class="price">¥{{ formatPrice(resource.price_per_day) }}</span>
              <span class="unit">/天</span>
            </div>
            <div v-if="resource.deposit > 0" class="price-deposit">
              押金：¥{{ formatPrice(resource.deposit) }}
            </div>
          </div>
          
          <div class="resource-description">
            <h3>物品描述</h3>
            <p>{{ resource.description || '暂无描述' }}</p>
          </div>
          
          <!-- 租赁操作 -->
          <div class="rental-actions">
            <el-button 
              v-if="resource.status === 'available' && !isOwner"
              type="primary" 
              size="large"
              @click="showRentalDialog = true"
            >
              立即租赁
            </el-button>
            <el-button 
              v-else-if="isOwner"
              size="large"
              @click="editResource"
            >
              编辑物品
            </el-button>
            <el-button 
              v-else
              size="large"
              disabled
            >
              暂不可租赁
            </el-button>
            
            <el-button 
              size="large" 
              :type="isFavorited ? 'warning' : 'default'"
              :loading="favoriteLoading"
              @click="toggleFavorite"
            >
              <el-icon><Star :filled="isFavorited" /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 物主信息 -->
      <div class="owner-info">
        <h3>物主信息</h3>
        <div class="owner-card">
          <el-avatar :src="resource.owner_avatar" :size="60">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="owner-details">
            <h4>{{ resource.owner_name }}</h4>
            <p>真实姓名：{{ resource.owner_real_name || '未提供' }}</p>
            <p>联系方式：{{ resource.contact_info || '请通过平台联系' }}</p>
          </div>
          <div class="owner-actions">
            <el-button size="small" @click="showContactInfo">
              <el-icon><Message /></el-icon>
              联系卖家
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 相关推荐 -->
      <div v-if="relatedResources.length > 0" class="related-resources">
        <h3>相关推荐</h3>
        <div class="related-grid">
          <ResourceCard
            v-for="item in relatedResources"
            :key="item.id"
            :resource="item"
            view-mode="grid"
            @click="goToResource(item.id)"
          />
        </div>
      </div>
    </div>
    
    <!-- 租赁对话框 -->
    <el-dialog v-model="showRentalDialog" title="租赁申请" width="500px">
      <RentalForm 
        :resource="resource"
        @success="handleRentalSuccess"
        @cancel="showRentalDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Location, View, Calendar, Star, User, Message 
} from '@element-plus/icons-vue'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'
import { formatDate, formatPrice, getResourceStatusText, getImageUrl } from '@/utils/index'
import ResourceCard from '@/components/resource/ResourceCard.vue'
import RentalForm from '@/components/rental/RentalForm.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(true)
const resource = ref(null)
const relatedResources = ref([])
const showRentalDialog = ref(false)
const isFavorited = ref(false)
const favoriteLoading = ref(false)

// 计算属性
const resourceImages = computed(() => {
  if (!resource.value?.images) return ['/images/placeholder.jpg']
  
  // 如果images已经是数组（MySQL JSON类型）
  if (Array.isArray(resource.value.images)) {
    return resource.value.images.length > 0 ? resource.value.images.map(img => getImageUrl(img)) : ['/images/placeholder.jpg']
  }
  
  // 如果images是字符串，尝试解析JSON
  try {
    const images = JSON.parse(resource.value.images)
    return images.length > 0 ? images.map(img => getImageUrl(img)) : ['/images/placeholder.jpg']
  } catch {
    return ['/images/placeholder.jpg']
  }
})

const isOwner = computed(() => {
  return userStore.isLoggedIn && userStore.user?.id === resource.value?.user_id
})

// 获取资源详情
const fetchResourceDetail = async () => {
  try {
    loading.value = true
    const resourceId = route.params.id
    
    const response = await api.get(`/resources/${resourceId}`)
    
    if (response.data.status === 'success') {
      resource.value = response.data.data.resource
      relatedResources.value = response.data.data.resource.related_resources || []
    } else {
      ElMessage.error('资源不存在')
      router.push('/404')
    }
  } catch (error) {
    console.error('获取资源详情失败:', error)
    ElMessage.error('获取资源详情失败')
    router.push('/404')
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    available: 'success',
    rented: 'danger',
    maintenance: 'warning',
    offline: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  return getResourceStatusText(status)
}

// 跳转到其他资源
const goToResource = (id) => {
  router.push(`/resources/${id}`)
  // 重新获取数据
  fetchResourceDetail()
}

// 编辑资源
const editResource = () => {
  // TODO: 跳转到编辑页面
  console.log('编辑资源')
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const response = await api.get(`/favorites/check/${resource.value.id}`)
    if (response.data.status === 'success') {
      isFavorited.value = response.data.data.isFavorited
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再收藏')
    router.push('/login')
    return
  }
  
  if (favoriteLoading.value) return
  
  try {
    favoriteLoading.value = true
    
    if (isFavorited.value) {
      // 取消收藏
      await api.delete(`/favorites/${resource.value.id}`)
      isFavorited.value = false
      ElMessage.success('取消收藏成功')
    } else {
      // 添加收藏
      await api.post('/favorites', {
        resource_id: resource.value.id
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

// 显示联系信息
const showContactInfo = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再联系卖家')
    router.push('/login')
    return
  }
  
  const contactInfo = resource.value.contact_info || resource.value.owner_phone
  if (contactInfo) {
    ElMessage({
      message: `卖家联系方式：${contactInfo}`,
      type: 'info',
      duration: 0,
      showClose: true
    })
  } else {
    ElMessage.info('卖家暂未提供联系方式，请通过租赁功能联系')
  }
}

// 处理租赁成功
const handleRentalSuccess = () => {
  showRentalDialog.value = false
  ElMessage.success('租赁申请已提交')
  // 刷新资源信息
  fetchResourceDetail()
}

// 页面加载
onMounted(async () => {
  await fetchResourceDetail()
  // 获取资源详情后检查收藏状态
  if (resource.value) {
    checkFavoriteStatus()
  }
})
</script>

<style scoped>
.resource-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 资源详情 */
.resource-detail {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.resource-images {
  position: relative;
}

.resource-images img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.single-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.resource-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
  flex: 1;
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.resource-price {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 5px;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #e6a23c;
}

.unit {
  font-size: 1rem;
  color: #666;
}

.price-deposit {
  color: #666;
  font-size: 0.9rem;
}

.resource-description h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
}

.resource-description p {
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

.rental-actions {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

.rental-actions .el-button {
  flex: 1;
  padding: 12px 0;
  font-size: 1rem;
}

/* 物主信息 */
.owner-info {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.owner-info h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.owner-card {
  display: flex;
  gap: 20px;
  align-items: center;
}

.owner-details {
  flex: 1;
}

.owner-details h4 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 8px;
}

.owner-details p {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 4px;
}

/* 相关推荐 */
.related-resources {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.related-resources h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resource-detail {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 20px;
  }
  
  .resource-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .resource-header h1 {
    font-size: 1.5rem;
  }
  
  .rental-actions {
    flex-direction: column;
  }
  
  .owner-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .resource-detail,
  .owner-info,
  .related-resources {
    padding: 20px 15px;
  }
  
  .price {
    font-size: 1.5rem;
  }
}
</style>