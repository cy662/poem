<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除。
          <br>
          让我们一起回到诗词的世界中吧！
        </p>
        
        <div class="not-found-actions">
          <RouterLink to="/" class="btn btn-primary">
            返回首页
          </RouterLink>
          <RouterLink to="/poems" class="btn btn-outline">
            浏览诗词
          </RouterLink>
        </div>
      </div>
      
      <div class="not-found-decoration">
        <div class="poem-quote">
          <p class="quote-content">
            "山重水复疑无路，<br>柳暗花明又一村。"
          </p>
          <p class="quote-author">—— 陆游《游山西村》</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404页面不需要复杂的逻辑
</script>

<style scoped>
.not-found-view {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-container {
  max-width: 800px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.error-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-family: var(--font-family-serif);
}

.error-description {
  color: var(--secondary-color);
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.not-found-decoration {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(155, 89, 182, 0.1) 100%);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  text-align: center;
}

.poem-quote {
  font-family: var(--font-family-serif);
}

.quote-content {
  font-size: 1.3rem;
  line-height: 1.8;
  color: var(--primary-color);
  margin-bottom: 1rem;
  white-space: pre-line;
}

.quote-author {
  color: var(--secondary-color);
  font-size: 0.9rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .not-found-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>