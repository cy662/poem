<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  mobile?: boolean
}>()

const router = useRouter()
const authStore = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement>()

// 使用storeToRefs保持响应性
const { user, isLoading } = storeToRefs(authStore)

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  // 延迟添加事件监听器，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 100)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 阻止下拉菜单区域的事件冒泡
const stopPropagation = (event: Event) => {
  event.stopPropagation()
}

const handleLogin = () => {
  router.push('/login')
}

const handleRegister = () => {
  router.push('/register')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    showDropdown.value = false
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const goToProfile = () => {
  showDropdown.value = false
  // 可以添加个人资料页面
  router.push('/')
}

const goToAdmin = () => {
  showDropdown.value = false
  router.push('/admin')
}
</script>

<template>
  <div :class="['user-auth', { 'mobile': mobile }]">
    <div v-if="isLoading" class="loading">加载中...</div>
    
    <div v-else-if="user" class="user-info">
      <div v-if="!mobile" class="user-dropdown" @click="toggleDropdown">
        <span class="user-name">{{ user.displayName || user.email }}</span>
        <span class="dropdown-arrow">▼</span>
        
        <div v-if="showDropdown" class="dropdown-menu" ref="dropdownRef" @click="stopPropagation">
          <div class="dropdown-item user-role">
            <span class="role-badge" :class="user.role">{{ user.role === 'admin' ? '管理员' : '用户' }}</span>
            <span class="user-email">{{ user.email }}</span>
          </div>
          <div class="dropdown-item" @click="goToProfile">
            <span>个人资料</span>
          </div>
          <div v-if="user.role === 'admin'" class="dropdown-item" @click="goToAdmin">
            <span>管理后台</span>
          </div>
          <div class="dropdown-item" @click="handleLogout">
            <span>退出登录</span>
          </div>
        </div>
      </div>
      
      <!-- 移动端用户信息显示 -->
      <div v-else class="mobile-user-info">
        <div class="mobile-user-name">{{ user.displayName || user.email }}</div>
        <div class="mobile-auth-actions">
          <button @click="goToProfile" class="mobile-auth-btn">个人资料</button>
          <button @click="handleLogout" class="mobile-auth-btn logout">退出登录</button>
        </div>
      </div>
    </div>
    
    <div v-else class="auth-buttons">
      <button @click="handleLogin" :class="['auth-btn', 'login-btn', { 'mobile-auth-btn': mobile }]">登录</button>
      <button @click="handleRegister" :class="['auth-btn', 'register-btn', { 'mobile-auth-btn': mobile }]">注册</button>
    </div>
  </div>
</template>

<style scoped>
.user-auth {
  position: relative;
}

.loading {
  color: #666;
  font-size: 14px;
}

.user-info {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.dropdown-arrow {
  font-size: 12px;
  color: #666;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 1000;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

/* 用户角色样式 */
.dropdown-item.user-role {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  cursor: default;
}

.dropdown-item.user-role:hover {
  background-color: transparent;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background-color: #e74c3c;
  color: white;
}

.role-badge.user {
  background-color: #3498db;
  color: white;
}

.user-email {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.auth-btn {
  padding: 8px 16px;
  border: 2px solid;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn {
  background: transparent;
  border-color: #667eea;
  color: #667eea;
}

.login-btn:hover {
  background: #667eea;
  color: white;
}

.register-btn {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.register-btn:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
}

/* 移动端样式 */
.user-auth.mobile {
  width: 100%;
}

.mobile-user-info {
  width: 100%;
}

.mobile-user-name {
  padding: 12px 16px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-auth-actions {
  padding: 8px 0;
}

.mobile-auth-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #333;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.mobile-auth-btn:hover {
  background-color: #f5f5f5;
}

.mobile-auth-btn.logout {
  color: #e74c3c;
}

.mobile-auth-btn.logout:hover {
  background-color: #ffeaea;
}

/* 移动端认证按钮样式 */
.user-auth.mobile .auth-buttons {
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.user-auth.mobile .auth-btn {
  width: 100%;
  text-align: center;
  border-radius: 4px;
}
</style>