/**
 * API配置文件
 * 根据环境自动选择API地址
 */

// 根据环境判断API基础地址
const getApiBaseUrl = () => {
  // 生产环境
  if (import.meta.env.PROD) {
    // 优先使用环境变量，回退到默认IP
    return import.meta.env.VITE_API_BASE_URL || 'http://116.62.44.24:3000/api'
  }

  // 开发环境
  return '/api'
}

export const API_BASE_URL = getApiBaseUrl()
export const UPLOAD_BASE_URL = import.meta.env.PROD
  ? 'http://116.62.44.24:3000/uploads'
  : '/uploads'