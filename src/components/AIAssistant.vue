<template>
  <!-- 悬浮AI助手按钮 -->
  <div class="ai-assistant" :class="{ 'ai-assistant-open': isOpen }">
    <!-- 悬浮按钮 -->
    <button 
      class="ai-assistant-btn"
      @click="toggleAssistant"
      :class="{ 'ai-assistant-btn-open': isOpen }"
    >
      <span v-if="!isOpen" class="ai-icon">🤖</span>
      <span v-else class="ai-icon">✕</span>
    </button>

    <!-- AI助手面板 -->
    <Transition name="slide-up">
      <div v-if="isOpen" class="ai-assistant-panel">
        <!-- 面板头部 -->
        <div class="ai-panel-header">
          <h3>诗词AI助手</h3>
          <p>问我任何关于诗词的问题</p>
        </div>

        <!-- 聊天区域 -->
        <div class="ai-chat-container">
          <div class="ai-messages">
            <div 
              v-for="(message, index) in messages" 
              :key="index"
              :class="['ai-message', message.type]"
            >
              <div class="ai-message-content">
                {{ message.content }}
              </div>
              <div class="ai-message-time">
                {{ message.time }}
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="ai-input-container">
          <div class="ai-quick-questions">
            <button 
              v-for="(question, qIndex) in randomQuickQuestions" 
              :key="qIndex"
              class="quick-question-btn"
              @click="sendQuickQuestion(question)"
            >
              {{ question }}
            </button>
          </div>
          
          <div class="ai-input-group">
            <input
              v-model="userInput"
              type="text"
              placeholder="输入您的问题..."
              class="ai-input"
              @keyup.enter="sendMessage"
            />
            <button 
              @click="sendMessage" 
              class="ai-send-btn"
              :disabled="!userInput.trim()"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { callN8NAssistant, getQuickQuestions } from '@/services/n8nService'

// 响应式数据
const isOpen = ref(false)
const userInput = ref('')
const messages = ref<Array<{
  type: 'user' | 'assistant'
  content: string
  time: string
}>>([])

// 快速问题示例
const quickQuestions = getQuickQuestions()
const randomQuickQuestions = ref<string[]>([])

// 随机选择3个快速问题
const getRandomQuestions = (): string[] => {
  const shuffled = [...quickQuestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}

// 初始化随机问题
randomQuickQuestions.value = getRandomQuestions()

// 使用n8n服务的AI回复
const getAIResponse = async (question: string): Promise<string> => {
  try {
    const response = await callN8NAssistant({
      question: question,
      context: '诗词欣赏和文学知识'
    })
    return response.answer
  } catch (error) {
    console.error('AI助手请求失败:', error)
    return `抱歉，暂时无法处理您的请求。${question} 是一个很好的诗词问题，建议您查阅相关诗词资料或稍后再试。`
  }
}

// 格式化时间
const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 切换助手面板
const toggleAssistant = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // 每次打开时重新随机选择问题
    randomQuickQuestions.value = getRandomQuestions()
    if (messages.value.length === 0) {
      // 首次打开时显示欢迎消息
      showWelcomeMessage()
    }
  }
}

