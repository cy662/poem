import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少Supabase配置，请检查环境变量')
}

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 导出表名常量
export const TABLES = {
  POEMS: 'poems',
  AUTHORS: 'authors',
  CATEGORIES: 'categories',
  TAGS: 'tags'
} as const

export default supabase