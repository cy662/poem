<template>
  <div class="author-list-view">
    <div class="page-header">
      <h1 class="page-title">诗人作者</h1>
      <p class="page-subtitle">了解历代诗词大家的生平与作品</p>
    </div>

    <!-- 作者列表 -->
    <div class="authors-grid" v-if="!poemStore.loading">
      <div 
        v-for="author in poemStore.authors" 
        :key="author.id"
        class="author-card"
      >
        <div class="author-avatar">
          <div class="avatar-placeholder">
            {{ author.name.charAt(0) }}
          </div>
        </div>
        
        <div class="author-info">
          <h3 class="author-name">{{ author.name }}</h3>
          <div class="author-meta">
            <span class="author-dynasty">{{ author.dynasty }}朝</span>
            <span v-if="author.birth && author.death" class="author-years">
              ({{ author.birth }} - {{ author.death }})
            </span>
          </div>
          
          <p v-if="author.description" class="author-description">
            {{ author.description }}
          </p>
          
          <div class="author-stats">
            <span class="poem-count">
              收录作品 {{ getPoemCountByAuthor(author.name) }} 首
            </span>
          </div>
          
          <div class="author-actions">
            <button 
              @click="viewAuthorPoems(author.name)"
              class="btn btn-primary"
            >
              查看作品
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载作者信息中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'

const router = useRouter()
const poemStore = usePoemStore()

const getPoemCountByAuthor = (authorName: string): number => {
  return poemStore.poems.filter(poem => poem.author === authorName).length
}

const viewAuthorPoems = (authorName: string) => {
  poemStore.searchPoems(authorName)
  router.push('/poems')
}

onMounted(() => {
  if (poemStore.poems.length === 0) {
    poemStore.initializePoems()
  }
})
</script>

<style scoped>
.author-list-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
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

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.author-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  display: flex;
  gap: 1.5rem;
  transition: all var(--transition-normal);
}

.author-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.author-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: var(--secondary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-family: var(--font-family-serif);
}

.author-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.author-description {
  line-height: 1.6;
  color: var(--dark-color);
  margin-bottom: 1rem;
}

.author-stats {
  margin-bottom: 1.5rem;
}

.poem-count {
  background: var(--light-color);
  color: var(--secondary-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

@media (max-width: 768px) {
  .authors-grid {
    grid-template-columns: 1fr;
  }
  
  .author-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>