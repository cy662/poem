// 本地认证服务 - 用于开发环境测试
// 当Supabase邮箱验证导致问题时，使用本地存储模拟认证

import { ref, computed } from 'vue'

interface LocalUser {
  id: string
  email: string
  password: string
  displayName: string
  role: 'user' | 'admin'
  createdAt: string
}

class LocalAuthService {
  private users = ref<LocalUser[]>([])
  private currentUser = ref<LocalUser | null>(null)
  private isAuthenticated = ref(false)

  constructor() {
    this.loadUsers()
    this.checkAuth()
  }

  private loadUsers() {
    const stored = localStorage.getItem('local_users')
    if (stored) {
      this.users.value = JSON.parse(stored)
    }
  }

  private saveUsers() {
    localStorage.setItem('local_users', JSON.stringify(this.users.value))
  }

  private checkAuth() {
    const stored = localStorage.getItem('current_user')
    if (stored) {
      this.currentUser.value = JSON.parse(stored)
      this.isAuthenticated.value = true
    }
  }

  async signUp(email: string, password: string, displayName?: string, role: 'user' | 'admin' = 'user') {
    // 检查用户是否已存在
    const existingUser = this.users.value.find(u => u.email === email)
    if (existingUser) {
      throw new Error('该邮箱已被注册')
    }

    // 创建新用户
    const newUser: LocalUser = {
      id: this.generateId(),
      email,
      password, // 注意：实际应用中应该加密密码
      displayName: displayName || email.split('@')[0],
      role,
      createdAt: new Date().toISOString()
    }

    this.users.value.push(newUser)
    this.saveUsers()

    // 自动登录
    return this.signIn(email, password)
  }

  async signIn(email: string, password: string) {
    const user = this.users.value.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('邮箱或密码错误')
    }

    this.currentUser.value = user
    this.isAuthenticated.value = true
    localStorage.setItem('current_user', JSON.stringify(user))

    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          display_name: user.displayName,
          role: user.role
        }
      },
      session: {
        access_token: this.generateToken(),
        refresh_token: this.generateToken()
      }
    }
  }

  async signOut() {
    this.currentUser.value = null
    this.isAuthenticated.value = false
    localStorage.removeItem('current_user')
  }

  getCurrentUser() {
    if (!this.currentUser.value) return null

    return {
      id: this.currentUser.value.id,
      email: this.currentUser.value.email,
      role: this.currentUser.value.role as 'user' | 'admin',
      displayName: this.currentUser.value.displayName
    }
  }

  isAuth() {
    return this.isAuthenticated.value
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
  }
}

// 创建单例实例
export const localAuthService = new LocalAuthService()

// 预创建测试用户
export function initializeTestUsers() {
  const testUsers: LocalUser[] = [
    {
      id: 'test-user-001',
      email: 'test@example.com',
      password: '123456',
      displayName: '测试用户',
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 'test-admin-001',
      email: 'admin@example.com',
      password: '123456',
      displayName: '测试管理员',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ]

  // 检查是否已存在测试用户
  const stored = localStorage.getItem('local_users')
  if (!stored) {
    localStorage.setItem('local_users', JSON.stringify(testUsers))
    console.log('测试用户已初始化')
  }
}

// 在应用启动时初始化测试用户
initializeTestUsers()