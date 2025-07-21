/**
 * 用户状态管理模块
 * 
 * 功能说明：
 * - 使用Pinia管理用户登录状态和信息
 * - 提供用户认证相关的所有操作方法
 * - 自动处理Token的存储和验证
 * - 统一的错误处理和状态同步
 * 
 * 主要功能：
 * - 用户登录/注册/登出
 * - 用户信息获取和更新
 * - 头像上传和密码修改
 * - Token自动管理和验证
 * - 认证状态持久化
 * 
 * 状态数据：
 * - user: 当前用户信息对象
 * - token: JWT认证令牌
 * - isLoggedIn: 登录状态计算属性
 * 
 * 存储机制：
 * - 使用localStorage持久化Token
 * - 页面刷新时自动恢复登录状态
 * - 登出时清理所有本地数据
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { getToken, setToken, removeToken } from '@/utils/index'

export const useUserStore = defineStore('user', () => {
  // ==================== 响应式状态 ====================
  
  /** @type {Ref<Object|null>} 当前用户信息 */
  const user = ref(null)
  
  /** @type {Ref<string|null>} JWT认证令牌 */
  const token = ref(getToken())

  // ==================== 计算属性 ====================
  
  /** 
   * 用户登录状态
   * @type {ComputedRef<boolean>} 
   */
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 登录
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.status === 'success') {
        const { token: newToken, user: userData } = response.data.data
        
        // 保存token和用户信息
        token.value = newToken
        user.value = userData
        setToken(newToken)
        
        // 设置API默认请求头
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败，请稍后重试' 
      }
    }
  }

  // 注册
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.status === 'success') {
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('注册失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '注册失败，请稍后重试' 
      }
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    removeToken()
    delete api.defaults.headers.common['Authorization']
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      // 设置请求头
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      // 获取用户信息
      const response = await api.get('/auth/me')
      if (response.data.status === 'success') {
        user.value = response.data.data.user
        return true
      } else {
        // token无效，清除本地存储
        logout()
        return false
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      // token无效，清除本地存储
      logout()
      return false
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData)
      if (response.data.status === 'success') {
        user.value = { ...user.value, ...response.data.data.user }
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '更新失败，请稍后重试' 
      }
    }
  }

  // 上传头像
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.status === 'success') {
        user.value.avatar = response.data.data.avatar
        return { success: true, avatar: response.data.data.avatar }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('上传头像失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '上传失败，请稍后重试' 
      }
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      const response = await api.put('/auth/password', passwordData)
      if (response.data.status === 'success') {
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '修改失败，请稍后重试' 
      }
    }
  }

  return {
    // 状态
    user,
    token,
    
    // 计算属性
    isLoggedIn,
    
    // 方法
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    uploadAvatar,
    changePassword
  }
})