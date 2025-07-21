<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <!-- 左侧装饰 -->
        <div class="register-decoration">
          <div class="decoration-content">
            <h2>加入我们</h2>
            <p>注册账号，开启您的闲置物品租赁之旅</p>
            <div class="decoration-stats">
              <div class="stat-item">
                <div class="stat-number">10,000+</div>
                <div class="stat-label">注册用户</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50,000+</div>
                <div class="stat-label">成功交易</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">1,000+</div>
                <div class="stat-label">物品种类</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧注册表单 -->
        <div class="register-form-container">
          <div class="form-header">
            <h1>用户注册</h1>
            <p>已有账号？<router-link to="/login">立即登录</router-link></p>
          </div>
          
          <RegisterForm @success="handleRegisterSuccess" />
          
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, QuestionFilled } from '@element-plus/icons-vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()

// 处理注册成功
const handleRegisterSuccess = () => {
  ElMessage.success('注册成功，请登录')
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 1000px;
}

.register-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

/* 左侧装饰 */
.register-decoration {
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

.decoration-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 右侧表单 */
.register-form-container {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
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
  margin-top: 1.5rem;
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
  .register-card {
    grid-template-columns: 1fr;
    max-width: 450px;
  }
  
  .register-decoration {
    display: none;
  }
  
  .register-form-container {
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
  .register-page {
    padding: 10px;
  }
  
  .register-form-container {
    padding: 20px 15px;
  }
}
</style>