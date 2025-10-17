# 诗词雅集 - 基于Supabase的诗词管理应用

## 项目简介

这是一个基于Vue 3 + TypeScript + Pinia + Supabase的诗词管理应用，提供诗词浏览、搜索、分类和管理功能。

## 功能特性

- 📚 **诗词浏览**: 查看历代诗词作品
- 🔍 **智能搜索**: 按标题、作者、内容搜索
- 🏷️ **分类管理**: 按主题分类浏览诗词
- 👤 **作者信息**: 了解诗词作者生平
- 🛠️ **管理后台**: 添加和管理诗词数据
- ☁️ **云端存储**: 基于Supabase的实时数据同步
- 🤖 **AI助手**: 悬浮式诗词AI助手，基于n8n工作流

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **UI组件**: 原生CSS + 响应式设计
- **后端服务**: Supabase (PostgreSQL + 实时API)
- **AI集成**: n8n工作流自动化
- **构建工具**: Vite

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制环境配置文件并设置Supabase连接信息：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，设置您的配置：

```env
# Supabase配置
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥

# n8n集成配置（可选）
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_WEBHOOK_PATH=/webhook/poem-ai-assistant
VITE_N8N_API_KEY=your-n8n-api-key
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## Supabase数据库设置

### 1. 创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com)
2. 创建新项目
3. 获取项目URL和匿名密钥

### 2. 初始化数据库表

在Supabase SQL编辑器中执行 `scripts/init-database.sql` 脚本：

```sql
-- 执行 scripts/init-database.sql 中的SQL语句
```

### 3. 配置表权限

确保为匿名用户设置适当的表权限：

```sql
-- 允许匿名用户读取诗词数据
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许匿名用户读取诗词" ON poems FOR SELECT USING (true);

-- 允许匿名用户读取作者数据
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许匿名用户读取作者" ON authors FOR SELECT USING (true);

-- 允许匿名用户读取分类数据
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许匿名用户读取分类" ON categories FOR SELECT USING (true);
```

## 项目结构

```
src/
├── components/     # 可复用组件
├── views/          # 页面组件
├── stores/         # Pinia状态管理
├── services/       # 数据服务层
├── lib/            # 工具库和配置
├── router/         # 路由配置
├── types/          # TypeScript类型定义
└── assets/         # 静态资源
```

## 主要功能模块

### 1. 诗词管理 (`src/stores/poem.ts`)

- 诗词数据的获取和管理
- 搜索和筛选功能
- 作者信息管理

### 2. Supabase服务 (`src/services/supabaseService.ts`)

- 诗词CRUD操作
- 作者信息查询
- 分类数据管理

### 3. AI助手服务 (`src/services/n8nService.ts`)

- 诗词AI问答功能
- n8n工作流集成
- 智能意图识别

### 4. AI助手组件 (`src/components/AIAssistant.vue`)

- 悬浮式聊天界面
- 快速问题建议
- 实时对话交互

### 5. 管理后台 (`src/views/AdminView.vue`)

- 添加新诗词
- 查看数据统计
- 管理现有数据

## API接口说明

### 诗词相关接口

- `GET /poems` - 获取所有诗词
- `GET /poems/:id` - 获取指定诗词详情
- `POST /poems` - 添加新诗词
- `GET /poems/search?q=关键词` - 搜索诗词

### 作者相关接口

- `GET /authors` - 获取所有作者
- `GET /authors/:id` - 获取指定作者详情
- `GET /authors/dynasty/:dynasty` - 按朝代获取作者

### AI助手接口

- `POST /webhook/poem-ai-assistant` - AI助手问答接口
- 支持意图识别、诗词推荐、解释等功能

## 开发指南

### 添加新功能

1. 在 `src/types/poem.ts` 中定义数据类型
2. 在 `src/services/supabaseService.ts` 中添加服务方法
3. 在 `src/stores/poem.ts` 中更新状态管理
4. 创建或更新相关组件

### 数据模型

参考 `src/types/poem.ts` 中的类型定义：

```typescript
interface Poem {
  id: string
  title: string
  author: string
  dynasty: string
  category: string
  content: string
  translation?: string
  annotation?: string
  tags: string[]
  createdAt: string
}
```

## AI助手功能使用指南

### 功能特点

- **悬浮式设计**: 右下角悬浮按钮，随时可用
- **智能问答**: 支持诗词推荐、解释、作者介绍等
- **快速提问**: 内置常用问题模板
- **n8n集成**: 可扩展的工作流架构

### 使用方式

1. 点击右下角的🤖机器人图标打开AI助手面板
2. 选择快速问题或输入自定义问题
3. 查看AI助手的智能回复
4. 继续对话或关闭面板

### n8n工作流配置

项目提供了完整的n8n工作流示例：

```bash
docs/n8n-workflow-example.json
```

#### 工作流功能

1. **意图识别**: 自动识别用户问题类型
2. **诗词推荐**: 根据关键词推荐相关诗词
3. **诗词解释**: 解释特定诗句的含义
4. **通用回复**: 处理其他类型的问题

#### 部署n8n工作流

1. 安装n8n: `npm install -g n8n`
2. 启动n8n: `n8n start`
3. 导入工作流文件: `docs/n8n-workflow-example.json`
4. 配置环境变量
5. 激活工作流

### 自定义扩展

您可以扩展AI助手功能：

1. **添加知识库**: 在 `src/services/n8nService.ts` 中扩展知识库
2. **集成真实AI**: 替换模拟API为真实的AI服务
3. **自定义工作流**: 修改n8n工作流逻辑

## 部署说明

### Vercel部署

1. 连接GitHub仓库到Vercel
2. 设置环境变量
3. 部署项目

### 其他平台

确保设置正确的环境变量和构建配置。

### n8n服务部署

AI助手功能需要n8n服务支持：

1. **本地部署**: 适合开发和测试
2. **云服务**: 使用n8n.cloud或其他云平台
3. **Docker部署**: 使用官方Docker镜像

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License

## 联系方式

如有问题请联系项目维护者。