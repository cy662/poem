import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 1. 定义路由元信息的 TypeScript 接口（增强类型约束）
interface RouteMeta {
  title: string;        // 页面标题（必选）
  description: string;  // 页面描述（必选）
  requiresAuth?: boolean; // 是否需要认证
  requiresAdmin?: boolean; // 是否需要管理员权限
}

// 2. 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首页 - 诗词雅集',
      description: '探索中华诗词的魅力',
      requiresAuth: true
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
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: {
      title: '管理 - 诗词雅集',
      description: '管理诗词数据和作者信息',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/add-poem',
    name: 'AddPoem',
    component: () => import('@/views/AddPoemView.vue'),
    meta: {
      title: '添加诗词 - 诗词雅集',
      description: '添加新的诗词作品',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登录 - 诗词雅集',
      description: '登录诗词雅集账户'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      title: '注册 - 诗词雅集',
      description: '注册诗词雅集账户'
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

// 3. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为：优先恢复保存的位置，否则滚动到顶部
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 4. 全局前置守卫（用 _ 代替未使用的 from 参数，解决 TS6133 错误）
router.beforeEach(async (to, _, next) => {
  // 设置页面标题
  if (to.meta && typeof to.meta.title === 'string') {
    document.title = to.meta.title
  } else {
    document.title = '诗词雅集'
  }

  // 设置页面描述（处理 meta 标签可能不存在的情况）
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription && to.meta && typeof to.meta.description === 'string') {
    metaDescription.setAttribute('content', to.meta.description)
  }

  // 检查是否需要认证
  const requiresAuth = to.meta?.requiresAuth
  const requiresAdmin = to.meta?.requiresAdmin

  if (requiresAuth || requiresAdmin) {
    // 导入认证store（动态导入避免循环依赖）
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()

    // 如果store还未初始化，先检查认证状态
    if (!authStore.user && authStore.isLoading) {
      await authStore.checkAuth()
    }

    // 检查认证状态
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查管理员权限
    if (requiresAdmin && !authStore.isAdmin) {
      // 非管理员，跳转到首页
      next('/')
      return
    }
  }

  next() // 必须调用 next() 放行路由
})

// 5. 全局后置钩子（用 _ 代替未使用的 from 参数，解决 TS6133 错误）
router.afterEach((to, _) => {
  // 开发环境下打印导航日志（依赖 import.meta.env.DEV，需配合 src/env.d.ts 类型声明）
  if (import.meta.env.DEV) {
    console.log(`🚀 导航完成：当前路径 -> ${to.path}`)
  }
})

export default router