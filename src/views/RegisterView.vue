<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const userRole = ref('user') // 默认普通用户
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const validateForm = () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = '请填写所有必填字段'
    return false
  }

  if (password.value.length < 6) {
    errorMessage.value = '密码长度至少6位'
    return false
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = '请输入有效的邮箱地址'
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.register(email.value, password.value, displayName.value, userRole.value)
    successMessage.value = '注册成功！请使用刚才设置的邮箱和密码登录。'
    
    // 3秒后跳转到登录页面
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error: any) {
    // 处理特定的错误消息
    if (error.message.includes('邮箱验证')) {
      errorMessage.value = '注册成功！请检查您的邮箱完成验证，然后登录。'
    } else {
      errorMessage.value = error.message || '注册失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h2>注册诗词雅集</h2>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email">邮箱地址 <span class="required">*</span></label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label for="displayName">显示名称</label>
          <input
            id="displayName"
            v-model="displayName"
            type="text"
            placeholder="请输入显示名称（可选）"
          />
        </div>

        <div class="form-group">
          <label for="password">密码 <span class="required">*</span></label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="至少6位字符"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认密码 <span class="required">*</span></label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <div class="form-group">
          <label>用户角色 <span class="required">*</span></label>
          <div class="role-selection">
            <label class="role-option">
              <input
                type="radio"
                v-model="userRole"
                value="user"
                checked
              />
              <span class="role-label">
                <span class="role-badge user">普通用户</span>
                <span class="role-description">可以浏览和收藏诗词</span>
              </span>
            </label>
            <label class="role-option">
              <input
                type="radio"
                v-model="userRole"
                value="admin"
              />
              <span class="role-label">
                <span class="role-badge admin">管理员</span>
                <span class="role-description">可以管理诗词和用户</span>
              </span>
            </label>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="test-info">
          <p><strong>本地认证模式已启用</strong></p>
          <p>✅ 注册后可以直接登录，无需邮箱验证</p>
          <p>✅ 测试用户已预创建：</p>
          <ul>
            <li>普通用户：test@example.com / 123456</li>
            <li>管理员：admin@example.com / 123456</li>
          </ul>
          <p>✅ 所有用户数据存储在浏览器本地</p>
        </div>

        <button type="submit" :disabled="isLoading" class="register-btn">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="auth-links">
        <p>已有账号？ <a @click="goToLogin" class="link">立即登录</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.required {
  color: #e74c3c;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin: 10px 0;
  font-size: 14px;
}

.success-message {
  color: #27ae60;
  text-align: center;
  margin: 10px 0;
  font-size: 14px;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.register-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.register-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.role-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.role-option:hover {
  border-color: #667eea;
}

.role-option input[type="radio"] {
  margin-right: 12px;
}

.role-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.user {
  background-color: #3498db;
  color: white;
}

.role-badge.admin {
  background-color: #e74c3c;
  color: white;
}

.role-description {
  font-size: 12px;
  color: #666;
}

.role-option:has(input[type="radio"]:checked) {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.auth-links {
  text-align: center;
  margin-top: 20px;
}

.link {
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
}

.link:hover {
  color: #5a6fd8;
}

.test-info {
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.test-info p {
  margin: 5px 0;
}

.test-info ol {
  margin: 10px 0;
  padding-left: 20px;
}

.test-info li {
  margin: 5px 0;
}
</style>