<template>
  <div class="orders-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>我的订单</h1>
        <p>管理您的租赁订单</p>
      </div>

      <!-- 订单筛选 -->
      <div class="order-filters">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部订单" name="all" />
          <el-tab-pane label="待确认" name="pending" />
          <el-tab-pane label="进行中" name="ongoing" />
          <el-tab-pane label="已完成" name="completed" />
          <el-tab-pane label="已取消" name="cancelled" />
        </el-tabs>
      </div>

      <!-- 订单列表 -->
      <div v-loading="loading" class="orders-container">
        <div v-if="orders.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无订单">
            <el-button type="primary" @click="$router.push('/resources')">
              去找物品
            </el-button>
          </el-empty>
        </div>
        
        <div v-else class="orders-list">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单号：{{ order.order_no }}</span>
                <span class="order-date">{{ formatDate(order.created_at) }}</span>
              </div>
              <el-tag :type="getOrderStatusColor(order.status)">
                {{ getOrderStatusText(order.status) }}
              </el-tag>
            </div>
            
            <div class="order-content">
              <div class="resource-info">
                <img 
                  :src="getResourceImage(order.resource_images)" 
                  :alt="order.resource_title"
                  class="resource-image"
                />
                <div class="resource-details">
                  <h3>{{ order.resource_title }}</h3>
                  <p>租赁时间：{{ formatDate(order.start_date) }} 至 {{ formatDate(order.end_date) }}</p>
                  <p>租赁天数：{{ order.days }} 天</p>
                </div>
              </div>
              
              <div class="order-amount">
                <div class="amount-item">
                  <span>日租金：</span>
                  <span>¥{{ formatPrice(order.daily_price) }}</span>
                </div>
                <div class="amount-item">
                  <span>押金：</span>
                  <span>¥{{ formatPrice(order.deposit) }}</span>
                </div>
                <div class="amount-total">
                  <span>总计：</span>
                  <span>¥{{ formatPrice(order.total_price) }}</span>
                </div>
              </div>
            </div>
            
            <div class="order-actions">
              <!-- 待确认状态的操作 -->
              <template v-if="order.status === 'pending'">
                <!-- 如果是房东，可以确认或拒绝订单 -->
                <template v-if="isOwner(order)">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="confirmOrder(order.id)"
                  >
                    确认订单
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="rejectOrder(order.id)"
                  >
                    拒绝订单
                  </el-button>
                </template>
                <!-- 如果是租客，可以取消订单 -->
                <template v-else>
                  <el-button 
                    type="danger" 
                    size="small"
                    @click="cancelOrder(order.id)"
                  >
                    取消订单
                  </el-button>
                </template>
              </template>
              
              <!-- 已确认状态的操作 -->
              <template v-if="order.status === 'confirmed'">
                <el-button 
                  type="success" 
                  size="small"
                  @click="startOrder(order.id)"
                >
                  开始租赁
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="cancelOrder(order.id)"
                >
                  取消订单
                </el-button>
              </template>
              
              <!-- 进行中状态的操作 -->
              <template v-if="order.status === 'ongoing'">
                <el-button 
                  type="success" 
                  size="small"
                  @click="completeOrder(order.id)"
                >
                  确认完成
                </el-button>
              </template>
              
              <!-- 联系对方按钮 -->
              <el-button 
                size="small"
                type="info"
                @click="contactOtherUser(order)"
              >
                {{ isOwner(order) ? '联系租客' : '联系房东' }}
              </el-button>
              
              <!-- 查看详情按钮（所有状态都有） -->
              <el-button 
                size="small"
                @click="viewOrderDetail(order.id)"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<!--
  订单管理页面组件
  
  功能说明：
  - 展示用户的所有租赁订单
  - 支持按状态筛选订单
  - 提供订单操作功能（取消、确认完成等）
  - 分页显示订单列表
  - 响应式设计适配移动端
  
  页面特性：
  - 标签页筛选：全部、待确认、进行中、已完成、已取消
  - 订单状态管理：支持状态流转操作
  - 详细信息展示：资源信息、价格、时间等
  - 操作权限控制：根据订单状态显示相应操作
  
  交互功能：
  - 订单状态筛选
  - 订单操作（取消、完成）
  - 订单详情查看
  - 分页导航
-->

<script setup>
/**
 * 订单管理页面脚本
 * 
 * 功能实现：
 * - 订单数据获取和展示
 * - 订单状态筛选和分页
 * - 订单操作处理（取消、完成）
 * - 订单详情跳转
 * - 响应式数据管理
 * 
 * 业务逻辑：
 * - 根据用户身份获取相关订单
 * - 支持按状态筛选订单列表
 * - 处理订单状态变更操作
 * - 提供订单详情查看入口
 * 
 * 使用的Vue3特性：
 * - Composition API
 * - 响应式数据管理
 * - 生命周期钩子
 * - 组件通信和事件处理
 */

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'
import { formatDate, formatPrice, getOrderStatusText, getOrderStatusColor, getImageUrl } from '@/utils/index'

