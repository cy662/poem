<template>
  <div class="add-poem-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">添加诗词</h1>
        <p class="page-description">分享您喜爱的诗词作品</p>
      </div>

      <div class="add-poem-form">
        <form @submit.prevent="handleSubmit" class="poem-form">
          <!-- 诗词标题 -->
          <div class="form-group">
            <label for="poem-title" class="form-label">诗词标题 *</label>
            <input
              id="poem-title"
              v-model="poemData.title"
              type="text"
              class="form-input"
              placeholder="请输入诗词标题"
              required
            />
          </div>

          <!-- 作者 -->
          <div class="form-group">
            <label for="poem-author" class="form-label">作者 *</label>
            <input
              id="poem-author"
              v-model="poemData.author"
              type="text"
              class="form-input"
              placeholder="请输入作者姓名"
              required
            />
          </div>

          <!-- 朝代 -->
          <div class="form-group">
            <label for="poem-dynasty" class="form-label">朝代</label>
            <select
              id="poem-dynasty"
              v-model="poemData.dynasty"
              class="form-select"
            >
              <option value="">请选择朝代</option>
              <option value="唐">唐</option>
              <option value="宋">宋</option>
              <option value="元">元</option>
              <option value="明">明</option>
              <option value="清">清</option>
              <option value="现代">现代</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <!-- 分类 -->
          <div class="form-group">
            <label for="poem-category" class="form-label">分类</label>
            <select
              id="poem-category"
              v-model="poemData.category"
              class="form-select"
            >
              <option value="未分类">未分类</option>
              <option value="唐诗">唐诗</option>
              <option value="宋词">宋词</option>
              <option value="元曲">元曲</option>
              <option value="古诗">古诗</option>
              <option value="现代诗">现代诗</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <!-- 诗词内容 -->
          <div class="form-group">
            <label for="poem-content" class="form-label">诗词内容 *</label>
            <textarea
              id="poem-content"
              v-model="poemData.content"
              class="form-textarea"
              placeholder="请输入诗词内容，每行一句"
              rows="8"
              required
            ></textarea>
          </div>

          <!-- 诗词注释 -->
          <div class="form-group">
            <label for="poem-annotation" class="form-label">注释</label>
            <textarea
              id="poem-annotation"
              v-model="poemData.annotation"
              class="form-textarea"
              placeholder="请输入诗词注释或赏析"
              rows="4"
            ></textarea>
          </div>

          <!-- 诗词翻译 -->
          <div class="form-group">
            <label for="poem-translation" class="form-label">翻译</label>
            <textarea
              id="poem-translation"
              v-model="poemData.translation"
              class="form-textarea"
              placeholder="请输入诗词翻译"
              rows="4"
            ></textarea>
          </div>

          <!-- 标签 -->
          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tags-input">
              <input
                v-model="newTag"
                type="text"
                class="tag-input"
                placeholder="输入标签后按回车添加"
                @keydown.enter.prevent="addTag"
              />
              <div class="tags-list">
                <span
                  v-for="tag in poemData.tags"
                  :key="tag"
                  class="tag"
                  @click="removeTag(tag)"
                >
                  {{ tag }} ×
                </span>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button
              type="submit"
              class="submit-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '提交中...' : '添加诗词' }}
            </button>
            <button
              type="button"
              class="cancel-btn"
              @click="handleCancel"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePoemStore } from '@/stores/poem'

const router = useRouter()
const poemStore = usePoemStore()

// 表单数据
const poemData = ref({
  title: '',
  author: '',
  dynasty: '',
  category: '未分类',
  content: '',
  translation: '',
  annotation: '',
  tags: [] as string[]
})

const newTag = ref('')
const isSubmitting = ref(false)

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !poemData.value.tags.includes(tag)) {
    poemData.value.tags.push(tag)
    newTag.value = ''
  }
}

// 移除标签
const removeTag = (tag: string) => {
  poemData.value.tags = poemData.value.tags.filter(t => t !== tag)
}

// 提交表单
const handleSubmit = async () => {
  if (!poemData.value.title || !poemData.value.author || !poemData.value.content) {
    alert('请填写必填字段（标题、作者、内容）')
    return
  }

  isSubmitting.value = true

  try {
    // 调用store中的方法添加诗词到Supabase数据库
    await poemStore.addPoem({
      title: poemData.value.title,
      author: poemData.value.author,
      dynasty: poemData.value.dynasty,
      category: poemData.value.category,
      content: poemData.value.content,
      translation: poemData.value.translation,
      annotation: poemData.value.annotation,
      tags: poemData.value.tags
    })

    alert('诗词添加成功！')
    // 重置表单
    poemData.value = {
      title: '',
      author: '',
      dynasty: '',
      category: '未分类',
      content: '',
      translation: '',
      annotation: '',
      tags: [] as string[]
    }
    // 跳转到诗词列表页
    router.push('/poems')
  } catch (error) {
    console.error('添加诗词失败:', error)
    alert('添加诗词失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  if (confirm('确定要取消添加吗？未保存的内容将会丢失。')) {
    router.back()
  }
}
</script>

<style scoped>
.add-poem-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: var(--font-family-serif);
}

.page-description {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.add-poem-form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-fast);
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* 标签输入样式 */
.tags-input {
  border: 2px solid #e9ecef;
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  background: white;
}

.tag-input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.25rem;
  font-size: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.tag:hover {
  background: #5a6fd8;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.cancel-btn:hover {
  background: #5a6268;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-poem-form {
    padding: 1.5rem;
    margin: 0 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>