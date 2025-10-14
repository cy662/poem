<template>
  <div class="poem-detail-view">
    <div v-if="poem" class="poem-detail">
      <!-- 返回按钮 -->
      <div class="navigation">
        <button @click="goBack" class="btn btn-outline">
          ← 返回列表
        </button>
      </div>

      <!-- 诗词主要信息 -->
      <div class="poem-main">
        <div class="poem-header">
          <h1 class="poem-title">{{ poem.title }}</h1>
          <div class="poem-meta">
            <span class="poem-author">作者：{{ poem.author }}</span>
            <span class="poem-dynasty">朝代：{{ poem.dynasty }}</span>
            <span class="poem-category">分类：{{ poem.category }}</span>
          </div>
        </div>

        <div class="poem-content-section">
          <div class="poem-content">
            {{ poem.content }}
          </div>
        </div>

        <!-- 译文和注释 -->
        <div v-if="poem.translation" class="poem-translation">
          <h3 class="section-title">译文</h3>
          <p class="translation-text">{{ poem.translation }}</p>
        </div>

        <div v-if="poem.annotation" class="poem-annotation">
          <h3 class="section-title">注释</h3>
          <p class="annotation-text">{{ poem.annotation }}</p>
        </div>

        <!-- 标签 -->
        <div v-if="poem.tags.length > 0" class="poem-tags-section">
          <h3 class="section-title">标签</h3>
          <div class="poem-tags">
            <span 
              v-for="tag in poem.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 作者其他作品 -->
      <div v-if="otherPoemsByAuthor.length > 0" class="related-poems">
        <h3 class="section-title">{{ poem.author }}的其他作品</h3>
        <div class="related-poems-grid">
          <div 
            v-for="relatedPoem in otherPoemsByAuthor" 
            :key="relatedPoem.id"
            class="related-poem-card"
            @click="goToPoemDetail(relatedPoem.id)"
          >
            <h4 class="related-poem-title">{{ relatedPoem.title }}</h4>
            <p class="related-poem-preview">
              {{ relatedPoem.content.split('\n')[0] }}...
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载诗词详情中...</p>
    </div>

    <!-- 未找到状态 -->
    <div v-else class="not-found">
      <h2>诗词未找到</h2>
      <p>抱歉，您查找的诗词不存在或已被删除。</p>
      <button @click="goBack" class="btn btn-primary">
        返回列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'
import type { Poem } from '@/types/poem'

const route = useRoute()
const router = useRouter()
const poemStore = usePoemStore()

// 响应式数据
const poem = ref<Poem | null>(null)
const loading = ref(true)

// 计算属性
const otherPoemsByAuthor = computed(() => {
  if (!poem.value) return []
  return poemStore.poems
    .filter(p => p.author === poem.value!.author && p.id !== poem.value!.id)
    .slice(0, 4)
})

// 方法
const loadPoem = async () => {
  loading.value = true
  const poemId = route.params.id as string
  
  // 确保诗词数据已加载
  if (poemStore.poems.length === 0) {
    await poemStore.initializePoems()
  }
  
  poem.value = poemStore.getPoemById(poemId) || null
  loading.value = false
}

const goBack = () => {
  router.back()
}

const goToPoemDetail = (id: string) => {
  router.push(`/poem/${id}`)
}

// 生命周期和监听
onMounted(() => {
  loadPoem()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadPoem()
  }
})
</script>

<style scoped>
.poem-detail-view {
  max-width: 800px;
  margin: 0 auto;
}

.navigation {
  margin-bottom: 2rem;
}

.poem-main {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  margin-bottom: 2rem;
}

.poem-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.poem-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-family: var(--font-family-serif);
}

.poem-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1rem;
  color: var(--secondary-color);
}

.poem-content-section {
  margin: 2rem 0;
}

.poem-content {
  font-family: var(--font-family-serif);
  font-size: 1.5rem;
  line-height: 2.2;
  color: var(--primary-color);
  text-align: center;
  white-space: pre-line;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--border-radius-lg);
  border-left: 4px solid var(--secondary-color);
}

.section-title {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.poem-translation {
  margin: 2rem 0;
}

.translation-text {
  line-height: 1.8;
  color: var(--dark-color);
  padding: 1rem;
  background: #f8f9fa;
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--info-color);
}

.poem-annotation {
  margin: 2rem 0;
}

.annotation-text {
  line-height: 1.8;
  color: var(--dark-color);
  padding: 1rem;
  background: #fff3cd;
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--warning-color);
}

.poem-tags-section {
  margin: 2rem 0;
}

.poem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--secondary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
}

.related-poems {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.related-poems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.related-poem-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.related-poem-card:hover {
  border-color: var(--secondary-color);
  box-shadow: var(--shadow-light);
}

.related-poem-title {
  font-size: 1rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.related-poem-preview {
  font-size: 0.9rem;
  color: var(--secondary-color);
  line-height: 1.6;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.not-found {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
}

.not-found h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.not-found p {
  color: var(--secondary-color);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .poem-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .poem-title {
    font-size: 2rem;
  }
  
  .poem-content {
    font-size: 1.2rem;
    padding: 1rem;
  }
  
  .related-poems-grid {
    grid-template-columns: 1fr;
  }
}
</style>