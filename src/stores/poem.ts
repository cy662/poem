import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Poem, Author, PoemCategory } from '@/types/poem'

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
      // 模拟异步数据加载
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 初始化示例诗词数据
      poems.value = [
        {
          id: '1',
          title: '静夜思',
          author: '李白',
          dynasty: '唐',
          category: '思乡',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
          translation: '明亮的月光洒在床前的窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
          annotation: '这是一首写远客思乡之情的诗，诗以明白如话的语言雕琢出明静醇美的意境。',
          tags: ['思乡', '月亮', '经典'],
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          title: '春晓',
          author: '孟浩然',
          dynasty: '唐',
          category: '写景',
          content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
          translation: '春日里贪睡不知不觉天已破晓，搅乱我酣眠的是那啁啾的小鸟。昨天夜里风声雨声一直不断，那娇美的春花不知被吹落了多少？',
          annotation: '这首诗写的是春日早晨的景色和诗人的感受。',
          tags: ['春天', '写景', '经典'],
          createdAt: '2024-01-02'
        },
        {
          id: '3',
          title: '登鹳雀楼',
          author: '王之涣',
          dynasty: '唐',
          category: '励志',
          content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
          translation: '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。若想把千里的风光景物看够，那就要登上更高的一层城楼。',
          annotation: '这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负，反映了盛唐时期人们积极向上的进取精神。',
          tags: ['励志', '登高', '经典'],
          createdAt: '2024-01-03'
        }
      ]

      // 初始化作者数据
      authors.value = [
        {
          id: '1',
          name: '李白',
          dynasty: '唐',
          birth: '701',
          death: '762',
          description: '唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。',
          avatar: '/images/authors/libai.jpg'
        },
        {
          id: '2',
          name: '孟浩然',
          dynasty: '唐',
          birth: '689',
          death: '740',
          description: '唐代著名的山水田园派诗人。',
          avatar: '/images/authors/menghaoran.jpg'
        },
        {
          id: '3',
          name: '王之涣',
          dynasty: '唐',
          birth: '688',
          death: '742',
          description: '唐代著名诗人，以《登鹳雀楼》闻名。',
          avatar: '/images/authors/wangzhihuan.jpg'
        }
      ]

      // 初始化分类数据
      categories.value = [
        { id: '1', name: '思乡', description: '表达思念家乡之情的诗词' },
        { id: '2', name: '写景', description: '描写自然景色的诗词' },
        { id: '3', name: '励志', description: '激励人心的诗词' },
        { id: '4', name: '爱情', description: '表达爱情的诗词' },
        { id: '5', name: '友情', description: '歌颂友谊的诗词' }
      ]

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

  // 添加新诗词（预留功能）
  const addPoem = (poem: Omit<Poem, 'id' | 'createdAt'>) => {
    const newPoem: Poem = {
      ...poem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    poems.value.push(newPoem)
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