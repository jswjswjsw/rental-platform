<!--
  微信支付组件
  
  功能说明：
  - 集成微信JSAPI支付
  - 支持H5支付（移动端）
  - 支付状态实时查询
  - 支付结果处理
  
  使用方式：
  <WechatPay 
    :order="orderData" 
    :payment-type="'rent'" 
    @success="handlePaySuccess"
    @error="handlePayError"
  />
  
  @author 开发团队
  @version 1.0.0
  @since 2024-08-02
-->

<template>
  <div class="wechat-pay">
    <!-- 支付信息展示 -->
    <div class="payment-info">
      <div class="amount">
        <span class="label">支付金额：</span>
        <span class="value">¥{{ (amount / 100).toFixed(2) }}</span>
      </div>
      <div class="type">
        <span class="label">支付类型：</span>
        <span class="value">{{ paymentTypeText }}</span>
      </div>
      <div class="order-info">
        <span class="label">订单信息：</span>
        <span class="value">{{ order.resource_title }}</span>
      </div>
    </div>

    <!-- 支付按钮 -->
    <div class="payment-actions">
      <el-button 
        type="primary" 
        size="large"
        :loading="paying"
        @click="handlePay"
        class="pay-button"
      >
        <i class="el-icon-wallet"></i>
        {{ paying ? '支付中...' : '微信支付' }}
      </el-button>
    </div>

    <!-- 支付状态 -->
    <div v-if="paymentStatus" class="payment-status">
      <el-alert
        :title="statusText"
        :type="statusType"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

