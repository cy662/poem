import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Poem, Author, PoemCategory } from '@/types/poem'
import { supabaseService } from '@/services/supabaseService'

export const usePoemStore = defineStore('poem', () => {
  // 状态定义
  const poems = ref<Poem[]>([])
  const authors = ref<Author[]>([])
  const categories = ref<PoemCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchKeyword = ref('')
  const selectedCategory = ref<string>('')

  // 计算属性
  const filteredPoems = computed(() => {
    let filtered = poems.value

    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(poem =>
        poem.title.toLowerCase().includes(keyword) ||
        poem.author.toLowerCase().includes(keyword) ||
        poem.content.toLowerCase().includes(keyword)
      )
    }

    // 按分类筛选
    if (selectedCategory.value) {
      filtered = filtered.filter(poem => poem.category === selectedCategory.value)
    }

    return filtered
  })

  const poemCount = computed(() => poems.value.length)
  const authorCount = computed(() => authors.value.length)

  // 获取指定作者的诗词
  const getPoemsByAuthor = computed(() => (authorName: string) => {
    return poems.value.filter(poem => poem.author === authorName)
  })

  // Actions
  const initializePoems = async () => {
    loading.value = true
    error.value = null

    try {
      // 使用Supabase服务加载数据
      const [poemsData, authorsData, categoriesData] = await Promise.all([
        supabaseService.getAllPoems(),
        supabaseService.getAllAuthors(),
        supabaseService.getAllCategories()
      ])

      poems.value = poemsData
      authors.value = authorsData
      categories.value = categoriesData

    } catch (err) {
      error.value = '加载诗词数据失败'
      console.error('初始化诗词数据错误:', err)
    } finally {
      loading.value = false
    }
  }

  // 根据ID获取诗词
  const getPoemById = (id: string): Poem | undefined => {
    return poems.value.find(poem => poem.id === id)
  }

  // 根据ID获取作者
  const getAuthorById = (id: string): Author | undefined => {
    return authors.value.find(author => author.id === id)
  }

  // 搜索诗词
  const searchPoems = (keyword: string) => {
    searchKeyword.value = keyword
  }

  // 按分类筛选
  const filterByCategory = (category: string) => {
    selectedCategory.value = category
  }

  // 清除筛选条件
  const clearFilters = () => {
    searchKeyword.value = ''
    selectedCategory.value = ''
  }

  // 添加新诗词
  const addPoem = async (poem: Omit<Poem, 'id' | 'createdAt'>) => {
    loading.value = true
    error.value = null

    try {
      // 调用Supabase服务添加诗词到数据库
      const newPoem = await supabaseService.addPoem({
        ...poem,
        category: poem.category || '未分类' // 确保有默认分类
      })

      // 更新本地状态
      poems.value.unshift(newPoem)

      return newPoem
    } catch (err) {
      error.value = '添加诗词失败'
      console.error('添加诗词错误:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    poems,
    authors,
    categories,
    loading,
    error,
    searchKeyword,
    selectedCategory,

    // 计算属性
    filteredPoems,
    poemCount,
    authorCount,
    getPoemsByAuthor,

    // 方法
    initializePoems,
    getPoemById,
    getAuthorById,
    searchPoems,
    filterByCategory,
    clearFilters,
    addPoem
  }
})