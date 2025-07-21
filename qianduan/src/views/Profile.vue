<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <h1>个人中心</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>

      <div class="profile-content">
        <el-row :gutter="20">
          <!-- 左侧菜单 -->
          <el-col :span="6">
            <el-menu
              :default-active="activeTab"
              @select="handleMenuSelect"
              class="profile-menu"
            >
              <el-menu-item index="info">
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </el-menu-item>
              <el-menu-item index="avatar">
                <el-icon><Picture /></el-icon>
                <span>头像设置</span>
              </el-menu-item>
              <el-menu-item index="password">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </el-menu-item>
              <el-menu-item index="resources">
                <el-icon><Box /></el-icon>
                <span>我的物品</span>
              </el-menu-item>
              <el-menu-item index="favorites">
                <el-icon><Star /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>
            </el-menu>
          </el-col>

          <!-- 右侧内容 -->
          <el-col :span="18">
            <div class="profile-panel">
              <!-- 基本信息 -->
              <div v-if="activeTab === 'info'" class="info-panel">
                <h3>基本信息</h3>
                <el-form
                  ref="infoFormRef"
                  :model="userInfo"
                  :rules="infoRules"
                  label-width="100px"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="userInfo.username" disabled />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userInfo.email" disabled />
                  </el-form-item>
                  <el-form-item label="真实姓名" prop="real_name">
                    <el-input v-model="userInfo.real_name" placeholder="请输入真实姓名" />
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="updateUserInfo" :loading="updating">
                      保存修改
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 头像设置 -->
              <div v-if="activeTab === 'avatar'" class="avatar-panel">
                <h3>头像设置</h3>
                <div class="avatar-section">
                  <div class="current-avatar">
                    <el-avatar :src="userStore.user?.avatar" :size="120">
                      <el-icon size="60"><User /></el-icon>
                    </el-avatar>
                  </div>
                  <div class="avatar-upload">
                    <el-upload
                      :show-file-list="false"
                      :before-upload="beforeAvatarUpload"
                      :http-request="uploadAvatar"
                      accept="image/*"
                    >
                      <el-button type="primary">上传新头像</el-button>
                    </el-upload>
                    <p class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                  </div>
                </div>
              </div>

              <!-- 修改密码 -->
              <div v-if="activeTab === 'password'" class="password-panel">
                <h3>修改密码</h3>
                <el-form
                  ref="passwordFormRef"
                  :model="passwordForm"
                  :rules="passwordRules"
                  label-width="100px"
                >
                  <el-form-item label="原密码" prop="oldPassword">
                    <el-input
                      v-model="passwordForm.oldPassword"
                      type="password"
                      show-password
                      placeholder="请输入原密码"
                    />
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input
                      v-model="passwordForm.newPassword"
                      type="password"
                      show-password
                      placeholder="请输入新密码"
                    />
                  </el-form-item>
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      show-password
                      placeholder="请再次输入新密码"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="changePassword" :loading="changingPassword">
                      修改密码
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 我的物品 -->
              <div v-if="activeTab === 'resources'" class="resources-panel">
                <h3>我的物品</h3>
                <div class="resources-actions">
                  <el-button type="primary" @click="$router.push('/publish')">
                    <el-icon><Plus /></el-icon>
                    发布新物品
                  </el-button>
                </div>
                <div class="resources-list">
                  <el-table :data="myResources" v-loading="loadingResources">
                    <el-table-column prop="title" label="物品名称" />
                    <el-table-column prop="price_per_day" label="日租金">
                      <template #default="{ row }">
                        ¥{{ formatPrice(row.price_per_day) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态">
                      <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                          {{ getResourceStatusText(row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="view_count" label="浏览量" />
                    <el-table-column prop="created_at" label="发布时间">
                      <template #default="{ row }">
                        {{ formatDate(row.created_at) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                      <template #default="{ row }">
                        <el-button size="small" @click="viewResource(row.id)">查看</el-button>
                        <el-button size="small" type="primary" @click="editResource(row.id)">编辑</el-button>
                        <el-button size="small" type="danger" @click="deleteResource(row.id)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>

              <!-- 我的收藏 -->
              <div v-if="activeTab === 'favorites'" class="favorites-panel">
                <h3>我的收藏</h3>
                <div v-if="myFavorites.length === 0 && !loadingFavorites" class="empty-state">
                  <el-empty description="暂无收藏物品">
                    <el-button type="primary" @click="$router.push('/resources')">
                      去找物品
                    </el-button>
                  </el-empty>
                </div>
                <div v-else class="favorites-grid" v-loading="loadingFavorites">
                  <div 
                    v-for="favorite in myFavorites" 
                    :key="favorite.id"
                    class="favorite-card"
                    @click="viewResource(favorite.resource_id)"
                  >
                    <div class="favorite-image">
                      <img :src="getFavoriteImage(favorite.images)" :alt="favorite.title" />
                    </div>
                    <div class="favorite-content">
                      <h4>{{ favorite.title }}</h4>
                      <p class="favorite-price">¥{{ formatPrice(favorite.price_per_day) }}/天</p>
                      <p class="favorite-location">{{ favorite.location || '位置未知' }}</p>
                      <div class="favorite-actions">
                        <el-button size="small" type="primary" @click.stop="viewResource(favorite.resource_id)">
                          查看详情
                        </el-button>
                        <el-button size="small" type="danger" @click.stop="removeFavorite(favorite.resource_id)">
                          取消收藏
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Picture, Lock, Box, Plus, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import api from '@/utils/api'
import { formatPrice, formatDate, getResourceStatusText, getImageUrl } from '@/utils/index'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('info')
const updating = ref(false)
const changingPassword = ref(false)
const loadingResources = ref(false)
const loadingFavorites = ref(false)
const myResources = ref([])
const myFavorites = ref([])

// 表单引用
const infoFormRef = ref()
const passwordFormRef = ref()

// 用户信息表单
const userInfo = reactive({
  username: '',
  email: '',
  real_name: '',
  phone: ''
})

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const infoRules = {
  real_name: [
    { max: 50, message: '真实姓名不能超过50个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 菜单选择
const handleMenuSelect = (key) => {
  activeTab.value = key
  if (key === 'resources') {
    loadMyResources()
  } else if (key === 'favorites') {
    loadMyFavorites()
  }
}

// 更新用户信息
const updateUserInfo = async () => {
  if (!infoFormRef.value) return
  
  try {
    const valid = await infoFormRef.value.validate()
    if (!valid) return
    
    updating.value = true
    const result = await userStore.updateProfile({
      real_name: userInfo.real_name,
      phone: userInfo.phone
    })
    
    if (result.success) {
      ElMessage.success('信息更新成功')
    } else {
      ElMessage.error(result.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    updating.value = false
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传头像
const uploadAvatar = async ({ file }) => {
  try {
    const result = await userStore.uploadAvatar(file)
    if (result.success) {
      ElMessage.success('头像更新成功')
    } else {
      ElMessage.error(result.message || '上传失败')
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('上传失败，请稍后重试')
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    
    changingPassword.value = true
    const result = await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (result.success) {
      ElMessage.success('密码修改成功')
      // 清空表单
      Object.keys(passwordForm).forEach(key => {
        passwordForm[key] = ''
      })
    } else {
      ElMessage.error(result.message || '修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改失败，请稍后重试')
  } finally {
    changingPassword.value = false
  }
}

// 加载我的物品
const loadMyResources = async () => {
  try {
    loadingResources.value = true
    const response = await api.get('/users/resources')
    if (response.data.status === 'success') {
      myResources.value = response.data.data.resources
    }
  } catch (error) {
    console.error('加载我的物品失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loadingResources.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    available: 'success',
    rented: 'warning',
    maintenance: 'info',
    offline: 'danger'
  }
  return typeMap[status] || 'info'
}

// 查看物品
const viewResource = (id) => {
  router.push(`/resources/${id}`)
}

// 编辑物品
const editResource = (id) => {
  router.push(`/publish?edit=${id}`)
}

// 删除物品
const deleteResource = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个物品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await api.delete(`/resources/${id}`)
    if (response.data.status === 'success') {
      ElMessage.success('删除成功')
      loadMyResources() // 重新加载列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物品失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 加载我的收藏
const loadMyFavorites = async () => {
  try {
    loadingFavorites.value = true
    const response = await api.get('/favorites')
    if (response.data.status === 'success') {
      myFavorites.value = response.data.data.favorites
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
    ElMessage.error('加载收藏失败，请稍后重试')
  } finally {
    loadingFavorites.value = false
  }
}

// 获取收藏物品图片
const getFavoriteImage = (images) => {
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

// 取消收藏
const removeFavorite = async (resourceId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏这个物品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await api.delete(`/favorites/${resourceId}`)
    ElMessage.success('取消收藏成功')
    loadMyFavorites() // 重新加载收藏列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败，请稍后重试')
    }
  }
}

// 初始化
onMounted(() => {
  if (userStore.user) {
    userInfo.username = userStore.user.username
    userInfo.email = userStore.user.email
    userInfo.real_name = userStore.user.real_name || ''
    userInfo.phone = userStore.user.phone || ''
  }
  
  // 检查URL参数，自动切换标签页
  const urlParams = new URLSearchParams(window.location.search)
  const tab = urlParams.get('tab')
  if (tab && ['info', 'avatar', 'password', 'resources'].includes(tab)) {
    activeTab.value = tab
    if (tab === 'resources') {
      loadMyResources()
    }
  }
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.profile-header p {
  color: #666;
  font-size: 1rem;
}

.profile-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.profile-menu {
  border-right: 1px solid #e4e7ed;
}

.profile-panel {
  padding-left: 2rem;
}

.profile-panel h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.2rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.current-avatar {
  text-align: center;
}

.avatar-upload .upload-tip {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.resources-actions {
  margin-bottom: 1rem;
}

.resources-list {
  margin-top: 1rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.favorite-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.favorite-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-content {
  padding: 1rem;
}

.favorite-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.favorite-price {
  color: #e6a23c;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.favorite-location {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.favorite-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .profile-content {
    padding: 1rem;
  }
  
  .profile-panel {
    padding-left: 0;
    margin-top: 1rem;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>