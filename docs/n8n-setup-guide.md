# n8n集成配置指南

## 🚀 快速开始

### 方法一：使用n8n.cloud（推荐，5分钟完成）

1. **注册n8n.cloud账号**
   - 访问 https://n8n.cloud
   - 注册免费账号
   - 创建工作空间

2. **导入工作流**
   - 在n8n.cloud界面点击"Import from file"
   - 选择 `docs/n8n-workflow-example.json`
   - 激活工作流

3. **获取配置信息**
   - 复制工作空间的URL（如：`https://your-workspace.n8n.cloud`）
   - 在Settings → API Keys中创建新的API密钥

4. **配置环境变量**
   ```env
   VITE_N8N_BASE_URL=https://your-workspace.n8n.cloud
   VITE_N8N_WEBHOOK_PATH=/webhook/poem-ai-assistant
   VITE_N8N_API_KEY=your-api-key-here
   ```

### 方法二：本地部署n8n

1. **安装n8n**
   ```bash
   # 使用npm安装
   npm install -g n8n
   
   # 或者使用Docker
   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
   ```

2. **启动n8n服务**
   ```bash
   n8n start
   # 服务将在 http://localhost:5678 启动
   ```

3. **导入工作流（详细步骤）**

   **步骤1：访问n8n界面**
   - 打开浏览器，访问 http://localhost:5678
   - 首次访问会显示n8n登录界面

   **步骤2：登录n8n**
   - 如果您是首次使用，需要设置管理员账户
   - 输入用户名、密码和邮箱（本地部署无需验证邮箱）
   - 点击"Create account"创建账户

   **步骤3：进入工作流界面**
   - 登录成功后，点击左侧菜单的"Workflows"
   - 您会看到空的工作流列表

   **步骤4：导入工作流文件**
   - 点击右上角的"Import from file"按钮
   - 在弹出的文件选择器中，找到项目中的 `docs/n8n-workflow-example.json` 文件
   - 选择文件并点击"Open"

   **步骤5：查看导入的工作流**
   - 导入成功后，您会看到"诗词AI助手工作流"出现在列表中
   - 工作流状态显示为"Inactive"（未激活）

   **步骤6：激活工作流**
   - 点击工作流名称进入编辑界面
   - 点击右上角的"Execute Workflow"开关，将其变为绿色
   - 工作流状态变为"Active"（已激活）

   **步骤7：获取webhook URL**
   - 在工作流编辑界面，找到"诗词AI助手Webhook"节点
   - 点击该节点，在右侧面板中复制"Webhook URL"
   - 这个URL就是您的webhook地址，格式类似：`http://localhost:5678/webhook/poem-ai-assistant`

   **步骤8：测试工作流**
   - 点击右上角的"Test"按钮
   - 在测试面板中输入测试数据：`{"question": "推荐一首唐诗"}`
   - 点击"Execute Workflow"查看响应结果

4. **配置环境变量**
   ```env
   VITE_N8N_BASE_URL=http://localhost:5678
   VITE_N8N_WEBHOOK_PATH=/webhook/poem-ai-assistant
   VITE_N8N_API_KEY=your-local-api-key
   ```

## 📋 配置步骤详解

### 1. 创建环境配置文件

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# n8n服务配置（选择一种方式）
# 方式一：n8n.cloud
VITE_N8N_BASE_URL=https://your-workspace.n8n.cloud
VITE_N8N_API_KEY=sk_prod_xxxxxxxxxxxxxxxx

# 方式二：本地n8n
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_API_KEY=your-api-key

# Supabase配置（已有）
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 获取n8n API密钥

**n8n.cloud:**
- 登录n8n.cloud
- 进入工作空间设置
- 点击"API Keys"
- 创建新的API密钥

**本地n8n:**
- 访问n8n界面
- 点击右上角用户图标
- 选择"Settings"
- 在"API Key"部分生成密钥

### 3. 测试连接

重启开发服务器后，AI助手将自动检测n8n配置：

```bash
npm run dev
```

在浏览器控制台查看连接状态：
- 如果显示"n8n服务未配置，使用本地知识库" → n8n未连接
- 如果显示"调用n8n API" → n8n连接成功

## 🔧 工作流功能说明

导入的工作流包含以下功能：

### 1. 意图识别
- 自动识别问题类型（推荐、解释、比较等）
- 支持关键词匹配

### 2. 智能回复
- **诗词推荐**: 根据关键词推荐相关诗词
- **诗句解释**: 解释经典诗句的含义和背景
- **诗人介绍**: 提供诗人详细信息和代表作品
- **体裁说明**: 解释不同诗词体裁的特点

### 3. 可扩展性
您可以轻松扩展工作流：
- 添加新的意图识别规则
- 集成外部AI服务（如OpenAI）
- 连接诗词数据库API
- 添加用户反馈机制

## 🐛 故障排除

### 常见问题

**1. n8n连接失败**
```
错误：n8n API调用失败
```
**解决方案：**
- 检查n8n服务是否正常运行
- 验证API密钥是否正确
- 确认webhook路径是否正确

**2. 工作流未激活**
```
错误：404 Not Found
```
**解决方案：**
- 在n8n界面激活工作流
- 检查webhook节点是否已保存

**3. 环境变量未生效**
```
控制台显示使用本地知识库
```
**解决方案：**
- 重启开发服务器：`npm run dev`
- 检查.env.local文件格式
- 确认变量名拼写正确

### 调试技巧

1. **查看浏览器控制台**
   - 按F12打开开发者工具
   - 查看Network标签页的API调用

2. **检查n8n日志**
   - 在n8n界面查看执行日志
   - 确认工作流正常运行

3. **测试API端点**
   ```bash
   # 使用curl测试
   curl -X POST http://localhost:5678/webhook/poem-ai-assistant \
     -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"question": "测试问题"}'
   ```

## 🚀 高级配置

### 集成OpenAI（可选）

如果您想使用GPT模型增强AI助手：

1. **在n8n工作流中添加OpenAI节点**
2. **配置OpenAI API密钥**
3. **修改意图识别逻辑**

### 连接诗词数据库

集成外部诗词API：
- 诗词API服务
- 文学数据库
- 学术资源接口

### 用户个性化

添加用户历史记录：
- 保存对话历史
- 个性化推荐
- 学习进度跟踪

## 📞 技术支持

如果遇到问题：
1. 查看n8n官方文档：https://docs.n8n.io
2. 检查控制台错误信息
3. 验证环境变量配置
4. 测试API端点连通性

完成配置后，您的AI助手将具备真正的智能问答能力！