// ==================== 实例和路由 ====================

/** 路由实例 */
const router = useRouter()

/** 用户状态管理 */
const userStore = useUserStore()

// ==================== 响应式数据 ====================

/** @type {Ref<boolean>} 加载状态 */
const loading = ref(false)

/** @type {Ref<Array>} 订单列表数据 */
const orders = ref([])

/** @type {Ref<string>} 当前激活的标签页 */
const activeTab = ref('all')

/** 
 * 分页信息对象
 * @type {Object}
 */
const pagination = reactive({
  page: 1,      // 当前页码
  limit: 10,    // 每页数量
  total: 0      // 总记录数
})

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    
    const response = await api.get('/orders', { params })
    
    if (response.data.status === 'success') {
      orders.value = response.data.data.orders
      Object.assign(pagination, response.data.data.pagination)
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 处理标签页切换
const handleTabChange = () => {
  pagination.page = 1
  fetchOrders()
}

// 处理分页变化
const handlePageChange = () => {
  fetchOrders()
}

// 处理每页数量变化
const handleSizeChange = () => {
  pagination.page = 1
  fetchOrders()
}

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

// 取消订单
const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.put(`/orders/${orderId}/status`, {
      status: 'cancelled'
    })
    
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 完成订单
const completeOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认已完成此次租赁吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    await api.put(`/orders/${orderId}/status`, {
      status: 'completed'
    })
    
    ElMessage.success('订单已完成')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成订单失败:', error)
      ElMessage.error('完成订单失败')
    }
  }
}

// 判断是否为订单的房东
const isOwner = (order) => {
  // 根据当前用户ID和订单的owner_id比较
  return userStore.user && userStore.user.id === order.owner_id
}

// 确认订单
const confirmOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认接受这个租赁订单吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    await api.put(`/orders/${orderId}/status`, {
      status: 'confirmed'
    })
    
    ElMessage.success('订单已确认')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认订单失败:', error)
      ElMessage.error('确认订单失败')
    }
  }
}

// 拒绝订单
const rejectOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这个订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.put(`/orders/${orderId}/status`, {
      status: 'cancelled'
    })
    
    ElMessage.success('订单已拒绝')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('拒绝订单失败:', error)
      ElMessage.error('拒绝订单失败')
    }
  }
}

// 开始租赁
const startOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认开始租赁吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    await api.put(`/orders/${orderId}/status`, {
      status: 'ongoing'
    })
    
    ElMessage.success('租赁已开始')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('开始租赁失败:', error)
      ElMessage.error('开始租赁失败')
    }
  }
}

// 联系对方用户
const contactOtherUser = async (order) => {
  try {
    const isCurrentUserOwner = isOwner(order)
    const targetUserId = isCurrentUserOwner ? order.renter_id : order.owner_id
    const targetUserName = isCurrentUserOwner ? order.renter_name : order.owner_name
    const userType = isCurrentUserOwner ? '租客' : '房东'
    
    // 获取目标用户的详细信息（包括联系方式）
    const response = await api.get(`/users/${targetUserId}`)
    if (response.data.status === 'success') {
      const user = response.data.data.user
      const contactInfo = user.phone || user.email
      
      if (contactInfo) {
        ElMessageBox.alert(
          `${targetUserName}的联系方式：${contactInfo}`,
          `联系${userType}`,
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

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`)
}

// 页面加载
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

/* 订单筛选 */
.order-filters {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 订单列表 */
.orders-container {
  min-height: 400px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-no {
  font-weight: bold;
  color: #333;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
}

.order-content {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.resource-info {
  display: flex;
  gap: 15px;
  flex: 1;
}

.resource-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
}

.resource-details h3 {
  margin: 0 0 8px;
  color: #333;
  font-size: 1.1rem;
}

.resource-details p {
  margin: 0 0 4px;
  color: #666;
  font-size: 0.9rem;
}

.order-amount {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.amount-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #333;
  padding-top: 5px;
  border-top: 1px solid #eee;
}

.order-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .order-amount {
    min-width: auto;
  }
  
  .order-actions {
    justify-content: center;
  }
  
  .resource-info {
    flex-direction: column;
    text-align: center;
  }
  
  .resource-image {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .order-card {
    padding: 15px;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .order-actions {
    flex-direction: column;
  }
}
</style>