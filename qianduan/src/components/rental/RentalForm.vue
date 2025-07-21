<template>
  <div class="rental-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="large"
    >
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="选择开始日期"
          :disabled-date="disabledStartDate"
          style="width: 100%"
          @change="calculateTotal"
        />
      </el-form-item>
      
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="选择结束日期"
          :disabled-date="disabledEndDate"
          style="width: 100%"
          @change="calculateTotal"
        />
      </el-form-item>
      
      <el-form-item label="租赁天数">
        <el-input :value="rentalDays + ' 天'" readonly />
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <!-- 费用明细 -->
      <div class="cost-breakdown">
        <h4>费用明细</h4>
        <div class="cost-item">
          <span>日租金：</span>
          <span>¥{{ formatPrice(resource.price_per_day) }} × {{ rentalDays }} 天</span>
          <span>¥{{ formatPrice(rentalCost) }}</span>
        </div>
        <div v-if="resource.deposit > 0" class="cost-item">
          <span>押金：</span>
          <span></span>
          <span>¥{{ formatPrice(resource.deposit) }}</span>
        </div>
        <div class="cost-total">
          <span>总计：</span>
          <span></span>
          <span>¥{{ formatPrice(totalCost) }}</span>
        </div>
      </div>
      
      <!-- 租赁须知 -->
      <div class="rental-notice">
        <h4>租赁须知</h4>
        <ul>
          <li>请按约定时间地点取还物品</li>
          <li>使用过程中请爱护物品，如有损坏需要赔偿</li>
          <li>押金将在物品正常归还后全额退还</li>
          <li>如有问题请及时联系物主或客服</li>
        </ul>
      </div>
      
      <div class="form-actions">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting"
          @click="handleSubmit"
        >
          提交申请
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { formatPrice, getDaysBetween } from '@/utils/index'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['success', 'cancel'])

// 响应式数据
const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({
  startDate: null,
  endDate: null,
  remark: ''
})

// 计算属性
const rentalDays = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  return getDaysBetween(form.startDate, form.endDate)
})

const rentalCost = computed(() => {
  return rentalDays.value * props.resource.price_per_day
})

const totalCost = computed(() => {
  return rentalCost.value + (props.resource.deposit || 0)
})

// 验证规则
const rules = {
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
}

// 禁用开始日期
const disabledStartDate = (date) => {
  // 不能选择今天之前的日期
  return date < new Date().setHours(0, 0, 0, 0)
}

// 禁用结束日期
const disabledEndDate = (date) => {
  if (!form.startDate) return true
  // 结束日期必须在开始日期之后
  return date <= form.startDate
}

// 计算总费用
const calculateTotal = () => {
  // 触发计算属性更新
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    if (rentalDays.value <= 0) {
      ElMessage.error('租赁天数必须大于0')
      return
    }
    
    submitting.value = true
    
    const requestData = {
      resource_id: props.resource.id,
      start_date: form.startDate,
      end_date: form.endDate,
      remark: form.remark
    }
    
    const response = await api.post('/orders', requestData)
    
    if (response.data.status === 'success') {
      ElMessage.success('租赁申请已提交')
      emit('success')
    } else {
      ElMessage.error(response.data.message || '提交失败')
    }
  } catch (error) {
    console.error('提交租赁申请失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.rental-form {
  padding: 20px 0;
}

/* 费用明细 */
.cost-breakdown {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.cost-breakdown h4 {
  margin: 0 0 15px;
  color: #333;
  font-size: 1.1rem;
}

.cost-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}

.cost-total {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  font-size: 1rem;
}

/* 租赁须知 */
.rental-notice {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.rental-notice h4 {
  margin: 0 0 15px;
  color: #d48806;
  font-size: 1.1rem;
}

.rental-notice ul {
  margin: 0;
  padding-left: 20px;
  color: #8c6e00;
}

.rental-notice li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-actions .el-button {
  padding: 10px 25px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .cost-item,
  .cost-total {
    grid-template-columns: 1fr;
    gap: 5px;
    text-align: left;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>