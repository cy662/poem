import { supabase, TABLES } from '@/lib/supabase'
import type { Poem, Author, PoemCategory } from '@/types/poem'

/**
 * 用户角色类型
 */
export type UserRole = 'user' | 'admin'

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string
  email?: string
  role: UserRole
  displayName?: string
}

/**
 * Supabase数据服务类
 * 提供诗词、作者、分类等数据的CRUD操作，支持用户认证和权限控制
 */
export class SupabaseService {

  // ========== 用户认证相关方法 ==========

  /**
   * 用户登录 - 提供更清晰的错误处理
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('登录失败:', error)

        // 提供更友好的错误提示
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('邮箱或密码错误，请检查后重试。')
        }

        if (error.message.includes('Email not confirmed')) {
          throw new Error('请直接登录，邮箱验证已禁用。')
        }

        throw new Error(`登录失败: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('登录过程失败:', error)
      throw error
    }
  }

  /**
   * 用户注册 - 直接创建用户并自动登录
   */
  async signUp(email: string, password: string, displayName?: string, role: string = 'user') {
    try {
      console.log('开始注册用户:', email)

      // 方法1: 尝试使用signUp方法，但禁用邮箱确认
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            role: role
          }
        }
      })

      if (error) {
        console.error('注册失败:', error)

        // 如果是用户已存在的错误，尝试直接登录
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          console.log('用户已存在，尝试直接登录...')
          try {
            const loginData = await this.signIn(email, password)
            return loginData
          } catch (loginError) {
            throw new Error('该邮箱已被注册，但密码错误。请使用正确的密码登录。')
          }
        }

        // 如果是邮箱验证相关的错误，说明Supabase配置需要调整
        if (error.message.includes('email confirmation') || error.message.includes('verify')) {
          console.log('邮箱验证被启用，需要配置Supabase...')
          throw new Error('注册功能需要配置。请在Supabase Dashboard中禁用邮箱验证，或联系管理员。')
        }

        throw new Error(`注册失败: ${error.message}`)
      }

      console.log('注册响应:', data)

      // 如果用户创建成功但没有session（需要邮箱验证）
      if (data.user && !data.session) {
        console.log('用户创建成功，但需要邮箱验证...')
        throw new Error('注册成功！请检查您的邮箱完成验证，然后登录。')
      }

      // 如果用户创建成功且有session（邮箱验证已禁用）
      if (data.user && data.session) {
        console.log('用户已自动登录')
        return data
      }

      throw new Error('注册失败：未知错误')
    } catch (error) {
      console.error('注册过程失败:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email || undefined,
      role: (user.user_metadata?.role as UserRole) || 'user',
      displayName: user.user_metadata?.display_name
    }
  }

  /**
   * 检查用户是否有管理员权限
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.role === 'admin'
  }

  /**
   * 检查用户是否可以编辑诗词
   */
  async canEditPoem(poemId: string): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    // 管理员可以编辑所有诗词
    if (user.role === 'admin') return true

    // 普通用户只能编辑自己创建的诗词
    const { data } = await supabase
      .from(TABLES.POEMS)
      .select('created_by')
      .eq('id', poemId)
      .single()

    return data?.created_by === user.id
  }

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
   * 添加新诗词（需要用户登录）
   */
  async addPoem(poemData: Omit<Poem, 'id' | 'createdAt'>): Promise<Poem> {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('需要登录后才能添加诗词')
      }

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

  /**
   * 更新诗词（只能更新自己创建的诗词或管理员权限）
   */
  async updatePoem(poemId: string, poemData: Partial<Poem>): Promise<Poem> {
    try {
      const canEdit = await this.canEditPoem(poemId)
      if (!canEdit) {
        throw new Error('没有权限编辑此诗词')
      }

      const { data, error } = await supabase
        .from(TABLES.POEMS)
        .update({
          title: poemData.title,
          author: poemData.author,
          dynasty: poemData.dynasty,
          category: poemData.category,
          content: poemData.content,
          translation: poemData.translation,
          annotation: poemData.annotation,
          tags: poemData.tags
        })
        .eq('id', poemId)
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
      console.error('更新诗词失败:', error)
      throw error
    }
  }

  /**
   * 删除诗词（只能删除自己创建的诗词或管理员权限）
   */
  async deletePoem(poemId: string): Promise<void> {
    try {
      const canEdit = await this.canEditPoem(poemId)
      if (!canEdit) {
        throw new Error('没有权限删除此诗词')
      }

      const { error } = await supabase
        .from(TABLES.POEMS)
        .delete()
        .eq('id', poemId)

      if (error) throw error
    } catch (error) {
      console.error('删除诗词失败:', error)
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