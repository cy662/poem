import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首页 - 诗词雅集',
      description: '探索中华诗词的魅力'
    }
  },
  {
    path: '/poems',
    name: 'PoemList',
    component: () => import('@/views/PoemListView.vue'),
    meta: {
      title: '诗词列表 - 诗词雅集',
      description: '浏览所有诗词作品'
    }
  },
  {
    path: '/poem/:id',
    name: 'PoemDetail',
    component: () => import('@/views/PoemDetailView.vue'),
    meta: {
      title: '诗词详情 - 诗词雅集',
      description: '查看诗词详细内容'
    }
  },
  {
    path: '/authors',
    name: 'AuthorList',
    component: () => import('@/views/AuthorListView.vue'),
    meta: {
      title: '作者列表 - 诗词雅集',
      description: '了解历代诗词作者'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
    meta: {
      title: '搜索 - 诗词雅集',
      description: '搜索诗词和作者'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面未找到 - 诗词雅集',
      description: '您访问的页面不存在'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  
  // 设置页面描述
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }
  
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面访问统计（开发环境下的调试信息）
  if (import.meta.env.DEV) {
    console.log(`🚀 导航到: ${to.path}`)
  }
})

export default router