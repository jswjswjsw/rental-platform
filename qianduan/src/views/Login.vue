<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- 左侧装饰 -->
        <div class="login-decoration">
          <div class="decoration-content">
            <h2>欢迎回来</h2>
            <p>登录您的账号，继续您的租赁之旅</p>
            <div class="decoration-features">
              <div class="feature-item">
                <el-icon><Lock /></el-icon>
                <span>安全可靠</span>
              </div>
              <div class="feature-item">
                <el-icon><Star /></el-icon>
                <span>品质保证</span>
              </div>
              <div class="feature-item">
                <el-icon><Service /></el-icon>
                <span>贴心服务</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧登录表单 -->
        <div class="login-form-container">
          <div class="form-header">
            <h1>用户登录</h1>
            <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
          </div>
          
          <LoginForm @success="handleLoginSuccess" />
          
          <div class="form-footer">
            <div class="divider">
              <span>或者</span>
            </div>
            <div class="quick-actions">
              <el-button text @click="$router.push('/')">
                <el-icon><House /></el-icon>
                返回首页
              </el-button>
              <el-button text @click="$router.push('/help')">
                <el-icon><QuestionFilled /></el-icon>
                帮助中心
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Star, Service, House, QuestionFilled } from '@element-plus/icons-vue'
import LoginForm from '@/components/auth/LoginForm.vue'

const router = useRouter()
const route = useRoute()

// 处理登录成功
const handleLoginSuccess = () => {
  ElMessage.success('登录成功')
  
  // 如果有重定向地址，跳转到重定向地址，否则跳转到首页
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 900px;
}

.login-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
}

/* 左侧装饰 */
.login-decoration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-content {
  text-align: center;
}

.decoration-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.decoration-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.decoration-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  opacity: 0.9;
}

/* 右侧表单 */
.login-form-container {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #666;
  font-size: 0.9rem;
}

.form-header a {
  color: #409eff;
  text-decoration: none;
  font-weight: bold;
}

.form-header a:hover {
  text-decoration: underline;
}

/* 表单底部 */
.form-footer {
  margin-top: 2rem;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
}

.divider span {
  background: white;
  padding: 0 1rem;
  color: #999;
  font-size: 0.9rem;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.quick-actions .el-button {
  color: #666;
  font-size: 0.9rem;
}

.quick-actions .el-button:hover {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .login-decoration {
    display: none;
  }
  
  .login-form-container {
    padding: 30px 20px;
  }
  
  .form-header h1 {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }
  
  .login-form-container {
    padding: 20px 15px;
  }
}
</style>