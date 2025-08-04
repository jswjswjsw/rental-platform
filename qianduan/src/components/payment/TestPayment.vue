<template>
  <div class="test-payment">
    <h3>🧪 支付功能测试组件</h3>
    
    <div class="test-info">
      <p><strong>订单ID:</strong> {{ order?.id || '未设置' }}</p>
      <p><strong>支付类型:</strong> {{ paymentType || '未设置' }}</p>
      <p><strong>支付状态:</strong> {{ paying ? '进行中' : '待支付' }}</p>
    </div>
    
    <div class="test-buttons">
      <button 
        class="test-btn primary"
        :disabled="paying"
        @click="testBasicClick"
      >
        基础点击测试
      </button>
      
      <button 
        class="test-btn success"
        :disabled="paying"
        @click="testPaymentFlow"
      >
        {{ paying ? '支付中...' : '测试支付流程' }}
      </button>
      
      <button 
        class="test-btn info"
        @click="testApiConnection"
      >
        测试API连接
      </button>
    </div>
    
    <div v-if="testResult" class="test-result" :class="testResult.type">
      <h4>测试结果:</h4>
      <pre>{{ testResult.message }}</pre>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

export default {
  name: 'TestPayment',
  props: {
    order: {
      type: Object,
      default: () => ({ id: 'test-order-123' })
    },
    paymentType: {
      type: String,
      default: 'rent'
    }
  },
  setup(props) {
    const paying = ref(false)
    const testResult = ref(null)
    
    const testBasicClick = () => {
      console.log('🖱️ 基础点击测试');
      testResult.value = {
        type: 'success',
        message: '✅ 基础点击功能正常！\n按钮可以响应点击事件。'
      };
      ElMessage.success('基础点击测试成功');
    }
    
    const testPaymentFlow = async () => {
      if (paying.value) return;
      
      console.log('🔄 开始测试支付流程');
      paying.value = true;
      testResult.value = {
        type: 'info',
        message: '⏳ 正在测试支付流程...'
      };
      
      try {
        // 模拟支付流程
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('📝 模拟创建支付订单');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('💳 模拟调用支付接口');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ 支付流程测试完成');
        
        testResult.value = {
          type: 'success',
          message: '✅ 支付流程测试成功！\n所有步骤都正常执行。'
        };
        ElMessage.success('支付流程测试成功');
        
      } catch (error) {
        console.error('❌ 支付流程测试失败:', error);
        testResult.value = {
          type: 'error',
          message: `❌ 支付流程测试失败：${error.message}`
        };
        ElMessage.error('支付流程测试失败');
      } finally {
        paying.value = false;
      }
    }
    
    const testApiConnection = async () => {
      console.log('🌐 测试API连接');
      testResult.value = {
        type: 'info',
        message: '⏳ 正在测试API连接...'
      };
      
      try {
        const response = await api.get('/health');
        console.log('✅ API连接成功:', response.data);
        
        testResult.value = {
          type: 'success',
          message: `✅ API连接成功！\n响应: ${JSON.stringify(response.data, null, 2)}`
        };
        ElMessage.success('API连接测试成功');
        
      } catch (error) {
        console.error('❌ API连接失败:', error);
        testResult.value = {
          type: 'error',
          message: `❌ API连接失败：${error.message}\n请检查后端服务是否启动`
        };
        ElMessage.error('API连接测试失败');
      }
    }
    
    return {
      paying,
      testResult,
      testBasicClick,
      testPaymentFlow,
      testApiConnection
    }
  }
}
</script>

<style scoped>
.test-payment {
  padding: 20px;
  border: 2px dashed #409eff;
  border-radius: 8px;
  margin: 20px 0;
  background: #f0f9ff;
}

.test-info {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.test-info p {
  margin: 5px 0;
}

.test-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-btn.primary {
  background: #409eff;
  color: white;
}

.test-btn.success {
  background: #67c23a;
  color: white;
}

.test-btn.info {
  background: #909399;
  color: white;
}

.test-result {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.test-result.success {
  background: #f0f9ff;
  border: 1px solid #409eff;
  color: #409eff;
}

.test-result.error {
  background: #fef0f0;
  border: 1px solid #f56c6c;
  color: #f56c6c;
}

.test-result.info {
  background: #f4f4f5;
  border: 1px solid #909399;
  color: #606266;
}

.test-result pre {
  white-space: pre-wrap;
  margin: 10px 0 0 0;
  font-family: monospace;
}
</style>