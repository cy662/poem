
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabaseService, type UserInfo } from '@/services/supabaseService'
import { localAuthService } from '@/services/localAuthService'

// 使用本地认证的标记
const USE_LOCAL_AUTH = true

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<UserInfo | null>(null)
  const isLoading = ref(true)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.displayName || user.value?.email || '')

  // 动作
  const setUser = (userInfo: UserInfo | null) => {
    user.value = userInfo
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const checkAuth = async () => {
    try {
      setLoading(true)
      let userInfo: UserInfo | null = null

      if (USE_LOCAL_AUTH) {
        // 使用本地认证
        const localUser = localAuthService.getCurrentUser()
        if (localUser) {
          userInfo = {
            id: localUser.id,
            email: localUser.email,
            role: localUser.role,
            displayName: localUser.displayName
          }
        }
      } else {
        // 使用Supabase认证
        userInfo = await supabaseService.getCurrentUser()
      }

      setUser(userInfo)
      return userInfo
    } catch (error) {
      console.error('检查认证状态失败:', error)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      if (USE_LOCAL_AUTH) {
        // 使用本地认证
        await localAuthService.signIn(email, password)
      } else {
        // 使用Supabase认证
        await supabaseService.signIn(email, password)
      }

      const userInfo = await checkAuth()
      return userInfo
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, displayName?: string, role: string = 'user') => {
    try {
      setLoading(true)

      if (USE_LOCAL_AUTH) {
        // 使用本地认证
        await localAuthService.signUp(email, password, displayName, role as 'user' | 'admin')
        // 本地认证注册后自动登录
        return true
      } else {
        // 使用Supabase认证
        await supabaseService.signUp(email, password, displayName, role)
        // 注册后需要用户确认邮箱，所以不自动登录
        return true
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (USE_LOCAL_AUTH) {
        // 使用本地认证
        await localAuthService.signOut()
      } else {
        // 使用Supabase认证
        await supabaseService.signOut()
      }
      setUser(null)
    } catch (error) {
      console.error('退出登录失败:', error)
      throw error
    }
  }

  const canEditPoem = async (poemId: string) => {
    if (!isAuthenticated.value) return false
    try {
      return await supabaseService.canEditPoem(poemId)
    } catch (error) {
      console.error('检查编辑权限失败:', error)
      return false
    }
  }

  // 初始化时检查认证状态
  checkAuth()

  return {
    // 状态
    user,
    isLoading,

    // 计算属性
    isAuthenticated,
    isAdmin,
    userName,

    // 动作
    setUser,
    setLoading,
    checkAuth,
    login,
    register,
    logout,
    canEditPoem
  }
})
