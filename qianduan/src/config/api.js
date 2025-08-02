/**
 * API配置文件
 * 根据环境自动选择API地址
 */

// 根据环境判断API基础地址
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // 生产环境回退地址
  if (import.meta.env.PROD) {
    return 'http://116.62.44.24:3000/api'
  }

  // 开发环境使用代理
  return '/api'
}

// 获取上传文件基础地址
const getUploadBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_UPLOAD_BASE_URL) {
    return import.meta.env.VITE_UPLOAD_BASE_URL
  }

  // 生产环境回退地址
  if (import.meta.env.PROD) {
    return 'http://116.62.44.24:3000/uploads'
  }

  // 开发环境使用代理
  return '/uploads'
}

export const API_BASE_URL = getApiBaseUrl()
export const UPLOAD_BASE_URL = getUploadBaseUrl()