/**
 * 前端应用主入口文件
 * 
 * 功能说明：
 * - 创建Vue3应用实例
 * - 配置全局插件和组件库
 * - 注册路由和状态管理
 * - 初始化Element Plus UI组件库
 * - 注册所有Element Plus图标组件
 * 
 * 技术栈：
 * - Vue 3 - 渐进式JavaScript框架
 * - Pinia - Vue状态管理库
 * - Element Plus - Vue3组件库
 * - Vue Router - 官方路由管理器
 * 
 * 全局配置：
 * - Element Plus组件库及样式
 * - 所有Element Plus图标组件
 * - Pinia状态管理
 * - Vue Router路由
 * - 全局样式文件
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')