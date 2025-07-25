<template>
  <div class="help-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>帮助中心</h1>
        <p>为您提供全面的使用指南和常见问题解答</p>
      </div>

      <!-- 搜索框 -->
      <div class="help-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帮助内容..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 快速导航 -->
      <div class="quick-nav">
        <div class="nav-item" @click="scrollToSection('getting-started')">
          <el-icon size="32" color="#409eff">
            <Guide />
          </el-icon>
          <h3>新手指南</h3>
          <p>快速了解平台使用方法</p>
        </div>
        <div class="nav-item" @click="scrollToSection('rental-guide')">
          <el-icon size="32" color="#67c23a">
            <Box />
          </el-icon>
          <h3>租赁指南</h3>
          <p>如何发布和租赁物品</p>
        </div>
        <div class="nav-item" @click="scrollToSection('safety')">
          <el-icon size="32" color="#e6a23c">
            <Lock />
          </el-icon>
          <h3>安全保障</h3>
          <p>了解平台安全机制</p>
        </div>
        <div class="nav-item" @click="scrollToSection('faq')">
          <el-icon size="32" color="#f56c6c">
            <QuestionFilled />
          </el-icon>
          <h3>常见问题</h3>
          <p>快速找到问题答案</p>
        </div>
      </div>

      <!-- 帮助内容 -->
      <div class="help-content">
        <!-- 新手指南 -->
        <section id="getting-started" class="help-section">
          <h2>新手指南</h2>
          <div class="section-content">
            <div class="guide-steps">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>注册账号</h3>
                  <p>使用邮箱注册账号，完善个人信息，通过实名认证</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>浏览物品</h3>
                  <p>在首页或物品列表页浏览感兴趣的物品，使用筛选功能快速找到需要的物品</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h3>发起租赁</h3>
                  <p>选择租赁时间，提交租赁申请，等待物品拥有者确认</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h3>完成交易</h3>
                  <p>按约定时间地点交接物品，使用完毕后归还并完成评价</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 租赁指南 -->
        <section id="rental-guide" class="help-section">
          <h2>租赁指南</h2>
          <div class="section-content">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="如何租赁" name="rent">
                <div class="tab-content">
                  <h3>租赁流程</h3>
                  <ol>
                    <li>浏览物品列表，找到心仪的物品</li>
                    <li>查看物品详情，包括价格、位置、描述等</li>
                    <li>选择租赁时间，计算总费用</li>
                    <li>提交租赁申请，填写联系方式和备注</li>
                    <li>等待物品拥有者确认申请</li>
                    <li>确认后按约定时间地点取物品</li>
                    <li>使用完毕后及时归还物品</li>
                    <li>对本次租赁进行评价</li>
                  </ol>
                </div>
              </el-tab-pane>
              <el-tab-pane label="如何发布" name="publish">
                <div class="tab-content">
                  <h3>发布物品</h3>
                  <ol>
                    <li>点击"发布物品"按钮</li>
                    <li>选择物品分类</li>
                    <li>填写物品标题和详细描述</li>
                    <li>上传物品图片（建议3-5张）</li>
                    <li>设置日租金和押金</li>
                    <li>填写物品位置和联系方式</li>
                    <li>提交发布，等待审核通过</li>
                  </ol>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </section>

        <!-- 安全保障 -->
        <section id="safety" class="help-section">
          <h2>安全保障</h2>
          <div class="section-content">
            <div class="safety-features">
              <div class="feature-item">
                <el-icon size="24" color="#409eff">
                  <UserFilled />
                </el-icon>
                <div>
                  <h3>实名认证</h3>
                  <p>所有用户需要通过实名认证，确保身份真实可靠</p>
                </div>
              </div>
              <div class="feature-item">
                <el-icon size="24" color="#67c23a">
                  <CreditCard />
                </el-icon>
                <div>
                  <h3>押金保障</h3>
                  <p>租赁时需要支付押金，保障物品安全，正常归还后全额退还</p>
                </div>
              </div>
              <div class="feature-item">
                <el-icon size="24" color="#e6a23c">
                  <Star />
                </el-icon>
                <div>
                  <h3>评价系统</h3>
                  <p>完善的评价体系，帮助用户了解物品和用户的真实情况</p>
                </div>
              </div>
              <div class="feature-item">
                <el-icon size="24" color="#f56c6c">
                  <Service />
                </el-icon>
                <div>
                  <h3>客服支持</h3>
                  <p>7×24小时客服在线，及时处理纠纷和问题</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 常见问题 -->
        <section id="faq" class="help-section">
          <h2>常见问题</h2>
          <div class="section-content">
            <el-collapse v-model="activeCollapse">
              <el-collapse-item title="如何注册账号？" name="1">
                <p>点击页面右上角的"注册"按钮，填写用户名、邮箱、密码等信息，验证邮箱后即可完成注册。建议完善个人信息并进行实名认证，以获得更好的使用体验。</p>
              </el-collapse-item>
              <el-collapse-item title="忘记密码怎么办？" name="2">
                <p>在登录页面点击"忘记密码"链接，输入注册邮箱，系统会发送重置密码的邮件到您的邮箱，按照邮件提示操作即可重置密码。</p>
              </el-collapse-item>
              <el-collapse-item title="如何修改个人信息？" name="3">
                <p>登录后点击右上角头像，选择"个人中心"，在个人信息页面可以修改昵称、手机号、头像等信息。</p>
              </el-collapse-item>
              <el-collapse-item title="租赁费用如何计算？" name="4">
                <p>租赁费用 = 日租金 × 租赁天数 + 押金。押金在物品正常归还后会全额退还到您的账户。</p>
              </el-collapse-item>
              <el-collapse-item title="如何取消租赁订单？" name="5">
                <p>在订单确认前，您可以在"我的订单"页面取消订单。订单确认后如需取消，请联系物品拥有者协商或联系客服处理。</p>
              </el-collapse-item>
              <el-collapse-item title="物品损坏了怎么办？" name="6">
                <p>如果物品在租赁期间发生损坏，请及时联系物品拥有者和客服。根据损坏程度，可能需要承担相应的赔偿责任。建议在取物品时仔细检查物品状况。</p>
              </el-collapse-item>
              <el-collapse-item title="如何联系客服？" name="7">
                <p>您可以通过以下方式联系客服：1. 拨打客服热线 400-123-4567；2. 发送邮件至 service@rental.com；3. 在线客服（工作时间 9:00-18:00）。</p>
              </el-collapse-item>
            </el-collapse>
          </div>
        </section>
      </div>

      <!-- 联系客服 -->
      <div class="contact-support">
        <div class="support-content">
          <h3>还有其他问题？</h3>
          <p>我们的客服团队随时为您提供帮助</p>
          <div class="support-actions">
            <el-button type="primary" size="large">
              <el-icon><Phone /></el-icon>
              联系客服
            </el-button>
            <el-button size="large">
              <el-icon><Message /></el-icon>
              在线咨询
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Search, Guide, Box, Lock, QuestionFilled, UserFilled, 
  CreditCard, Star, Service, Phone, Message 
} from '@element-plus/icons-vue'

