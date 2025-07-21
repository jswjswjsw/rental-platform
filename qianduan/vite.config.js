/**
 * Vite 构建配置文件
 * 
 * 功能说明：
 * - 配置Vue3项目的构建和开发环境
 * - 设置路径别名简化导入
 * - 配置开发服务器和API代理
 * - 优化构建输出和资源管理
 * 
 * 主要配置：
 * - Vue插件：支持Vue3单文件组件
 * - 路径别名：@指向src目录
 * - 开发服务器：端口8080，API代理到后端
 * - 构建配置：输出目录和资源目录设置
 * 
 * 开发特性：
 * - 热重载：代码修改后自动刷新
 * - API代理：前端请求自动转发到后端
 * - 路径解析：简化模块导入路径
 * - 构建优化：代码分割和资源压缩
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // ==================== 插件配置 ====================

  /**
   * Vite插件配置
   * - vue(): 支持Vue3单文件组件编译
   */
  plugins: [vue()],

  // ==================== 路径解析配置 ====================

  /**
   * 模块解析配置
   */
  resolve: {
    /**
     * 路径别名配置
     * @: 指向src目录，简化导入路径
     * 
     * 使用示例：
     * import Component from '@/components/Component.vue'
     * 等价于：
     * import Component from './src/components/Component.vue'
     */
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // ==================== 开发服务器配置 ====================

  /**
   * 开发服务器配置
   */
  server: {
    /**
     * 开发服务器端口
     * 前端应用将在 http://localhost:8080 运行
     */
    port: 8080,

    /**
     * API代理配置
     * 将前端的/api请求代理到后端服务器
     * 
     * 代理规则：
     * - 前端请求：http://localhost:8080/api/users
     * - 实际请求：http://localhost:3000/api/users
     * - 前端请求：http://localhost:8080/uploads/image.jpg
     * - 实际请求：http://localhost:3000/uploads/image.jpg
     * 
     * 配置说明：
     * - target: 后端服务器地址
     * - changeOrigin: 修改请求头中的origin字段
     */
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  // ==================== 构建配置 ====================

  /**
   * 生产构建配置
   */
  build: {
    /**
     * 构建输出目录
     * 构建后的文件将输出到dist目录
     */
    outDir: 'dist',

    /**
     * 静态资源目录
     * CSS、JS、图片等资源文件将放在assets目录下
     */
    assetsDir: 'assets'
  }
})