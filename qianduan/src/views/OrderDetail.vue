<template>
  <div class="order-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="page-header">
        <el-button @click="$router.back()" icon="ArrowLeft">返回</el-button>
        <h1>订单详情</h1>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="order" class="order-detail">
        <!-- 订单基本信息 -->
        <el-card class="order-info-card">
          <template #header>
            <div class="card-header">
              <span>订单信息</span>
              <el-tag :type="getOrderStatusColor(order.status)" size="large">
                {{ getOrderStatusText(order.status) }}
              </el-tag>
            </div>
          </template>
          
          <div class="order-info">
            <div class="info-row">
              <span class="label">订单号：</span>
              <span class="value">{{ order.order_no }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间：</span>
              <span class="value">{{ formatDate(order.created_at, 'YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
            <div class="info-row">
              <span class="label">租赁时间：</span>
              <span class="value">{{ formatDate(order.start_date) }} 至 {{ formatDate(order.end_date) }}</span>
            </div>
            <div class="info-row">
              <span class="label">租赁天数：</span>
              <span class="value">{{ order.days }} 天</span>
            </div>
            <div class="info-row">
              <span class="label">备注：</span>
              <span class="value">{{ order.remark || '无' }}</span>
            </div>
          </div>
        </el-card>

        <!-- 物品信息 -->
        <el-card class="resource-info-card">
          <template #header>
            <span>租赁物品</span>
          </template>
          
          <div class="resource-info">
            <div class="resource-image">
              <img :src="getResourceImage(order.resource_images)" :alt="order.resource_title" />
            </div>
            <div class="resource-details">
              <h3>{{ order.resource_title }}</h3>
              <div class="price-info">
                <div class="price-row">
                  <span class="label">日租金：</span>
                  <span class="price">¥{{ formatPrice(order.daily_price) }}</span>
                </div>
                <div class="price-row">
                  <span class="label">押金：</span>
                  <span class="price">¥{{ formatPrice(order.deposit) }}</span>
                </div>
                <div class="price-row total">
                  <span class="label">总计：</span>
                  <span class="price">¥{{ formatPrice(order.total_price) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 用户信息 -->
        <el-card class="users-info-card">
          <template #header>
            <span>参与用户</span>
          </template>
          
          <div class="users-info">
            <div class="user-item">
              <div class="user-role">租客</div>
              <div class="user-details">
                <el-avatar :src="order.renter_avatar" :size="40">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ order.renter_name }}</span>
                <el-button 
                  v-if="!isRenter" 
                  size="small" 
                  type="primary" 
                  @click="contactUser('renter')"
                >
                  联系租客
                </el-button>
              </div>
            </div>
            <div class="user-item">
              <div class="user-role">房东</div>
              <div class="user-details">
                <el-avatar :src="order.owner_avatar" :size="40">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ order.owner_name }}</span>
                <el-button 
                  v-if="!isOwner" 
                  size="small" 
                  type="primary" 
                  @click="contactUser('owner')"
                >
                  联系房东
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 订单操作 -->
        <el-card class="order-actions-card">
          <template #header>
            <span>订单操作</span>
          </template>
          
          <div class="order-actions">
            <!-- 待确认状态的操作 -->
            <template v-if="order.status === 'pending'">
              <!-- 如果是房东，可以确认或拒绝订单 -->
              <template v-if="isOwner">
                <el-button type="primary" @click="confirmOrder">确认订单</el-button>
                <el-button type="danger" @click="rejectOrder">拒绝订单</el-button>
              </template>
              <!-- 如果是租客，可以取消订单 -->
              <template v-else>
                <el-button type="danger" @click="cancelOrder">取消订单</el-button>
              </template>
            </template>
            
            <!-- 已确认状态的操作 -->
            <template v-if="order.status === 'confirmed'">
              <el-button type="success" @click="startOrder">开始租赁</el-button>
              <el-button type="danger" @click="cancelOrder">取消订单</el-button>
            </template>
            
            <!-- 进行中状态的操作 -->
            <template v-if="order.status === 'ongoing'">
              <el-button type="success" @click="completeOrder">确认完成</el-button>
            </template>
            
            <!-- 已完成或已取消状态 -->
            <template v-if="['completed', 'cancelled'].includes(order.status)">
              <el-button @click="$router.push('/orders')">返回订单列表</el-button>
            </template>
          </div>
        </el-card>
      </div>

      <div v-else class="error-state">
        <el-empty description="订单不存在或已被删除">
          <el-button type="primary" @click="$router.push('/orders')">返回订单列表</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import api from '@/utils/api'
import { formatDate, formatPrice, getOrderStatusText, getOrderStatusColor, getImageUrl } from '@/utils/index'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(true)
const order = ref(null)

// 计算属性
const isOwner = computed(() => {
  return userStore.user && order.value && userStore.user.id === order.value.owner_id
})

const isRenter = computed(() => {
  return userStore.user && order.value && userStore.user.id === order.value.renter_id
})

// 获取资源图片
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

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const orderId = route.params.id
    
    const response = await api.get(`/orders/${orderId}`)
    if (response.data.status === 'success') {
      order.value = response.data.data.order
    } else {
      ElMessage.error('获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 订单操作函数
const updateOrderStatus = async (status, confirmText) => {
  try {
    await ElMessageBox.confirm(confirmText, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.put(`/orders/${order.value.id}/status`, { status })
    ElMessage.success('操作成功')
    
    // 刷新订单详情
    await fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 联系用户功能
const contactUser = async (userType) => {
  try {
    const targetUserId = userType === 'owner' ? order.value.owner_id : order.value.renter_id
    const targetUserName = userType === 'owner' ? order.value.owner_name : order.value.renter_name
    
    // 获取目标用户的详细信息（包括联系方式）
    const response = await api.get(`/users/${targetUserId}`)
    if (response.data.status === 'success') {
      const user = response.data.data.user
      const contactInfo = user.phone || user.email
      
      if (contactInfo) {
        ElMessageBox.alert(
          `${targetUserName}的联系方式：${contactInfo}`,
          `联系${userType === 'owner' ? '房东' : '租客'}`,
          {
            confirmButtonText: '知道了',
            type: 'info'
          }
        )
      } else {
        ElMessage.info(`${targetUserName}暂未设置联系方式`)
      }
    } else {
      ElMessage.error('获取联系方式失败')
    }
  } catch (error) {
    console.error('获取联系方式失败:', error)
    ElMessage.error('获取联系方式失败')
  }
}

const confirmOrder = () => updateOrderStatus('confirmed', '确认接受这个租赁订单吗？')
const rejectOrder = () => updateOrderStatus('cancelled', '确定要拒绝这个订单吗？')
const cancelOrder = () => updateOrderStatus('cancelled', '确定要取消这个订单吗？')
const startOrder = () => updateOrderStatus('ongoing', '确认开始租赁吗？')
const completeOrder = () => updateOrderStatus('completed', '确认已完成此次租赁吗？')

// 页面加载
onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.loading {
  background: white;
  border-radius: 8px;
  padding: 2rem;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-row .label {
  width: 100px;
  color: #666;
  font-weight: 500;
}

.info-row .value {
  color: #333;
}

.resource-info {
  display: flex;
  gap: 1.5rem;
}

.resource-image {
  flex-shrink: 0;
}

.resource-image img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.resource-details {
  flex: 1;
}

.resource-details h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-row.total {
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.price {
  color: #e6a23c;
  font-weight: 500;
}

.users-info {
  display: flex;
  gap: 2rem;
}

.user-item {
  flex: 1;
  text-align: center;
}

.user-role {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.username {
  color: #333;
  font-weight: 500;
}

.order-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.error-state {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

@media (max-width: 768px) {
  .resource-info {
    flex-direction: column;
  }
  
  .users-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-actions {
    flex-direction: column;
  }
}
</style>