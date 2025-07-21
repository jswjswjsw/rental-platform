/**
 * 通用工具函数模块
 * 
 * 功能说明：
 * - 提供应用中常用的工具函数
 * - Token管理、日期格式化、数据验证等
 * - 统一的数据处理和格式化方法
 * - 业务相关的辅助函数
 * 
 * 主要功能分类：
 * - Token管理：本地存储的Token操作
 * - 日期处理：日期格式化和计算
 * - 数据格式化：价格、文件大小等
 * - 防抖节流：性能优化函数
 * - 数据验证：邮箱、手机号等验证
 * - 业务辅助：状态文本、图片处理等
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

// ==================== Token管理 ====================

/** JWT Token在localStorage中的存储键名 */
const TOKEN_KEY = 'rental_token'

/**
 * 获取本地存储的Token
 * @returns {string|null} JWT Token或null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置Token到本地存储
 * @param {string} token - JWT Token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 从本地存储中移除Token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

// ==================== 日期处理 ====================

/**
 * 日期格式化函数
 * @param {string|Date} date - 要格式化的日期
 * @param {string} format - 格式化模板，默认'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 * 
 * 支持的格式化标记：
 * - YYYY: 四位年份
 * - MM: 两位月份
 * - DD: 两位日期
 * - HH: 两位小时
 * - mm: 两位分钟
 * - ss: 两位秒钟
 * 
 * @example
 * formatDate('2024-01-01') // '2024-01-01'
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // '2024-01-01 12:30:45'
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// ==================== 数据格式化 ====================

/**
 * 价格格式化函数
 * @param {number|string|null|undefined} price - 价格数值
 * @returns {string} 格式化后的价格字符串，保留两位小数
 * 
 * @example
 * formatPrice(123.4) // '123.40'
 * formatPrice(null) // '0.00'
 * formatPrice('99.9') // '99.90'
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}

/**
 * 文件大小格式化函数
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 * 
 * @example
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 * formatFileSize(0) // '0 B'
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ==================== 性能优化函数 ====================

/**
 * 防抖函数 - 延迟执行，多次调用只执行最后一次
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 * 
 * 使用场景：搜索输入、窗口resize事件等
 * 
 * @example
 * const debouncedSearch = debounce(searchFunction, 300)
 * input.addEventListener('input', debouncedSearch)
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数 - 限制执行频率，固定时间间隔内只执行一次
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 * 
 * 使用场景：滚动事件、按钮点击等
 * 
 * @example
 * const throttledScroll = throttle(scrollHandler, 100)
 * window.addEventListener('scroll', throttledScroll)
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// ==================== 业务辅助函数 ====================

/**
 * 图片URL处理函数
 * @param {string} imagePath - 图片路径
 * @returns {string} 处理后的完整图片URL
 * 
 * 处理逻辑：
 * - 空值返回默认占位图
 * - 完整URL直接返回
 * - 相对路径添加服务器地址
 * 
 * @example
 * getImageUrl('/uploads/image.jpg') // 'http://localhost:3000/uploads/image.jpg'
 * getImageUrl('http://example.com/image.jpg') // 'http://example.com/image.jpg'
 * getImageUrl(null) // '/images/placeholder.jpg'
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg'
  
  // 如果是完整URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // 如果是相对路径，通过前端代理访问
  if (imagePath.startsWith('/uploads/')) {
    return imagePath // 直接返回相对路径，让前端代理处理
  }
  
  return imagePath
}

/**
 * 获取资源状态的中文文本
 * @param {string} status - 资源状态英文标识
 * @returns {string} 中文状态文本
 * 
 * 状态映射：
 * - available: 可租赁
 * - rented: 已租出
 * - maintenance: 维护中
 * - offline: 已下架
 */
export const getResourceStatusText = (status) => {
  const statusMap = {
    available: '可租赁',
    rented: '已租出',
    maintenance: '维护中',
    offline: '已下架'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取订单状态的中文文本
 * @param {string} status - 订单状态英文标识
 * @returns {string} 中文状态文本
 * 
 * 状态映射：
 * - pending: 待确认
 * - confirmed: 已确认
 * - ongoing: 进行中
 * - completed: 已完成
 * - cancelled: 已取消
 * - dispute: 争议中
 */
export const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待确认',
    confirmed: '已确认',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    dispute: '争议中'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取订单状态对应的Element Plus标签颜色
 * @param {string} status - 订单状态英文标识
 * @returns {string} Element Plus标签颜色类型
 * 
 * 颜色映射：
 * - pending: warning (橙色)
 * - confirmed: primary (蓝色)
 * - ongoing: success (绿色)
 * - completed: info (灰色)
 * - cancelled: danger (红色)
 * - dispute: danger (红色)
 */
export const getOrderStatusColor = (status) => {
  const colorMap = {
    pending: 'warning',
    confirmed: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger',
    dispute: 'danger'
  }
  return colorMap[status] || 'info'
}

/**
 * 计算两个日期之间的天数
 * @param {string|Date} startDate - 开始日期
 * @param {string|Date} endDate - 结束日期
 * @returns {number} 相差的天数（向上取整）
 * 
 * @example
 * getDaysBetween('2024-01-01', '2024-01-03') // 2
 * getDaysBetween(new Date('2024-01-01'), new Date('2024-01-02')) // 1
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const timeDiff = end.getTime() - start.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

// ==================== 数据验证函数 ====================

/**
 * 验证邮箱格式是否正确
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱格式
 * 
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证中国大陆手机号格式是否正确
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否为有效手机号格式
 * 
 * 支持的格式：1开头的11位数字，第二位为3-9
 * 
 * @example
 * isValidPhone('13812345678') // true
 * isValidPhone('12345678901') // false
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// ==================== 其他工具函数 ====================

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度，默认8位
 * @returns {string} 随机字符串
 * 
 * 字符集包含：大小写字母和数字
 * 
 * @example
 * generateRandomString() // 'aB3dE7fG'
 * generateRandomString(12) // 'aB3dE7fGhI9j'
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 深拷贝后的对象
 * 
 * 支持的数据类型：
 * - 基本类型：直接返回
 * - Date对象：创建新的Date实例
 * - Array：递归拷贝每个元素
 * - Object：递归拷贝每个属性
 * 
 * @example
 * const original = { a: 1, b: { c: 2 } }
 * const copied = deepClone(original)
 * copied.b.c = 3 // 不会影响original.b.c
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 数组去重函数
 * @param {Array} arr - 要去重的数组
 * @param {string} key - 对象数组去重时的键名（可选）
 * @returns {Array} 去重后的数组
 * 
 * 使用场景：
 * - 基本类型数组去重
 * - 对象数组按指定属性去重
 * 
 * @example
 * uniqueArray([1, 2, 2, 3]) // [1, 2, 3]
 * uniqueArray([{id: 1}, {id: 2}, {id: 1}], 'id') // [{id: 1}, {id: 2}]
 */
export const uniqueArray = (arr, key) => {
  if (!key) {
    return [...new Set(arr)]
  }
  
  const seen = new Set()
  return arr.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 获取当前页面URL的查询参数
 * @returns {Object} 包含所有查询参数的对象
 * 
 * @example
 * // 当前URL: http://example.com?name=John&age=25
 * getUrlParams() // { name: 'John', age: '25' }
 */
export const getUrlParams = () => {
  const params = {}
  const urlSearchParams = new URLSearchParams(window.location.search)
  for (const [key, value] of urlSearchParams) {
    params[key] = value
  }
  return params
}