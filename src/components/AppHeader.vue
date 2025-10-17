<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo和标题 -->
        <div class="header-brand">
          <RouterLink to="/home" class="brand-link">
            <h1 class="brand-title">诗词雅集</h1>
            <span class="brand-subtitle">品味中华诗词之美</span>
          </RouterLink>
        </div>

        <!-- 导航菜单 -->
        <nav class="header-nav">
          <RouterLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path" 
            class="nav-link"
            :class="{ active: $route.path === item.path }"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- 搜索框 -->
        <div class="header-search">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索诗词、作者..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="search-btn">
            🔍
          </button>
        </div>

        <!-- 用户认证组件 -->
        <div class="header-auth">
          <UserAuth />
        </div>

        <!-- 移动端菜单按钮 -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :class="{ active: showMobileMenu }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- 移动端菜单 -->
      <Transition name="slide">
        <div v-if="showMobileMenu" class="mobile-menu">
          <RouterLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path" 
            class="mobile-nav-link"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </RouterLink>
          <!-- 移动端用户认证链接 -->
          <div class="mobile-auth-links">
            <UserAuth mobile />
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'
import UserAuth from './UserAuth.vue'

// 路由和状态管理
const router = useRouter()
const poemStore = usePoemStore()

// 响应式数据
const searchKeyword = ref('')
const showMobileMenu = ref(false)

// 导航菜单配置
const navItems = [
  { name: '首页', path: '/home' },
  { name: '诗词', path: '/poems' },
  { name: '作者', path: '/authors' },
  { name: '搜索', path: '/search' },
  { name: '添加诗词', path: '/add-poem' }
]

// 搜索处理
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    poemStore.searchPoems(searchKeyword.value.trim())
    router.push('/search')
  }
}

// 移动端菜单控制
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: var(--shadow-medium);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  gap: 2rem;
}

/* 品牌区域 */
.header-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  color: white;
}

.brand-link:hover {
  color: white;
  text-decoration: none;
}

.brand-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  font-family: var(--font-family-serif);
}

.brand-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  display: block;
  margin-top: 2px;
}

/* 导航菜单 */
.header-nav {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
}

/* 搜索区域 */
.header-search {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  flex-shrink: 0;
}

/* 用户认证区域 */
.header-auth {
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  width: 200px;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  outline: none;
}

.search-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast);
}

.search-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  gap: 4px;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: white;
  transition: all var(--transition-fast);
  border-radius: 2px;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* 移动端菜单 */
.mobile-menu {
  display: none;
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  margin-top: 1rem;
  border-radius: var(--border-radius-md);
}

.mobile-nav-link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

.mobile-nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
}

/* 移动端用户认证链接 */
.mobile-auth-links {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-normal);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .header-search {
    display: none;
  }

  .header-auth {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }

  .search-input {
    width: 150px;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 1.5rem;
  }

  .brand-subtitle {
    font-size: 0.8rem;
  }
}
</style>