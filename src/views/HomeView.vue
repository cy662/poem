<template>
  <div class="home-view">
    <!-- 欢迎横幅 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">诗词雅集</h1>
        <p class="hero-subtitle">千年文化，一诗一词皆风雅</p>
        <div class="hero-actions">
          <RouterLink to="/poems" class="btn btn-primary">
            开始阅读
          </RouterLink>
          <RouterLink to="/search" class="btn btn-outline">
            搜索诗词
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 统计信息 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ poemStore.poemCount }}</div>
          <div class="stat-label">诗词作品</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ poemStore.authorCount }}</div>
          <div class="stat-label">诗人作者</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">5</div>
          <div class="stat-label">诗词分类</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">10</div>
          <div class="stat-label">历史朝代</div>
        </div>
      </div>
    </section>

    <!-- 精选诗词 -->
    <section class="featured-section">
      <div class="section-header">
        <h2 class="section-title">精选诗词</h2>
        <p class="section-subtitle">品味经典，感受诗词之美</p>
      </div>
      
      <div class="featured-poems" v-if="!poemStore.loading">
        <div 
          v-for="poem in featuredPoems" 
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
        </div>
      </div>

      <div v-else class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'

const router = useRouter()
const poemStore = usePoemStore()

// 计算属性
const featuredPoems = computed(() => poemStore.poems.slice(0, 6))

// 方法
const goToPoemDetail = (id: string) => {
  router.push(`/poem/${id}`)
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border-radius: var(--border-radius-lg);
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-family: var(--font-family-serif);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
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

.featured-section {
  margin-bottom: 3rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: var(--secondary-color);
}

.featured-poems {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.poem-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.poem-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.poem-title {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.poem-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.poem-content {
  font-family: var(--font-family-serif);
  line-height: 1.8;
  color: var(--dark-color);
  white-space: pre-line;
}

.loading-container {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>