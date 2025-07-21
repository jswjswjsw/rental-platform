<template>
  <div class="register-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="0"
      size="large"
    >
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="用户名"
          prefix-icon="User"
          clearable
        />
      </el-form-item>
      
      <el-form-item prop="email">
        <el-input
          v-model="form.email"
          placeholder="邮箱"
          prefix-icon="Message"
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
        />
      </el-form-item>
      
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码"
          prefix-icon="Lock"
          show-password
          @keyup.enter="handleRegister"
        />
      </el-form-item>
      
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="手机号（可选）"
          prefix-icon="Phone"
          clearable
        />
      </el-form-item>
      
      <el-form-item prop="realName">
        <el-input
          v-model="form.realName"
          placeholder="真实姓名（可选）"
          prefix-icon="UserFilled"
          clearable
        />
      </el-form-item>
      
      <el-form-item prop="agreement">
        <el-checkbox v-model="form.agreement">
          我已阅读并同意
          <el-link type="primary" :underline="false">《用户协议》</el-link>
          和
          <el-link type="primary" :underline="false">《隐私政策》</el-link>
        </el-checkbox>
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          style="width: 100%"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="form-footer">
      <p>已有账号？<el-link type="primary" @click="$emit('switchToLogin')">立即登录</el-link></p>
    </div>
  </div>
</template>

<script setup>
/**
 * 注册表单组件脚本
 * 
 * 功能实现：
 * - 用户注册表单数据管理
 * - 复杂的表单验证规则
 * - 密码确认验证
 * - 邮箱和手机号格式验证
 * - 用户协议确认
 * 
 * 验证特性：
 * - 用户名：3-20位字母数字下划线
 * - 邮箱：标准邮箱格式验证
 * - 密码：最少6位，必须包含字母和数字
 * - 密码确认：与密码一致性验证
 * - 手机号：中国大陆手机号格式（可选）
 * - 用户协议：必须同意才能注册
 * 
 * 使用的Vue3特性：
 * - Composition API
 * - 响应式数据管理
 * - 自定义验证函数
 * - 组件事件通信
 */

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { isValidEmail, isValidPhone } from '@/utils/index'

// ==================== 组件通信 ====================

/** 
 * 定义组件事件
 * - success: 注册成功事件
 * - switchToLogin: 切换到登录表单事件
 */
const emit = defineEmits(['success', 'switchToLogin'])

// ==================== 实例和引用 ====================

/** 用户状态管理实例 */
const userStore = useUserStore()

/** 表单引用，用于验证操作 */
const formRef = ref()

/** 注册加载状态 */
const loading = ref(false)

// ==================== 表单数据 ====================

/** 
 * 注册表单数据
 * @type {Object}
 */
const form = reactive({
  username: '',        // 用户名
  email: '',          // 邮箱地址
  password: '',       // 登录密码
  confirmPassword: '', // 确认密码
  phone: '',          // 手机号码（可选）
  realName: '',       // 真实姓名（可选）
  agreement: false    // 用户协议同意状态
})

// 自定义验证函数
const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线，长度3-20位'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!isValidEmail(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (value && !isValidPhone(value)) {
    callback(new Error('请输入正确的手机号格式'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

// 验证规则
const rules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  agreement: [{ validator: validateAgreement, trigger: 'change' }]
}

// 处理注册
const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const result = await userStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      real_name: form.realName || undefined
    })
    
    if (result.success) {
      ElMessage.success('注册成功')
      emit('success')
    } else {
      ElMessage.error(result.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-form {
  padding: 20px 0;
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