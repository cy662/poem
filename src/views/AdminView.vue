<template>
  <div class="admin-view">
    <div class="page-header">
      <h1 class="page-title">诗词管理</h1>
      <p class="page-subtitle">管理诗词数据和作者信息</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalPoems }}</div>
          <div class="stat-label">诗词总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalAuthors }}</div>
          <div class="stat-label">作者总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalCategories }}</div>
          <div class="stat-label">分类总数</div>
        </div>
      </div>
    </div>

    <!-- 添加新诗词表单 -->
    <div class="add-poem-section">
      <h3 class="section-title">添加新诗词</h3>
      <form @submit.prevent="addNewPoem" class="poem-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="poem-title">诗词标题 *</label>
            <input
              id="poem-title"
              v-model="newPoem.title"
              type="text"
              required
              placeholder="请输入诗词标题"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="poem-author">作者 *</label>
            <input
              id="poem-author"
              v-model="newPoem.author"
              type="text"
              required
              placeholder="请输入作者姓名"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="poem-dynasty">朝代 *</label>
            <select
              id="poem-dynasty"
              v-model="newPoem.dynasty"
              required
              class="form-input"
            >
              <option value="">请选择朝代</option>
              <option value="唐">唐</option>
              <option value="宋">宋</option>
              <option value="元">元</option>
              <option value="明">明</option>
              <option value="清">清</option>
              <option value="现代">现代</option>
            </select>
          </div>

          <div class="form-group">
            <label for="poem-category">分类 *</label>
            <select
              id="poem-category"
              v-model="newPoem.category"
              required
              class="form-input"
            >
              <option value="">请选择分类</option>
              <option 
                v-for="category in poemStore.categories" 
                :key="category.id"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="poem-content">诗词内容 *</label>
          <textarea
            id="poem-content"
            v-model="newPoem.content"
            required
            placeholder="请输入诗词内容，每句一行"
            rows="4"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="poem-translation">译文</label>
          <textarea
            id="poem-translation"
            v-model="newPoem.translation"
            placeholder="请输入诗词译文"
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="poem-annotation">注释</label>
          <textarea
            id="poem-annotation"
            v-model="newPoem.annotation"
            placeholder="请输入诗词注释"
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="poem-tags">标签</label>
          <input
            id="poem-tags"
            v-model="newPoem.tagsInput"
            type="text"
            placeholder="请输入标签，用逗号分隔"
            class="form-input"
          />
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="addingPoem"
          >
            {{ addingPoem ? '添加中...' : '添加诗词' }}
          </button>
          <button 
            type="button" 
            @click="resetForm"
            class="btn btn-outline"
          >
            重置
          </button>
        </div>
      </form>
    </div>

    <!-- 最近添加的诗词 -->
    <div class="recent-poems-section">
      <h3 class="section-title">最近添加的诗词</h3>
      <div class="poems-list" v-if="recentPoems.length > 0">
        <div 
          v-for="poem in recentPoems" 
          :key="poem.id"
          class="poem-item"
        >
          <div class="poem-info">
            <h4 class="poem-title">{{ poem.title }}</h4>
            <div class="poem-meta">
              <span class="poem-author">{{ poem.author }}</span>
              <span class="poem-dynasty">{{ poem.dynasty }}</span>
              <span class="poem-category">{{ poem.category }}</span>
            </div>
          </div>
          <div class="poem-actions">
            <button 
              @click="viewPoem(poem.id)"
              class="btn btn-sm btn-outline"
            >
              查看
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无诗词数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'
import { supabaseService } from '@/services/supabaseService'
import type { Poem } from '@/types/poem'

const router = useRouter()
const poemStore = usePoemStore()

// 响应式数据
const stats = ref({
  totalPoems: 0,
  totalAuthors: 0,
  totalCategories: 0
})

const newPoem = ref({
  title: '',
  author: '',
  dynasty: '',
  category: '',
  content: '',
  translation: '',
  annotation: '',
  tagsInput: ''
})

const addingPoem = ref(false)
const recentPoemsList = ref<Poem[]>([])

// 计算属性
const recentPoems = computed(() => {
  return poemStore.poems.slice(0, 5) // 显示最近5首诗词
})

// 方法
const addNewPoem = async () => {
  if (addingPoem.value) return

  addingPoem.value = true

  try {
    // 处理标签
    const tags = newPoem.value.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const poemData = {
      title: newPoem.value.title,
      author: newPoem.value.author,
      dynasty: newPoem.value.dynasty,
      category: newPoem.value.category,
      content: newPoem.value.content,
      translation: newPoem.value.translation || undefined,
      annotation: newPoem.value.annotation || undefined,
      tags: tags
    }

    // 使用Supabase服务添加诗词
    const addedPoem = await supabaseService.addPoem(poemData)
    
    // 更新本地store
    poemStore.poems.unshift(addedPoem)
    
    // 重置表单
    resetForm()
    
    // 更新统计信息
    await updateStats()
    
    alert('诗词添加成功！')
    
  } catch (error) {
    console.error('添加诗词失败:', error)
    alert('添加诗词失败，请重试')
  } finally {
    addingPoem.value = false
  }
}

const resetForm = () => {
  newPoem.value = {
    title: '',
    author: '',
    dynasty: '',
    category: '',
    content: '',
    translation: '',
    annotation: '',
    tagsInput: ''
  }
}

const viewPoem = (id: string) => {
  router.push(`/poem/${id}`)
}

const updateStats = async () => {
  try {
    const [poemCount, authorCount, categoryCount] = await Promise.all([
      supabaseService.getPoemCount(),
      supabaseService.getAuthorCount(),
      supabaseService.getCategoryCount()
    ])

    stats.value = {
      totalPoems: poemCount,
      totalAuthors: authorCount,
      totalCategories: categoryCount
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 确保数据已加载
  if (poemStore.poems.length === 0) {
    await poemStore.initializePoems()
  }
  
  // 更新统计信息
  await updateStats()
})
</script>

<style scoped>
.admin-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--secondary-color);
}

.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  text-align: center;
  box-shadow: var(--shadow-light);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  color: var(--secondary-color);
  margin-top: 0.5rem;
}

.add-poem-section {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.poem-form {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--primary-color);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.recent-poems-section {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.poems-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poem-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.poem-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-light);
}

.poem-info {
  flex: 1;
}

.poem-title {
  font-size: 1.1rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.poem-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.poem-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .poem-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .poem-actions {
    align-self: flex-end;
  }
}
</style>