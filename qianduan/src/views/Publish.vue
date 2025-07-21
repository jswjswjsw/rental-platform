<template>
  <div class="publish-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>发布物品</h1>
        <p>分享您的闲置物品，让它们发挥更大价值</p>
      </div>

      <!-- 发布表单 -->
      <div class="publish-form-container">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          size="large"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h3>基本信息</h3>
            
            <el-form-item label="物品分类" prop="categoryId">
              <el-select 
                v-model="form.categoryId" 
                placeholder="请选择物品分类"
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="物品标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入物品标题，简洁明了"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="物品描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="详细描述物品的特点、使用情况、注意事项等"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </div>

          <!-- 物品图片 -->
          <div class="form-section">
            <h3>物品图片</h3>
            
            <el-form-item label="上传图片" prop="images">
              <el-upload
                v-model:file-list="fileList"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="handleImageChange"
                :on-remove="handleImageRemove"
                :before-upload="beforeImageUpload"
                multiple
                :limit="5"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">
                    支持jpg/png格式，单张图片不超过5MB，最多上传5张
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </div>

          <!-- 租赁信息 -->
          <div class="form-section">
            <h3>租赁信息</h3>
            
            <el-form-item label="日租金" prop="pricePerDay">
              <el-input-number
                v-model="form.pricePerDay"
                :min="0.01"
                :precision="2"
                :step="1"
                style="width: 200px"
              />
              <span style="margin-left: 10px; color: #666;">元/天</span>
            </el-form-item>
            
            <el-form-item label="押金" prop="deposit">
              <el-input-number
                v-model="form.deposit"
                :min="0"
                :precision="2"
                :step="10"
                style="width: 200px"
              />
              <span style="margin-left: 10px; color: #666;">元（可选）</span>
            </el-form-item>
          </div>

          <!-- 联系信息 -->
          <div class="form-section">
            <h3>联系信息</h3>
            
            <el-form-item label="物品位置" prop="location">
              <el-input
                v-model="form.location"
                placeholder="请输入物品所在位置，如：北京市朝阳区"
                maxlength="100"
              />
            </el-form-item>
            
            <el-form-item label="联系方式" prop="contactInfo">
              <el-input
                v-model="form.contactInfo"
                type="textarea"
                :rows="2"
                placeholder="请输入联系方式，如微信号、QQ号等（可选）"
                maxlength="200"
              />
            </el-form-item>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <el-button size="large" @click="resetForm">重置</el-button>
            <el-button 
              type="primary" 
              size="large" 
              :loading="submitting"
              @click="handleSubmit"
            >
              发布物品
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '@/utils/api'

const router = useRouter()

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const categories = ref([])
const fileList = ref([])

// 表单数据
const form = reactive({
  categoryId: null,
  title: '',
  description: '',
  pricePerDay: null,
  deposit: 0,
  location: '',
  contactInfo: '',
  images: []
})

// 验证规则
const rules = {
  categoryId: [
    { required: true, message: '请选择物品分类', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入物品标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2-100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ],
  pricePerDay: [
    { required: true, message: '请输入日租金', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '日租金必须大于0', trigger: 'blur' }
  ],
  deposit: [
    { type: 'number', min: 0, message: '押金不能小于0', trigger: 'blur' }
  ],
  location: [
    { max: 100, message: '位置信息不能超过100个字符', trigger: 'blur' }
  ],
  contactInfo: [
    { max: 200, message: '联系方式不能超过200个字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    if (response.data.status === 'success') {
      categories.value = response.data.data.categories
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    ElMessage.error('获取分类失败')
  }
}

// 处理图片变化
const handleImageChange = (file) => {
  if (file.status === 'ready') {
    form.images.push(file.raw)
  }
}

// 处理图片移除
const handleImageRemove = (file) => {
  const index = form.images.findIndex(img => img.name === file.name)
  if (index > -1) {
    form.images.splice(index, 1)
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  fileList.value = []
  form.images = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    if (form.images.length === 0) {
      ElMessage.warning('请至少上传一张物品图片')
      return
    }
    
    submitting.value = true
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('category_id', form.categoryId)
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('price_per_day', form.pricePerDay)
    formData.append('deposit', form.deposit)
    formData.append('location', form.location)
    formData.append('contact_info', form.contactInfo)
    
    // 添加图片文件
    form.images.forEach(image => {
      formData.append('images', image)
    })
    
    const response = await api.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.status === 'success') {
      ElMessage.success('物品发布成功')
      router.push('/resources')
    } else {
      ElMessage.error(response.data.message || '发布失败')
    }
  } catch (error) {
    console.error('发布物品失败:', error)
    ElMessage.error('发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 页面加载
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
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

/* 表单容器 */
.publish-form-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 表单分组 */
.form-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 20px;
}

.form-section h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

/* 表单项样式 */
.el-form-item {
  margin-bottom: 25px;
}

.el-form-item__label {
  font-weight: 500;
  color: #333;
}

/* 图片上传样式 */
.el-upload--picture-card {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}

.el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}

/* 提交按钮 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-actions .el-button {
  padding: 12px 30px;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .publish-form-container {
    padding: 30px 20px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .form-section h3 {
    font-size: 1.1rem;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions .el-button {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .publish-form-container {
    padding: 20px 15px;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>