// 响应式数据
const searchKeyword = ref('')
const activeTab = ref('rent')
const activeCollapse = ref(['1'])

// 搜索帮助内容
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    // TODO: 实现搜索功能
    console.log('搜索:', searchKeyword.value)
  }
}

// 滚动到指定区域
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.2rem;
  color: #666;
}

/* 搜索框 */
.help-search {
  max-width: 600px;
  margin: 0 auto 40px;
}

/* 快速导航 */
.quick-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
}

.nav-item {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nav-item h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 1rem 0 0.5rem;
}

.nav-item p {
  color: #666;
  font-size: 0.9rem;
}

/* 帮助内容 */
.help-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.help-section {
  padding: 40px;
  border-bottom: 1px solid #eee;
}

.help-section:last-child {
  border-bottom: none;
}

.help-section h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #409eff;
}

/* 新手指南步骤 */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.step-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #666;
  line-height: 1.6;
}

/* 标签页内容 */
.tab-content h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1rem;
}

.tab-content ol {
  padding-left: 20px;
}

.tab-content li {
  color: #666;
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

/* 安全特性 */
.safety-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.feature-item h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-item p {
  color: #666;
  line-height: 1.6;
}

/* 联系客服 */
.contact-support {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: white;
  margin-top: 40px;
}

.support-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.support-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.support-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.support-actions .el-button {
  padding: 12px 24px;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .quick-nav {
    grid-template-columns: 1fr;
  }
  
  .help-section {
    padding: 30px 20px;
  }
  
  .guide-steps {
    gap: 20px;
  }
  
  .step-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .safety-features {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .support-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .support-actions .el-button {
    width: 200px;
  }
}
</style>