/**
 * Vue Router 路由配置模块
 * 
 * 功能说明：
 * - 配置应用的所有路由规则
 * - 实现路由级别的权限控制
 * - 支持路由懒加载优化性能
 * - 提供路由守卫和页面标题管理
 * 
 * 路由特性：
 * - 懒加载：按需加载页面组件
 * - 权限控制：区分公开页面和需要认证的页面
 * - 重定向处理：已登录用户访问登录页时的处理
 * - 404处理：未匹配路由的统一处理
 * 
 * 权限级别：
 * - 公开页面：所有用户可访问
 * - 认证页面：需要登录后访问
 * - 隐藏页面：已登录用户不显示（如登录页）
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

// 路由组件懒加载配置
// 使用动态导入实现代码分割，提高首屏加载速度
const Home = () => import('@/views/Home.vue')
const Resources = () => import('@/views/Resources.vue')
const ResourceDetail = () => import('@/views/ResourceDetail.vue')
const Publish = () => import('@/views/Publish.vue')
const Orders = () => import('@/views/Orders.vue')
const OrderDetail = () => import('@/views/OrderDetail.vue')
const Profile = () => import('@/views/Profile.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Help = () => import('@/views/Help.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
    meta: {
      title: '找物品'
    }
  },
  {
    path: '/resources/:id',
    name: 'ResourceDetail',
    component: ResourceDetail,
    meta: {
      title: '物品详情'
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: {
      title: '发布物品',
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: {
      title: '我的订单',
      requiresAuth: true
    }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: {
      title: '订单详情',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hideForAuth: true // 已登录用户隐藏
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      hideForAuth: true
    }
  },

  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: {
      title: '帮助中心'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面不存在'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 闲置租赁平台`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 检查本地token
      const hasValidToken = await userStore.checkAuth()
      if (!hasValidToken) {
        ElMessage.warning('请先登录')
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }

  // 已登录用户访问登录/注册页面时重定向
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    next('/')
    return
  }

  next()
})

export default router