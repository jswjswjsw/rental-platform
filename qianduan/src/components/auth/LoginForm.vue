<!--
  用户登录表单组件
  
  功能说明：
  - 提供用户登录功能
  - 支持用户名或邮箱登录
  - 表单验证和错误处理
  - 记住登录状态选项
  - 忘记密码链接
  
  表单字段：
  - username: 用户名或邮箱
  - password: 登录密码
  - remember: 记住我选项
  
  验证规则：
  - 用户名/邮箱：必填
  - 密码：必填，最少6位
  
  交互功能：
  - 表单提交验证
  - 登录状态加载
  - 成功后事件通知
  - 切换到注册表单
-->
<template>
  <div class="login-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="0"
      size="large"
    >
      <!-- 用户名或邮箱输入框 -->
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="用户名或邮箱"
          prefix-icon="User"
          clearable
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          prefix-icon="Lock"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      
      <el-form-item>
        <div class="form-options">
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          style="width: 100%"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="form-footer">
      <p>还没有账号？<el-link type="primary" @click="$emit('switchToRegister')">立即注册</el-link></p>
    </div>
  </div>
</template>

<script setup>
/**
 * 登录表单组件脚本
 * 
 * 功能实现：
 * - 表单数据管理和验证
 * - 用户登录逻辑处理
 * - 加载状态管理
 * - 事件通信和错误处理
 * 
 * 使用的Vue3特性：
 * - Composition API
 * - 响应式数据（ref, reactive）
 * - 组件通信（defineEmits）
 * - 状态管理集成
 */

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// ==================== 组件通信 ====================

/** 
 * 定义组件事件
 * - success: 登录成功事件
 * - switchToRegister: 切换到注册表单事件
 */
const emit = defineEmits(['success', 'switchToRegister'])

// ==================== 实例和引用 ====================

/** 用户状态管理实例 */
const userStore = useUserStore()

/** 表单引用，用于验证操作 */
const formRef = ref()

/** 登录加载状态 */
const loading = ref(false)

// ==================== 表单数据 ====================

/** 
 * 登录表单数据
 * @type {Object}
 */
const form = reactive({
  username: '',    // 用户名或邮箱
  password: '',    // 登录密码
  remember: false  // 记住我选项
})

// ==================== 验证规则 ====================

/** 
 * 表单验证规则配置
 * 使用Element Plus的表单验证规则格式
 */
const rules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const result = await userStore.login({
      username: form.username,
      password: form.password
    })
    
    if (result.success) {
      ElMessage.success('登录成功')
      emit('success')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  padding: 20px 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.form-footer p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>