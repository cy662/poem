import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

// 创建Vue应用实例
const app = createApp(App)

// 使用Pinia状态管理
app.use(createPinia())

// 使用Vue Router路由
app.use(router)

// 挂载应用到DOM
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🌸 诗词雅集应用已启动')
  console.log('📖 Vue版本:', app.version)
}