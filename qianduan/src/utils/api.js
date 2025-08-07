/**
 * HTTP请求工具模块
 * 
 * 功能说明：
 * - 基于Axios封装的HTTP客户端
 * - 统一的请求/响应拦截处理
 * - 自动Token认证和错误处理
 * - 标准化的错误消息提示
 * 
 * 主要特性：
 * - 请求拦截：自动添加认证Token
 * - 响应拦截：统一错误处理和消息提示
 * - 超时控制：防止请求长时间等待
 * - 状态码处理：针对不同HTTP状态码的处理
 * 
 * 错误处理：
 * - 401: 未授权，自动清除Token并跳转登录
 * - 403: 权限不足提示
 * - 404: 资源不存在提示
 * - 422: 表单验证错误处理
 * - 429: 请求频率限制提示
 * - 500: 服务器错误提示
 * - 网络错误: 连接失败提示
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './index'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_MOBILE === 'true' 
    ? 'http://116.62.44.24:3000/api'  // 移动端直接访问API服务器
    : import.meta.env.VITE_API_BASE_URL || '/api',  // 使用环境变量或默认代理路径
  timeout: 10000,  // 请求超时时间：10秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('响应错误:', error)
    
    // 处理不同的错误状态码
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          removeToken()
          delete api.defaults.headers.common['Authorization']
          ElMessage.error(data.message || '登录已过期，请重新登录')
          
          // 如果不是在登录页面，跳转到登录页面
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          ElMessage.error(data.message || '没有权限访问')
          break
          
        case 404:
          ElMessage.error(data.message || '请求的资源不存在')
          break
          
        case 422:
          // 表单验证错误
          if (data.errors) {
            const firstError = Object.values(data.errors)[0]
            ElMessage.error(Array.isArray(firstError) ? firstError[0] : firstError)
          } else {
            ElMessage.error(data.message || '请求参数错误')
          }
          break
          
        case 429:
          ElMessage.error('请求过于频繁，请稍后再试')
          break
          
        case 500:
          ElMessage.error(data.message || '服务器内部错误')
          break
          
        default:
          ElMessage.error(data.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      ElMessage.error('请求失败，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

export default api