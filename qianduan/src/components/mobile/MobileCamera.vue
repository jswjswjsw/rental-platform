<template>
  <div class="mobile-camera">
    <el-button 
      type="primary" 
      @click="takePhoto"
      :loading="loading"
      class="camera-button"
    >
      <el-icon><CameraIcon /></el-icon>
      {{ loading ? '拍照中...' : '拍照上传' }}
    </el-button>
    
    <div v-if="photos.length > 0" class="photo-preview">
      <div 
        v-for="(photo, index) in photos" 
        :key="index"
        class="photo-item"
      >
        <img :src="photo.webPath" :alt="`照片 ${index + 1}`" />
        <el-button 
          type="danger" 
          size="small" 
          @click="removePhoto(index)"
          class="remove-btn"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { ElMessage } from 'element-plus'
import { Camera as CameraIcon, Delete } from '@element-plus/icons-vue'

const emit = defineEmits(['photos-updated'])

const loading = ref(false)
const photos = ref([])

const takePhoto = async () => {
  try {
    loading.value = true
    
    if (!Capacitor.isNativePlatform()) {
      // Web端使用文件选择器
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.onchange = handleFileSelect
      input.click()
      return
    }
    
    // 移动端使用相机
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    })
    
    photos.value.push({
      webPath: image.webPath,
      format: image.format
    })
    
    emit('photos-updated', photos.value)
    ElMessage.success('照片添加成功')
    
  } catch (error) {
    console.error('拍照失败:', error)
    ElMessage.error('拍照失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  
  // Validate file types
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const validFiles = files.filter(file => {
    if (!validTypes.includes(file.type)) {
      ElMessage.error(`不支持的文件类型: ${file.name}`)
      return false
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      ElMessage.error(`文件过大: ${file.name}`)
      return false
    }
    return true
  })
  
  validFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      photos.value.push({
        webPath: e.target.result,
        format: file.type.split('/')[1],
        file: file
      })
      emit('photos-updated', photos.value)
    }
    reader.readAsDataURL(file)
  })
  
  loading.value = false
  if (validFiles.length > 0) {
    ElMessage.success(`已选择 ${validFiles.length} 张照片`)
  }
}

const removePhoto = (index) => {
  photos.value.splice(index, 1)
  emit('photos-updated', photos.value)
  ElMessage.success('照片已删除')
}

// 暴露方法给父组件
defineExpose({
  photos,
  clearPhotos: () => {
    photos.value = []
    emit('photos-updated', photos.value)
  }
})
</script>

<style scoped>
.mobile-camera {
  margin: 16px 0;
}

.camera-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.photo-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>