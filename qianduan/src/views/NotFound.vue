<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <!-- 404图标 -->
        <div class="error-icon">
          <el-icon size="120" color="#e6a23c">
            <Warning />
          </el-icon>
        </div>
        
        <!-- 错误信息 -->
        <div class="error-info">
          <h1>404</h1>
          <h2>页面不存在</h2>
          <p>抱歉，您访问的页面不存在或已被删除</p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="error-actions">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
        
        <!-- 推荐链接 -->
        <div class="suggestions">
          <h3>您可能想要：</h3>
          <div class="suggestion-links">
            <router-link to="/" class="suggestion-link">
              <el-icon><House /></el-icon>
              <span>浏览首页</span>
            </router-link>
            <router-link to="/resources" class="suggestion-link">
              <el-icon><Search /></el-icon>
              <span>查找物品</span>
            </router-link>
            <router-link to="/publish" class="suggestion-link">
              <el-icon><Plus /></el-icon>
              <span>发布物品</span>
            </router-link>
            <router-link to="/help" class="suggestion-link">
              <el-icon><QuestionFilled /></el-icon>
              <span>帮助中心</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Warning, House, Back, Search, Plus, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.not-found-content {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 错误图标 */
.error-icon {
  margin-bottom: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 错误信息 */
.error-info h1 {
  font-size: 6rem;
  font-weight: bold;
  color: #e6a23c;
  margin: 0;
  line-height: 1;
}

.error-info h2 {
  font-size: 2rem;
  color: #333;
  margin: 1rem 0;
}

.error-info p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* 操作按钮 */
.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.error-actions .el-button {
  padding: 12px 24px;
  font-size: 1rem;
}

/* 推荐链接 */
.suggestions h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.suggestion-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
}

.suggestion-link:hover {
  background: #e9ecef;
  color: #409eff;
  transform: translateY(-2px);
}

.suggestion-link span {
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 30px;
  }
  
  .error-info h1 {
    font-size: 4rem;
  }
  
  .error-info h2 {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .el-button {
    width: 200px;
  }
  
  .suggestion-links {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .not-found-content {
    padding: 30px 20px;
  }
  
  .error-info h1 {
    font-size: 3rem;
  }
  
  .error-info h2 {
    font-size: 1.3rem;
  }
  
  .error-info p {
    font-size: 1rem;
  }
}
</style>