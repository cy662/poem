// 诗词相关的TypeScript类型定义

/**
 * 诗词接口
 */
export interface Poem {
  id: string
  title: string
  author: string
  dynasty: string
  category: string
  content: string
  translation?: string
  annotation?: string
  tags: string[]
  createdAt: string
}

/**
 * 作者接口
 */
export interface Author {
  id: string
  name: string
  dynasty: string
  birth?: string
  death?: string
  description?: string
  avatar?: string
}

/**
 * 诗词分类接口
 */
export interface PoemCategory {
  id: string
  name: string
  description?: string
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  keyword?: string
  category?: string
  author?: string
  dynasty?: string
}

/**
 * 路由元信息接口
 */
export interface RouteMeta {
  title?: string
  description?: string
  requiresAuth?: boolean
}