<template>
  <div class="mobile-test">
    <div class="test-header">
      <h2>移动端功能测试</h2>
      <el-tag :type="platformType">{{ platformText }}</el-tag>
    </div>

    <div class="test-sections">
      <!-- 平台信息测试 -->
      <el-card class="test-card">
        <template #header>
          <span>平台信息</span>
        </template>
        <div class="info-item">
          <strong>平台类型:</strong> {{ platformInfo.platform }}
        </div>
        <div class="info-item">
          <strong>是否原生:</strong> {{ platformInfo.isNative ? '是' : '否' }}
        </div>
        <div class="info-item">
          <strong>屏幕宽度:</strong> {{ screenWidth }}px
        </div>
      </el-card>

      <!-- 相机功能测试 -->
      <el-card class="test-card">
        <template #header>
          <span>相机功能</span>
        </template>
        <MobileCamera @photos-updated="handlePhotosUpdate" ref="cameraRef" />
        <div v-if="photoCount > 0" class="photo-info">
          已拍摄 {{ photoCount }} 张照片
        </div>
      </el-card>

      <!-- 地理位置测试 -->
      <el-card class="test-card">
        <template #header>
          <span>地理位置</span>
        </template>
        <el-button @click="getCurrentLocation" :loading="locationLoading">
          获取当前位置
        </el-button>
        <div v-if="location" class="location-info">
          <div><strong>纬度:</strong> {{ location.latitude }}</div>
          <div><strong>经度:</strong> {{ location.longitude }}</div>
          <div><strong>精度:</strong> {{ location.accuracy }}m</div>
        </div>
      </el-card>

      <!-- 设备信息测试 -->
      <el-card class="test-card">
        <template #header>
          <span>设备信息</span>
        </template>
        <el-button @click="getDeviceInfo" :loading="deviceLoading">
          获取设备信息
        </el-button>
        <div v-if="deviceInfo" class="device-info">
          <div><strong>操作系统:</strong> {{ deviceInfo.operatingSystem }}</div>
          <div><strong>平台:</strong> {{ deviceInfo.platform }}</div>
          <div><strong>是否虚拟设备:</strong> {{ deviceInfo.isVirtual ? '是' : '否' }}</div>
        </div>
      </el-card>

      <!-- 网络状态测试 -->
      <el-card class="test-card">
        <template #header>
          <span>网络状态</span>
        </template>
        <div class="network-status">
          <el-tag :type="networkStatus.connected ? 'success' : 'danger'">
            {{ networkStatus.connected ? '已连接' : '未连接' }}
          </el-tag>
          <div v-if="networkStatus.connectionType">
            连接类型: {{ networkStatus.connectionType }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { Device } from '@capacitor/device'
import { Network } from '@capacitor/network'
import { ElMessage } from 'element-plus'
import MobileCamera from '@/components/mobile/MobileCamera.vue'

// 响应式数据
const platformInfo = ref({
  platform: '',
  isNative: false
})
const screenWidth = ref(window.innerWidth)
const photoCount = ref(0)
const location = ref(null)
const locationLoading = ref(false)
const deviceInfo = ref(null)
const deviceLoading = ref(false)
const networkStatus = ref({
  connected: false,
  connectionType: ''
})
const cameraRef = ref(null)

// 计算属性
const platformType = computed(() => {
  return platformInfo.value.isNative ? 'success' : 'info'
})

const platformText = computed(() => {
  return platformInfo.value.isNative ? '移动端原生' : 'Web浏览器'
})

// 方法
const handlePhotosUpdate = (photos) => {
  photoCount.value = photos.length
}

const getCurrentLocation = async () => {
  try {
    locationLoading.value = true
    
    // Check if geolocation is available
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      throw new Error('地理位置功能不可用')
    }
    
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    })
    
    location.value = {
      latitude: coordinates.coords.latitude.toFixed(6),
      longitude: coordinates.coords.longitude.toFixed(6),
      accuracy: coordinates.coords.accuracy.toFixed(0)
    }
    
    ElMessage.success('位置获取成功')
  } catch (error) {
    console.error('获取位置失败:', error)
    
    // Provide specific error messages
    let errorMessage = '获取位置失败'
    if (error.message.includes('User denied')) {
      errorMessage = '用户拒绝了位置权限请求'
    } else if (error.message.includes('timeout')) {
      errorMessage = '位置获取超时，请检查GPS是否开启'
    } else if (error.message.includes('unavailable')) {
      errorMessage = '位置服务不可用'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    locationLoading.value = false
  }
}

const getDeviceInfo = async () => {
  try {
    deviceLoading.value = true
    
    const info = await Device.getInfo()
    deviceInfo.value = info
    
    ElMessage.success('设备信息获取成功')
  } catch (error) {
    console.error('获取设备信息失败:', error)
    ElMessage.error('获取设备信息失败')
  } finally {
    deviceLoading.value = false
  }
}

const checkNetworkStatus = async () => {
  try {
    const status = await Network.getStatus()
    networkStatus.value = {
      connected: status.connected,
      connectionType: status.connectionType
    }
  } catch (error) {
    console.error('获取网络状态失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 获取平台信息
  platformInfo.value = {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform()
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    screenWidth.value = window.innerWidth
  })
  
  // 检查网络状态
  await checkNetworkStatus()
  
  // 监听网络状态变化
  Network.addListener('networkStatusChange', (status) => {
    networkStatus.value = {
      connected: status.connected,
      connectionType: status.connectionType
    }
  })
})
</script>

<style scoped>
.mobile-test {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.test-header h2 {
  margin: 0;
  color: #409EFF;
}

.test-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.test-card {
  width: 100%;
}

.info-item,
.location-info div,
.device-info div {
  margin: 8px 0;
  padding: 4px 0;
}

.photo-info {
  margin-top: 12px;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409EFF;
}

.network-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 768px) {
  .mobile-test {
    padding: 12px;
  }
  
  .test-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>