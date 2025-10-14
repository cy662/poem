<template>
  <div class="search-view">
    <div class="page-header">
      <h1 class="page-title">搜索诗词</h1>
      <p class="page-subtitle">搜索您喜欢的诗词、作者或内容</p>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form">
      <div class="search-input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="请输入诗词标题、作者名称或诗词内容..."
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button @click="performSearch" class="search-button">
          🔍 搜索
        </button>
      </div>
      
      <div class="search-options">
        <div class="option-group">
          <label for="category-select">分类筛选:</label>
          <select 
            id="category-select"
            v-model="selectedCategory" 
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
        
        <button @click="clearSearch" class="btn btn-outline">
          清除搜索
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasPerformedSearch" class="search-results">
      <div class="results-header">
        <h2 class="results-title">
          搜索结果 
          <span class="results-count">(共 {{ searchResults.length }} 条)</span>
        </h2>
      </div>

      <div v-if="searchResults.length > 0" class="results-grid">
        <div 
          v-for="poem in searchResults" 
          :key="poem.id"
          class="result-card"
          @click="goToPoemDetail(poem.id)"
        >
          <div class="result-header">
            <h3 class="result-title">{{ poem.title }}</h3>
            <div class="result-meta">
              <span class="result-author">{{ poem.author }}</span>
              <span class="result-dynasty">{{ poem.dynasty }}</span>
            </div>
          </div>
          
          <div class="result-content">
            {{ poem.content.split('\n').slice(0, 2).join('\n') }}
          </div>
          
          <div class="result-footer">
            <span class="result-category">{{ poem.category }}</span>
            <div class="result-tags">
              <span 
                v-for="tag in poem.tags.slice(0, 2)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-results">
        <h3>未找到相关结果</h3>
        <p>请尝试其他关键词或筛选条件</p>
      </div>
    </div>

    <!-- 搜索建议 -->
    <div v-else class="search-suggestions">
      <h3 class="suggestions-title">搜索建议</h3>
      <div class="suggestions-grid">
        <div class="suggestion-group">
          <h4>热门诗人</h4>
          <div class="suggestion-tags">
            <button 
              v-for="author in popularAuthors" 
              :key="author"
              @click="searchByAuthor(author)"
              class="suggestion-tag"
            >
              {{ author }}
            </button>
          </div>
        </div>
        
        <div class="suggestion-group">
          <h4>诗词分类</h4>
          <div class="suggestion-tags">
            <button 
              v-for="category in poemStore.categories.slice(0, 5)" 
              :key="category.id"
              @click="searchByCategory(category.name)"
              class="suggestion-tag"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>
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
const searchQuery = ref('')
const selectedCategory = ref('')
const hasPerformedSearch = ref(false)

// 计算属性
const searchResults = computed(() => {
  if (!hasPerformedSearch.value) return []
  
  let results = poemStore.poems
  
  // 关键词搜索
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    results = results.filter(poem =>
      poem.title.toLowerCase().includes(keyword) ||
      poem.author.toLowerCase().includes(keyword) ||
      poem.content.toLowerCase().includes(keyword)
    )
  }
  
  // 分类筛选
  if (selectedCategory.value) {
    results = results.filter(poem => poem.category === selectedCategory.value)
  }
  
  return results
})

const popularAuthors = computed(() => {
  return ['李白', '杜甫', '王维', '孟浩然', '白居易']
})

// 方法
const performSearch = () => {
  hasPerformedSearch.value = true
}

const clearSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  hasPerformedSearch.value = false
}

const searchByAuthor = (author: string) => {
  searchQuery.value = author
  selectedCategory.value = ''
  performSearch()
}

const searchByCategory = (category: string) => {
  searchQuery.value = ''
  selectedCategory.value = category
  performSearch()
}

const goToPoemDetail = (id: string) => {
  router.push(`/poem/${id}`)
}

// 生命周期
onMounted(() => {
  if (poemStore.poems.length === 0) {
    poemStore.initializePoems()
  }
})
</script>

<style scoped>
.search-view {
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

.search-form {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  margin-bottom: 2rem;
}

.search-input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
}

.search-input:focus {
  border-color: var(--secondary-color);
  outline: none;
}

.search-button {
  padding: 1rem 2rem;
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.search-button:hover {
  background: #2980b9;
}

.search-options {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-weight: 500;
  color: var(--primary-color);
}

.results-header {
  margin-bottom: 1.5rem;
}

.results-title {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.results-count {
  color: var(--secondary-color);
  font-weight: normal;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-left: 4px solid var(--secondary-color);
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.result-title {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.result-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.result-content {
  font-family: var(--font-family-serif);
  line-height: 1.8;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-category {
  background: var(--secondary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
}

.result-tags {
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

.no-results {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.search-suggestions {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.suggestions-title {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.suggestion-group h4 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-tag {
  background: var(--light-color);
  color: var(--secondary-color);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.suggestion-tag:hover {
  background: var(--secondary-color);
  color: white;
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }
  
  .search-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>