export default {
  name: 'WechatPay',
  props: {
    order: {
      type: Object,
      required: true
    },
    paymentType: {
      type: String,
      required: true,
      validator: (value) => ['rent', 'deposit'].includes(value)
    }
  },
  emits: ['success', 'error'],
  setup(props, { emit }) {
    const paying = ref(false)
    const paymentStatus = ref('')
    const paymentId = ref(null)
    const amount = ref(0)

    // 计算支付金额
    const calculateAmount = () => {
      if (props.paymentType === 'rent') {
        amount.value = Math.round(props.order.total_price * 100)
      } else if (props.paymentType === 'deposit') {
        amount.value = Math.round(props.order.deposit * 100)
      }
    }

    // 支付类型文本
    const paymentTypeText = computed(() => {
      return props.paymentType === 'rent' ? '租赁费用' : '押金'
    })

    // 状态文本和类型
    const statusText = computed(() => {
      switch (paymentStatus.value) {
        case 'pending':
          return '等待支付中...'
        case 'success':
          return '支付成功！'
        case 'failed':
          return '支付失败，请重试'
        case 'cancelled':
          return '支付已取消'
        default:
          return ''
      }
    })

    const statusType = computed(() => {
      switch (paymentStatus.value) {
        case 'pending':
          return 'info'
        case 'success':
          return 'success'
        case 'failed':
          return 'error'
        case 'cancelled':
          return 'warning'
        default:
          return 'info'
      }
    })

    // 检测微信环境
    const isWechat = () => {
      const ua = navigator.userAgent.toLowerCase()
      return ua.includes('micromessenger')
    }

    // 创建支付订单
    const createPayment = async () => {
      console.log('📝 开始创建支付订单', {
        orderId: props.order.id,
        paymentType: props.paymentType
      });
      try {
        const tradeType = isWechat() ? 'JSAPI' : 'H5'
        
        const response = await api.post('/payments/wechat/create', {
          order_id: props.order.id,
          payment_type: props.paymentType,
          trade_type: tradeType,
          openid: getOpenId() // 如果是JSAPI支付需要获取openid
        })

        if (response.data.status === 'success') {
          return response.data.data
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        console.error('创建支付订单失败:', error)
        throw error
      }
    }

    // 获取OpenID（需要根据实际情况实现）
    const getOpenId = () => {
      // 这里需要根据你的微信授权流程来获取openid
      // 可以从localStorage、cookie或者通过API获取
      return localStorage.getItem('wechat_openid') || ''
    }

    // 调用微信支付
    const callWechatPay = (paymentParams) => {
      return new Promise((resolve, reject) => {
        if (typeof window.WeixinJSBridge === 'undefined') {
          // 如果不在微信环境中，模拟支付成功（开发测试用）
          if (import.meta.env.DEV) {
            console.warn('开发环境：模拟微信支付成功')
            setTimeout(() => resolve({ err_msg: 'get_brand_wcpay_request:ok' }), 2000)
            return
          }
          reject(new Error('请在微信中打开'))
          return
        }

        window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
          appId: paymentParams.appId,
          timeStamp: paymentParams.timeStamp,
          nonceStr: paymentParams.nonceStr,
          package: paymentParams.package,
          signType: paymentParams.signType,
          paySign: paymentParams.paySign
        }, (res) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            resolve(res)
          } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
            reject(new Error('用户取消支付'))
          } else {
            reject(new Error('支付失败'))
          }
        })
      })
    }

    // 处理H5支付
    const handleH5Pay = (mwebUrl) => {
      // 跳转到微信H5支付页面
      window.location.href = mwebUrl
    }

    // 查询支付状态
    const checkPaymentStatus = async (paymentId) => {
      try {
        const response = await api.get(`/payments/${paymentId}/status`)
        if (response.data.status === 'success') {
          return response.data.data.status
        }
        return 'pending'
      } catch (error) {
        console.error('查询支付状态失败:', error)
        return 'failed'
      }
    }

    // 轮询支付状态
    const pollPaymentStatus = (paymentId) => {
      const poll = async () => {
        const status = await checkPaymentStatus(paymentId)
        paymentStatus.value = status

        if (status === 'success') {
          ElMessage.success('支付成功！')
          emit('success', { paymentId, paymentType: props.paymentType })
        } else if (status === 'failed') {
          ElMessage.error('支付失败，请重试')
          emit('error', new Error('支付失败'))
        } else if (status === 'pending') {
          // 继续轮询
          setTimeout(poll, 2000)
        }
      }
      
      poll()
    }

    // 主支付处理函数
    const handlePay = async () => {
      console.log('🔄 支付按钮被点击', { 
        paymentType: props.paymentType, 
        orderId: props.order?.id,
        paying: paying.value 
      });
      
      if (paying.value) {
        console.log('⚠️ 支付正在进行中，忽略重复点击');
        return;
      }

      try {
        paying.value = true
        paymentStatus.value = 'pending'

        // 创建支付订单
        const paymentData = await createPayment()
        paymentId.value = paymentData.payment_id

        if (paymentData.trade_type === 'JSAPI') {
          // JSAPI支付
          await callWechatPay(paymentData.payment_params)
          // 支付成功后查询状态
          pollPaymentStatus(paymentData.payment_id)
        } else if (paymentData.trade_type === 'H5') {
          // H5支付
          handleH5Pay(paymentData.payment_params.mweb_url)
        }

      } catch (error) {
        console.error('支付失败:', error)
        ElMessage.error(error.message || '支付失败，请重试')
        paymentStatus.value = 'failed'
        emit('error', error)
      } finally {
        paying.value = false
      }
    }

    onMounted(() => {
      calculateAmount()
    })

    return {
      paying,
      paymentStatus,
      amount,
      paymentTypeText,
      statusText,
      statusType,
      handlePay
    }
  }
}
</script>

<style scoped>
.wechat-pay {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-info {
  margin-bottom: 20px;
}

.payment-info > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.payment-info > div:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.amount .value {
  color: #ff4757;
  font-size: 18px;
  font-weight: bold;
}

.payment-actions {
  text-align: center;
  margin: 20px 0;
}

.pay-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  background: #07c160;
  border-color: #07c160;
}

.pay-button:hover {
  background: #06ad56;
  border-color: #06ad56;
}

.payment-status {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .wechat-pay {
    padding: 15px;
    margin: 10px;
  }
  
  .pay-button {
    height: 45px;
    font-size: 15px;
  }
}
</style>