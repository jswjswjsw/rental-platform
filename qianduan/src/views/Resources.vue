<template>
  <div class="resources-page">
    <div class="container">
      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <div class="search-bar">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索物品..."
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
        
        <div class="filter-bar">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="选择分类"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
          
          <el-input
            v-model="searchForm.location"
            placeholder="位置"
            clearable
            @keyup.enter="handleSearch"
          />
          
          <div class="price-range">
            <el-input
              v-model="searchForm.minPrice"
              placeholder="最低价"
              type="number"
              @keyup.enter="handleSearch"
            />
            <span>-</span>
            <el-input
              v-model="searchForm.maxPrice"
              placeholder="最高价"
              type="number"
              @keyup.enter="handleSearch"
            />
          </div>
          
          <el-select
            v-model="searchForm.sortBy"
            placeholder="排序方式"
            @change="handleSearch"
          >
            <el-option label="最新发布" value="created_at" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="浏览量最多" value="view_count" />
          </el-select>
          
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 结果统计 -->
      <div class="result-info">
        <span>共找到 {{ pagination.total }} 件物品</span>
        <div class="view-mode">
          <el-radio-group v-model="viewMode" @change="handleViewModeChange">
            <el-radio-button label="grid">
              <el-icon><Grid /></el-icon>
            </el-radio-button>
            <el-radio-button label="list">
              <el-icon><List /></el-icon>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <!-- 资源列表 -->
      <div v-loading="loading" class="resources-container">
        <div v-if="resources.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无相关物品" />
        </div>
        
        <div v-else :class="['resources-grid', viewMode]">
          <ResourceCard
            v-for="resource in resources"
            :key="resource.id"
            :resource="resource"
            :view-mode="viewMode"
            @click="goToDetail(resource.id)"
          />
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Grid, List } from '@element-plus/icons-vue'
import api from '@/utils/api'
import ResourceCard from '@/components/resource/ResourceCard.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const resources = ref([])
const categories = ref([])
const viewMode = ref('grid')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  categoryId: null,
  location: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'created_at'
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
})

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    if (response.data.status === 'success') {
      categories.value = response.data.data.categories
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取资源列表
const fetchResources = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: searchForm.sortBy
    }
    
    if (searchForm.keyword) params.search = searchForm.keyword
    if (searchForm.categoryId) params.category_id = searchForm.categoryId
    if (searchForm.location) params.location = searchForm.location
    if (searchForm.minPrice) params.min_price = searchForm.minPrice
    if (searchForm.maxPrice) params.max_price = searchForm.maxPrice
    
    const response = await api.get('/resources', { params })
    
    if (response.data.status === 'success') {
      resources.value = response.data.data.resources
      Object.assign(pagination, response.data.data.pagination)
    }
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error('获取资源列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchResources()
  updateUrl()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    categoryId: null,
    location: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at'
  })
  pagination.page = 1
  fetchResources()
  updateUrl()
}

// 处理分页变化
const handlePageChange = (page) => {
  pagination.page = page
  fetchResources()
  updateUrl()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  fetchResources()
  updateUrl()
}

// 处理视图模式变化
const handleViewModeChange = () => {
  localStorage.setItem('resources_view_mode', viewMode.value)
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/resources/${id}`)
}

// 更新URL参数
const updateUrl = () => {
  const query = {}
  
  if (searchForm.keyword) query.search = searchForm.keyword
  if (searchForm.categoryId) query.category = searchForm.categoryId
  if (searchForm.location) query.location = searchForm.location
  if (searchForm.minPrice) query.min_price = searchForm.minPrice
  if (searchForm.maxPrice) query.max_price = searchForm.maxPrice
  if (searchForm.sortBy !== 'created_at') query.sort = searchForm.sortBy
  if (pagination.page > 1) query.page = pagination.page
  if (pagination.limit !== 12) query.limit = pagination.limit
  
  router.replace({ query })
}

// 从URL参数初始化搜索条件
const initFromQuery = () => {
  const query = route.query
  
  if (query.search) searchForm.keyword = query.search
  if (query.category) searchForm.categoryId = Number(query.category)
  if (query.location) searchForm.location = query.location
  if (query.min_price) searchForm.minPrice = query.min_price
  if (query.max_price) searchForm.maxPrice = query.max_price
  if (query.sort) searchForm.sortBy = query.sort
  if (query.page) pagination.page = Number(query.page)
  if (query.limit) pagination.limit = Number(query.limit)
}

// 初始化视图模式
const initViewMode = () => {
  const savedMode = localStorage.getItem('resources_view_mode')
  if (savedMode) {
    viewMode.value = savedMode
  }
}

// 监听路由变化
watch(() => route.query, () => {
  initFromQuery()
  fetchResources()
}, { deep: true })

// 页面加载
onMounted(() => {
  initViewMode()
  initFromQuery()
  fetchCategories()
  fetchResources()
})
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 搜索区域 */
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 15px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-range .el-input {
  width: 100px;
}

/* 结果信息 */
.result-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
}

.view-mode {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 资源网格 */
.resources-container {
  min-height: 400px;
}

.resources-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.resources-grid.list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-bar > * {
    width: 100%;
  }
  
  .price-range {
    justify-content: center;
  }
  
  .result-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .resources-grid.grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .search-section {
    padding: 15px;
  }
  
  .resources-grid.grid {
    grid-template-columns: 1fr;
  }
}
</style>