// 显示欢迎消息
const showWelcomeMessage = () => {
  const welcomeMessage = {
    type: 'assistant' as const,
    content: '您好！我是诗词AI助手，可以帮您解答关于诗词的问题、推荐经典作品、解释诗词含义等。请问有什么可以帮助您的？',
    time: formatTime(new Date())
  }
  messages.value.push(welcomeMessage)
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim()) return

  // 添加用户消息
  const userMessage = {
    type: 'user' as const,
    content: userInput.value,
    time: formatTime(new Date())
  }
  messages.value.push(userMessage)

  const question = userInput.value
  userInput.value = ''

  // 显示思考中状态
  const thinkingMessage = {
    type: 'assistant' as const,
    content: '思考中...',
    time: formatTime(new Date())
  }
  messages.value.push(thinkingMessage)

  try {
    // 获取AI回复
    const response = await getAIResponse(question)
    
    // 替换思考中消息为实际回复
    messages.value.pop()
    const assistantMessage = {
      type: 'assistant' as const,
      content: response,
      time: formatTime(new Date())
    }
    messages.value.push(assistantMessage)
  } catch (error) {
    // 替换思考中消息为错误消息
    messages.value.pop()
    const errorMessage = {
      type: 'assistant' as const,
      content: '抱歉，暂时无法处理您的请求，请稍后再试。',
      time: formatTime(new Date())
    }
    messages.value.push(errorMessage)
  }

  // 滚动到底部
  setTimeout(() => {
    const chatContainer = document.querySelector('.ai-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, 100)
}

// 发送快速问题
const sendQuickQuestion = (question: string) => {
  userInput.value = question
  sendMessage()
}

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里添加n8n API的初始化
})
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.ai-assistant-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: 4px solid #ffffff;
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 
    0 8px 32px rgba(255, 107, 107, 0.4),
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 20px rgba(255, 107, 107, 0.6);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
  position: relative;
  z-index: 1001;
}

.ai-assistant-btn:hover {
  transform: scale(1.15);
  box-shadow: 
    0 12px 40px rgba(255, 107, 107, 0.6),
    0 0 0 10px rgba(255, 255, 255, 0.2),
    0 0 30px rgba(255, 107, 107, 0.8);
  animation: none;
}

.ai-assistant-btn-open {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  box-shadow: 
    0 8px 32px rgba(46, 204, 113, 0.4),
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 0 20px rgba(46, 204, 113, 0.6);
}

.ai-assistant-btn-open:hover {
  box-shadow: 
    0 12px 40px rgba(46, 204, 113, 0.6),
    0 0 0 10px rgba(255, 255, 255, 0.2),
    0 0 30px rgba(46, 204, 113, 0.8);
}

.ai-assistant-panel {
  position: absolute;
  bottom: 85px;
  right: 0;
  width: 380px;
  height: 550px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.ai-panel-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 25px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.ai-panel-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 10s linear infinite;
}

.ai-panel-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.ai-panel-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.ai-chat-container {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f8f9fa;
}

.ai-messages {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 380px;
  overflow-y: auto;
}

.ai-message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.ai-message.user {
  align-self: flex-end;
}

.ai-message.assistant {
  align-self: flex-start;
}

.ai-message-content {
  padding: 10px 15px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
}

.ai-message.user .ai-message-content {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-bottom-right-radius: 5px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.ai-message.assistant .ai-message-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #2d3748;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.ai-message-time {
  font-size: 11px;
  color: #6c757d;
  margin-top: 5px;
  text-align: right;
}

.ai-message.assistant .ai-message-time {
  text-align: left;
}

.ai-input-container {
  border-top: 1px solid #e9ecef;
  background: white;
}

.ai-quick-questions {
  padding: 10px 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid #e9ecef;
  max-height: 80px;
  overflow-y: auto;
}

.quick-question-btn {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quick-question-btn:hover {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.ai-input-group {
  display: flex;
  padding: 15px;
  gap: 10px;
}

.ai-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.ai-input:focus {
  border-color: #667eea;
}

.ai-send-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.ai-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5252 0%, #d84315 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.ai-send-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
}

/* 脉冲动画 */
@keyframes pulse {
  0% {
    box-shadow: 
      0 8px 32px rgba(255, 107, 107, 0.4),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      0 0 20px rgba(255, 107, 107, 0.6);
  }
  50% {
    box-shadow: 
      0 8px 32px rgba(255, 107, 107, 0.6),
      0 0 0 10px rgba(255, 255, 255, 0.15),
      0 0 25px rgba(255, 107, 107, 0.8);
  }
  100% {
    box-shadow: 
      0 8px 32px rgba(255, 107, 107, 0.4),
      0 0 0 8px rgba(255, 255, 255, 0.1),
      0 0 20px rgba(255, 107, 107, 0.6);
  }
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 面板动画效果 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .ai-assistant {
    bottom: 10px;
    right: 10px;
  }

  .ai-assistant-panel {
    width: calc(100vw - 40px);
    right: -10px;
  }

  .ai-assistant-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>