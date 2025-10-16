import { supabase, TABLES } from '@/lib/supabase'
import type { Poem, Author, PoemCategory } from '@/types/poem'

/**
 * Supabase数据服务类
 * 提供诗词、作者、分类等数据的CRUD操作
 */
export class SupabaseService {

  // ========== 诗词相关操作 ==========

  /**
   * 获取所有诗词
   */
  async getAllPoems(): Promise<Poem[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // 调试：查看实际的数据格式
      if (data && data.length > 0) {
        console.log('诗词内容示例:', data[0].content)
        console.log('包含换行符:', data[0].content.includes('\\n'))
      }

      return data?.map(poem => ({
        id: poem.id.toString(),
        title: poem.title,
        author: poem.author,
        dynasty: poem.dynasty,
        category: poem.category,
        content: poem.content,
        translation: poem.translation,
        annotation: poem.annotation,
        tags: poem.tags || [],
        createdAt: poem.created_at
      })) || []
    } catch (error) {
      console.error('获取诗词列表失败:', error)
      throw error
    }
  }

  /**
   * 根据ID获取诗词详情
   */
  async getPoemById(id: string): Promise<Poem | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id.toString(),
        title: data.title,
        author: data.author,
        dynasty: data.dynasty,
        category: data.category,
        content: data.content,
        translation: data.translation,
        annotation: data.annotation,
        tags: data.tags || [],
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('获取诗词详情失败:', error)
      throw error
    }
  }

  /**
   * 搜索诗词
   */
  async searchPoems(keyword: string): Promise<Poem[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .select('*')
        .or(`title.ilike.%${keyword}%,author.ilike.%${keyword}%,content.ilike.%${keyword}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(poem => ({
        id: poem.id.toString(),
        title: poem.title,
        author: poem.author,
        dynasty: poem.dynasty,
        category: poem.category,
        content: poem.content,
        translation: poem.translation,
        annotation: poem.annotation,
        tags: poem.tags || [],
        createdAt: poem.created_at
      })) || []
    } catch (error) {
      console.error('搜索诗词失败:', error)
      throw error
    }
  }

  /**
   * 根据作者获取诗词
   */
  async getPoemsByAuthor(authorName: string): Promise<Poem[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .select('*')
        .eq('author', authorName)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(poem => ({
        id: poem.id.toString(),
        title: poem.title,
        author: poem.author,
        dynasty: poem.dynasty,
        category: poem.category,
        content: poem.content,
        translation: poem.translation,
        annotation: poem.annotation,
        tags: poem.tags || [],
        createdAt: poem.created_at
      })) || []
    } catch (error) {
      console.error('获取作者诗词失败:', error)
      throw error
    }
  }

  /**
   * 根据分类获取诗词
   */
  async getPoemsByCategory(category: string): Promise<Poem[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(poem => ({
        id: poem.id.toString(),
        title: poem.title,
        author: poem.author,
        dynasty: poem.dynasty,
        category: poem.category,
        content: poem.content,
        translation: poem.translation,
        annotation: poem.annotation,
        tags: poem.tags || [],
        createdAt: poem.created_at
      })) || []
    } catch (error) {
      console.error('获取分类诗词失败:', error)
      throw error
    }
  }

  /**
   * 添加新诗词
   */
  async addPoem(poemData: Omit<Poem, 'id' | 'createdAt'>): Promise<Poem> {
    try {
      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .insert([{
          title: poemData.title,
          author: poemData.author,
          dynasty: poemData.dynasty,
          category: poemData.category,
          content: poemData.content,
          translation: poemData.translation,
          annotation: poemData.annotation,
          tags: poemData.tags,
          created_at: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id.toString(),
        title: data.title,
        author: data.author,
        dynasty: data.dynasty,
        category: data.category,
        content: data.content,
        translation: data.translation,
        annotation: data.annotation,
        tags: data.tags || [],
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('添加诗词失败:', error)
      throw error
    }
  }

  // ========== 作者相关操作 ==========

  /**
   * 获取所有作者
   */
  async getAllAuthors(): Promise<Author[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUTHORS)
        .select('*')
        .order('name')

      if (error) throw error

      return data?.map(author => ({
        id: author.id.toString(),
        name: author.name,
        dynasty: author.dynasty,
        birth: author.birth,
        death: author.death,
        description: author.description,
        avatar: author.avatar
      })) || []
    } catch (error) {
      console.error('获取作者列表失败:', error)
      throw error
    }
  }

  /**
   * 根据ID获取作者详情
   */
  async getAuthorById(id: string): Promise<Author | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUTHORS)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id.toString(),
        name: data.name,
        dynasty: data.dynasty,
        birth: data.birth,
        death: data.death,
        description: data.description,
        avatar: data.avatar
      }
    } catch (error) {
      console.error('获取作者详情失败:', error)
      throw error
    }
  }

  /**
   * 根据朝代获取作者
   */
  async getAuthorsByDynasty(dynasty: string): Promise<Author[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUTHORS)
        .select('*')
        .eq('dynasty', dynasty)
        .order('name')

      if (error) throw error

      return data?.map(author => ({
        id: author.id.toString(),
        name: author.name,
        dynasty: author.dynasty,
        birth: author.birth,
        death: author.death,
        description: author.description,
        avatar: author.avatar
      })) || []
    } catch (error) {
      console.error('获取朝代作者失败:', error)
      throw error
    }
  }

  // ========== 分类相关操作 ==========

  /**
   * 获取所有分类
   */
  async getAllCategories(): Promise<PoemCategory[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .order('name')

      if (error) throw error

      return data?.map(category => ({
        id: category.id.toString(),
        name: category.name,
        description: category.description
      })) || []
    } catch (error) {
      console.error('获取分类列表失败:', error)
      throw error
    }
  }

  // ========== 统计相关操作 ==========

  /**
   * 获取诗词总数
   */
  async getPoemCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(TABLES.POEMS)
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('获取诗词总数失败:', error)
      throw error
    }
  }

  /**
   * 获取作者总数
   */
  async getAuthorCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(TABLES.AUTHORS)
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('获取作者总数失败:', error)
      throw error
    }
  }

  /**
   * 获取分类总数
   */
  async getCategoryCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('获取分类总数失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const supabaseService = new SupabaseService()