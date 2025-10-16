<template>
  <div class="poem-list-view">
    <div class="page-header">
      <h1 class="page-title">诗词列表</h1>
      <p class="page-subtitle">浏览所有收录的经典诗词</p>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-group">
        <label for="category-filter">分类筛选:</label>
        <select 
          id="category-filter"
          v-model="selectedCategory" 
          @change="handleCategoryChange"
          class="form-input"
        >
          <option value="">全部分类</option>
          <option 
            v-for="category in poemStore.categories" 
            :key="category.id"
            :value="category.name"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="search-input">搜索:</label>
        <input
          id="search-input"
          v-model="searchKeyword"
          type="text"
          placeholder="搜索诗词标题、作者..."
          class="form-input"
          @input="handleSearch"
        />
      </div>

      <button @click="clearFilters" class="btn btn-outline">
        清除筛选
      </button>
    </div>

    <!-- 诗词网格 -->
    <div class="poems-grid" v-if="!poemStore.loading">
      <div 
        v-for="poem in displayedPoems" 
        :key="poem.id"
        class="poem-card"
        @click="goToPoemDetail(poem.id)"
      >
        <div class="poem-header">
          <h3 class="poem-title">{{ poem.title }}</h3>
          <div class="poem-meta">
            <span class="poem-author">{{ poem.author }}</span>
            <span class="poem-dynasty">{{ poem.dynasty }}</span>
          </div>
        </div>
        
        <div class="poem-content">
          {{ poem.content.replace(/\\\\n|\\n/g, '\n').split('\n').slice(0, 2).join('\n') }}
        </div>
        
        <div class="poem-footer">
          <div class="poem-tags">
            <span 
              v-for="tag in poem.tags.slice(0, 3)" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
          <span class="poem-category">{{ poem.category }}</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载诗词中...</p>
    </div>

    <!-- 空状态 -->
    <div v-if="!poemStore.loading && displayedPoems.length === 0" class="empty-state">
      <h3>暂无诗词</h3>
      <p>没有找到符合条件的诗词，请尝试其他筛选条件</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'

const router = useRouter()
const poemStore = usePoemStore()

// 响应式数据
const selectedCategory = ref('')
const searchKeyword = ref('')

// 计算属性
const displayedPoems = computed(() => {
  return poemStore.filteredPoems
})

// 方法
const handleCategoryChange = () => {
  poemStore.filterByCategory(selectedCategory.value)
}

const handleSearch = () => {
  poemStore.searchPoems(searchKeyword.value)
}

const clearFilters = () => {
  selectedCategory.value = ''
  searchKeyword.value = ''
  poemStore.clearFilters()
}

const goToPoemDetail = (id: string) => {
  router.push(`/poem/${id}`)
}

// 生命周期
onMounted(() => {
  // 确保数据已加载
  if (poemStore.poems.length === 0) {
    poemStore.initializePoems()
  }
})
</script>

<style scoped>
.poem-list-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-family: var(--font-family-serif);
}

.page-subtitle {
  color: var(--secondary-color);
  font-size: 1.1rem;
}

.filter-toolbar {
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.poem-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-left: 4px solid var(--secondary-color);
}

.poem-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.poem-header {
  margin-bottom: 1rem;
}

.poem-title {
  font-size: 1.3rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-family: var(--font-family-serif);
}

.poem-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.poem-content {
  font-family: var(--font-family-serif);
  line-height: 1.8;
  color: var(--dark-color);
  white-space: pre-line;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.poem-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.poem-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  background: var(--light-color);
  color: var(--secondary-color);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
}

.poem-category {
  background: var(--secondary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.empty-state h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .poems-grid {
    grid-template-columns: 1fr;
  }
  
  .poem-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>