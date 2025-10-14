<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <!-- 左侧信息 -->
        <div class="footer-info">
          <h3 class="footer-title">诗词雅集</h3>
          <p class="footer-description">
            传承中华诗词文化，品味千年文学之美
          </p>
          <div class="footer-stats">
            <span class="stat-item">
              收录诗词 {{ poemStore.poemCount }} 首
            </span>
            <span class="stat-item">
              诗人作者 {{ poemStore.authorCount }} 位
            </span>
          </div>
        </div>

        <!-- 中间链接 -->
        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">快速导航</h4>
            <RouterLink to="/" class="footer-link">首页</RouterLink>
            <RouterLink to="/poems" class="footer-link">诗词列表</RouterLink>
            <RouterLink to="/authors" class="footer-link">作者列表</RouterLink>
            <RouterLink to="/search" class="footer-link">搜索</RouterLink>
          </div>
          
          <div class="link-group">
            <h4 class="link-title">诗词分类</h4>
            <a href="#" class="footer-link">思乡诗</a>
            <a href="#" class="footer-link">山水诗</a>
            <a href="#" class="footer-link">励志诗</a>
            <a href="#" class="footer-link">爱情诗</a>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="footer-contact">
          <h4 class="link-title">关于项目</h4>
          <p class="contact-text">
            基于 Vue 3 开发的现代化诗词应用
          </p>
          <div class="tech-stack">
            <span class="tech-item">Vue 3</span>
            <span class="tech-item">TypeScript</span>
            <span class="tech-item">Pinia</span>
            <span class="tech-item">Vue Router</span>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ currentYear }} 诗词雅集. 基于 Vue.js 构建</p>
          <p class="build-info">
            构建时间: {{ buildTime }}
          </p>
        </div>
        
        <div class="footer-actions">
          <button @click="scrollToTop" class="scroll-top-btn" title="回到顶部">
            ↑
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePoemStore } from '@/stores/poem'

// 使用状态管理
const poemStore = usePoemStore()

// 计算属性
const currentYear = computed(() => new Date().getFullYear())
const buildTime = computed(() => new Date().toLocaleString('zh-CN'))

// 回到顶部功能
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr;
  gap: 3rem;
  padding: 3rem 0 2rem;
}

/* 左侧信息区域 */
.footer-info {
  max-width: 300px;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ecf0f1;
  font-family: var(--font-family-serif);
}

.footer-description {
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.footer-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  color: #ecf0f1;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}

/* 中间链接区域 */
.footer-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.link-group {
  display: flex;
  flex-direction: column;
}

.link-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #ecf0f1;
}

.footer-link {
  color: #bdc3c7;
  text-decoration: none;
  padding: 0.25rem 0;
  transition: color var(--transition-fast);
  font-size: 0.9rem;
}

.footer-link:hover {
  color: #3498db;
  text-decoration: none;
}

/* 右侧联系信息 */
.footer-contact {
  max-width: 250px;
}

.contact-text {
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-item {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

/* 底部版权区域 */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 2rem;
}

.copyright p {
  color: #95a5a6;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.build-info {
  opacity: 0.7;
}

.footer-actions {
  display: flex;
  align-items: center;
}

.scroll-top-btn {
  background: rgba(52, 152, 219, 0.2);
  border: 1px solid rgba(52, 152, 219, 0.3);
  color: #3498db;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-top-btn:hover {
  background: rgba(52, 152, 219, 0.3);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .footer-links {
    grid-template-columns: 1fr 1fr;
    justify-items: center;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-info,
  .footer-contact {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .tech-stack {
    justify-content: center;
  }
}
</style>