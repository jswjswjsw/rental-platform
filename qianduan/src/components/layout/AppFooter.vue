<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 主要内容区域 -->
      <div class="footer-content">
        <!-- 公司信息 -->
        <div class="footer-section">
          <div class="footer-logo">
            <el-icon size="24" color="#409eff">
              <Box />
            </el-icon>
            <span>闲置租赁</span>
          </div>
          <p class="footer-description">
            让闲置物品发挥价值，让生活更加便利。
            我们致力于打造最安全、最便捷的闲置资源租赁平台。
          </p>
          <div class="social-links">
            <el-button circle size="small">
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
            <el-button circle size="small">
              <el-icon><Message /></el-icon>
            </el-button>
            <el-button circle size="small">
              <el-icon><Phone /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul class="footer-links">
            <li><a href="/">首页</a></li>
            <li><a href="/resources">找物品</a></li>
            <li><a href="/publish">发布物品</a></li>
            <li><a href="/orders">我的订单</a></li>
            <li><a href="/help">帮助中心</a></li>
          </ul>
        </div>

        <!-- 服务支持 -->
        <div class="footer-section">
          <h3>服务支持</h3>
          <ul class="footer-links">
            <li><a href="/help/faq">常见问题</a></li>
            <li><a href="/help/safety">安全保障</a></li>
            <li><a href="/help/rules">租赁规则</a></li>
            <li><a href="/help/contact">联系我们</a></li>
            <li><a href="/help/feedback">意见反馈</a></li>
          </ul>
        </div>

        <!-- 联系信息 -->
        <div class="footer-section">
          <h3>联系我们</h3>
          <div class="contact-info">
            <div class="contact-item">
              <el-icon><Phone /></el-icon>
              <span>400-123-4567</span>
            </div>
            <div class="contact-item">
              <el-icon><Message /></el-icon>
              <span>service@rental.com</span>
            </div>
            <div class="contact-item">
              <el-icon><Location /></el-icon>
              <span>北京市朝阳区xxx街道xxx号</span>
            </div>
            <div class="contact-item">
              <el-icon><Clock /></el-icon>
              <span>服务时间：9:00-18:00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; 2024 闲置租赁平台. 保留所有权利.</p>
          <div class="footer-links-inline">
            <a href="/privacy">隐私政策</a>
            <span>|</span>
            <a href="/terms">服务条款</a>
            <span>|</span>
            <a href="/legal">法律声明</a>
          </div>
        </div>
        <div class="footer-stats">
          <span>已服务用户 <strong>10,000+</strong></span>
          <span>成功交易 <strong>50,000+</strong></span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { 
  Box, ChatDotRound, Message, Phone, Location, Clock 
} from '@element-plus/icons-vue'
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 主要内容区域 */
.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  padding: 3rem 0 2rem;
}

.footer-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

/* 公司信息 */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.footer-description {
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-links .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.social-links .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 链接列表 */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

/* 联系信息 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 底部版权 */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.copyright p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.footer-links-inline {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.footer-links-inline a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s;
}

.footer-links-inline a:hover {
  color: white;
}

.footer-links-inline span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.footer-stats {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.footer-stats strong {
  color: #ffd700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .footer-links-inline {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 15px;
  }
  
  .footer-content {
    padding: 2rem 0 1rem;
  }
  
  .footer-bottom {
    padding: 1rem 0;
  }
  
  .social-links {
    justify-content: center;
  }
}
</style>