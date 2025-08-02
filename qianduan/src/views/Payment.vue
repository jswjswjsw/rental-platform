<!--
  支付页面
  
  功能说明：
  - 显示订单支付信息
  - 支持多种支付方式选择
  - 集成微信支付组件
  - 支付结果处理和跳转
  
  路由参数：
  - orderId: 订单ID
  - type: 支付类型（rent/deposit）
  
  @author 开发团队
  @version 1.0.0
  @since 2024-08-02
-->

<template>
  <div class="payment-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>订单支付</h1>
        <p>请选择支付方式完成付款</p>
      </div>

      <!-- 订单信息 -->
      <div v-if="order" class="order-info">
        <h2>订单信息</h2>
        <div class="order-details">
          <div class="order-item">
            <span class="label">订单号：</span>
            <span class="value">{{ order.order_no }}</span>
          </div>
          <div class="order-item">
            <span class="label">资源名称：</span>
            <span class="value">{{ order.resource_title }}</span>
          </div>
          <div class="order-item">
            <span class="label">租赁时间：</span>
            <span class="value">{{ order.start_date }} 至 {{ order.end_date }}</span>
          </div>
          <div class="order-item">
            <span class="label">租赁天数：</span>
            <span class="value">{{ order.days }}天</span>
          </div>
          <div class="order-item">
            <span class="label">日租金：</span>
            <span class="value">¥{{ order.daily_price }}</span>
          </div>
          <div class="order-item total">
            <span class="label">租赁费用：</span>
            <span class="value">¥{{ order.total_price }}</span>
          </div>
          <div class="order-item total">
            <span class="label">押金：</span>
            <span class="value">¥{{ order.deposit }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-methods">
        <h2>支付方式</h2>
        <div class="method-list">
          <div 
            class="method-item"
            :class="{ active: selectedMethod === 'wechat' }"
            @click="selectedMethod = 'wechat'"
          >
            <div class="method-icon">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <div class="method-info">
              <div class="method-name">微信支付</div>
              <div class="method-desc">安全快捷，支持微信钱包</div>
            </div>
            <div class="method-radio">
              <el-radio v-model="selectedMethod" label="wechat"></el-radio>
            </div>
          </div>

          <!-- 可以添加更多支付方式 -->
          <div 
            class="method-item disabled"
            title="即将开放"
          >
            <div class="method-icon">
              <i class="el-icon-wallet"></i>
            </div>
            <div class="method-info">
              <div class="method-name">支付宝</div>
              <div class="method-desc">即将开放</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付类型选择 -->
      <div class="payment-types">
        <h2>支付内容</h2>
        <div class="type-list">
          <div 
            class="type-item"
            :class="{ active: selectedType === 'rent' }"
            @click="selectedType = 'rent'"
          >
            <div class="type-info">
              <div class="type-name">租赁费用</div>
              <div class="type-amount">¥{{ order?.total_price || 0 }}</div>
            </div>
            <el-radio v-model="selectedType" label="rent"></el-radio>
          </div>

          <div 
            class="type-item"
            :class="{ active: selectedType === 'deposit' }"
            @click="selectedType = 'deposit'"
          >
            <div class="type-info">
              <div class="type-name">押金</div>
              <div class="type-amount">¥{{ order?.deposit || 0 }}</div>
            </div>
            <el-radio v-model="selectedType" label="deposit"></el-radio>
          </div>
        </div>
      </div>

      <!-- 微信支付组件 -->
      <div v-if="selectedMethod === 'wechat' && order" class="payment-component">
        <WechatPay
          :order="order"
          :payment-type="selectedType"
          @success="handlePaymentSuccess"
          @error="handlePaymentError"
        />
      </div>

      <!-- 支付记录 -->
      <div v-if="paymentHistory.length > 0" class="payment-history">
        <h2>支付记录</h2>
        <div class="history-list">
          <div 
            v-for="payment in paymentHistory" 
            :key="payment.id"
            class="history-item"
          >
            <div class="payment-info">
              <div class="payment-type">
                {{ payment.payment_type === 'rent' ? '租赁费用' : '押金' }}
              </div>
              <div class="payment-amount">¥{{ (payment.amount / 100).toFixed(2) }}</div>
            </div>
            <div class="payment-status">
              <el-tag 
                :type="getStatusType(payment.status)"
                size="small"
              >
                {{ getStatusText(payment.status) }}
              </el-tag>
            </div>
            <div class="payment-time">
              {{ formatTime(payment.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import api from '@/utils/api'
import WechatPay from '@/components/payment/WechatPay.vue'

export default {
  name: 'Payment',
  components: {
    WechatPay
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const order = ref(null)
    const selectedMethod = ref('wechat')
    const selectedType = ref('rent')
    const paymentHistory = ref([])
    const loading = ref(false)

    // 获取订单信息
    const fetchOrder = async () => {
      try {
        const orderId = route.params.orderId || route.query.orderId
        if (!orderId) {
          ElMessage.error('订单ID不能为空')
          router.push('/orders')
          return
        }

        loading.value = true
        const response = await api.get(`/orders/${orderId}`)
        
        if (response.data.status === 'success') {
          order.value = response.data.data.order
          
          // 根据URL参数设置默认支付类型
          if (route.query.type) {
            selectedType.value = route.query.type
          }
        } else {
          ElMessage.error(response.data.message)
          router.push('/orders')
        }
      } catch (error) {
        console.error('获取订单信息失败:', error)
        ElMessage.error('获取订单信息失败')
        router.push('/orders')
      } finally {
        loading.value = false
      }
    }

    // 获取支付记录
    const fetchPaymentHistory = async () => {
      try {
        const orderId = route.params.orderId || route.query.orderId
        const response = await api.get('/payments', {
          params: {
            order_id: orderId
          }
        })
        
        if (response.data.status === 'success') {
          paymentHistory.value = response.data.data.payments
        }
      } catch (error) {
        console.error('获取支付记录失败:', error)
      }
    }

    // 处理支付成功
    const handlePaymentSuccess = (data) => {
      ElMessage.success('支付成功！')
      
      // 刷新支付记录
      fetchPaymentHistory()
      
      // 3秒后跳转到订单详情
      setTimeout(() => {
        router.push(`/orders/${order.value.id}`)
      }, 3000)
    }

    // 处理支付失败
    const handlePaymentError = (error) => {
      console.error('支付失败:', error)
      ElMessage.error('支付失败，请重试')
    }

    // 获取状态类型
    const getStatusType = (status) => {
      switch (status) {
        case 'success':
          return 'success'
        case 'pending':
          return 'warning'
        case 'failed':
          return 'danger'
        default:
          return 'info'
      }
    }

    // 获取状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 'success':
          return '支付成功'
        case 'pending':
          return '待支付'
        case 'failed':
          return '支付失败'
        case 'cancelled':
          return '已取消'
        default:
          return '未知'
      }
    }

    // 格式化时间
    const formatTime = (time) => {
      return new Date(time).toLocaleString()
    }

    onMounted(() => {
      fetchOrder()
      fetchPaymentHistory()
    })

    return {
      order,
      selectedMethod,
      selectedType,
      paymentHistory,
      loading,
      handlePaymentSuccess,
      handlePaymentError,
      getStatusType,
      getStatusText,
      formatTime
    }
  }
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 14px;
}

.order-info,
.payment-methods,
.payment-types,
.payment-component,
.payment-history {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-info h2,
.payment-methods h2,
.payment-types h2,
.payment-history h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 18px;
}

.order-details {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item.total {
  background: #f9f9f9;
  font-weight: bold;
}

.order-item .label {
  color: #666;
}

.order-item .value {
  color: #333;
}

.method-list,
.type-list {
  space-y: 10px;
}

.method-item,
.type-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover,
.type-item:hover {
  border-color: #409eff;
}

.method-item.active,
.type-item.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.method-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.method-icon {
  font-size: 24px;
  color: #07c160;
  margin-right: 15px;
}

.method-info {
  flex: 1;
}

.method-name,
.type-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

.type-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ff4757;
}

.history-list {
  space-y: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.payment-info {
  flex: 1;
}

.payment-type {
  font-weight: 500;
  color: #333;
}

.payment-amount {
  color: #ff4757;
  font-weight: bold;
}

.payment-time {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .order-info,
  .payment-methods,
  .payment-types,
  .payment-component,
  .payment-history {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .method-item,
  .type-item {
    padding: 12px;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>