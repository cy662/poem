# RLS（行级安全）部署指南

## 概述

本文档指导您如何为诗词应用数据库表添加RLS（Row Level Security）策略，实现细粒度的权限控制。

## 部署步骤

### 1. 执行数据库脚本

在Supabase SQL编辑器中按顺序执行以下脚本：

#### 第一步：执行基础RLS设置
```sql
-- 在Supabase SQL编辑器中执行 scripts/simple-rls-setup.sql
-- 这个脚本会：
-- 1. 启用所有表的RLS
-- 2. 创建权限策略
-- 3. 添加created_by字段
-- 4. 创建触发器和视图
```

#### 第二步：验证RLS设置
```sql
-- 验证RLS是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'authors', 'poems');

-- 查看创建的策略
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 2. 配置Supabase认证

#### 启用电子邮件/密码认证
1. 进入Supabase项目控制台
2. 导航到 Authentication → Settings
3. 启用 "Email" 提供商
4. 配置电子邮件模板（可选）

#### 设置网站URL（用于重定向）
1. 在 Authentication → URL Configuration 中
2. 设置 Site URL 为您的应用地址
3. 设置 Redirect URLs

### 3. 创建管理员用户

#### 方法一：通过SQL设置（推荐）
```sql
-- 首先创建用户（通过应用注册或Supabase控制台）
-- 然后执行以下SQL设置管理员角色
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin", "display_name": "管理员"}' 
WHERE email = 'admin@example.com';

-- 验证设置
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'admin';
```

#### 方法二：通过Supabase控制台
1. 进入 Authentication → Users
2. 找到目标用户并编辑
3. 在 User Metadata 中添加：
```json
{
  "role": "admin",
  "display_name": "管理员"
}
```

### 4. 更新环境变量

确保您的 `.env` 文件包含正确的Supabase配置：

```env
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

### 5. 测试RLS策略

#### 测试匿名访问
```sql
-- 以匿名用户身份测试（应该能查看但不能修改）
SELECT * FROM poems LIMIT 5;
-- 尝试插入（应该失败）
INSERT INTO poems (title, author, dynasty, category, content) 
VALUES ('测试', '测试作者', '现代', '测试', '测试内容');
```

#### 测试认证用户访问
```sql
-- 使用认证用户测试（需要先登录）
-- 应该能成功插入
INSERT INTO poems (title, author, dynasty, category, content) 
VALUES ('测试诗词', '测试作者', '现代', '测试', '测试内容');

-- 尝试更新自己创建的诗词（应该成功）
UPDATE poems SET content = '修改内容' WHERE title = '测试诗词';

-- 尝试更新他人创建的诗词（应该失败）
UPDATE poems SET content = '修改内容' WHERE title = '静夜思';
```

#### 测试管理员权限
```sql
-- 使用管理员账户测试
-- 应该能管理所有数据
UPDATE categories SET name = '新分类名' WHERE id = 1;
DELETE FROM poems WHERE id = 1;
```

## RLS策略说明

### 当前实现的策略

#### 分类表 (categories)
- **查看策略**: 所有人都可以查看
- **管理策略**: 只有认证用户可以管理（添加、修改、删除）

#### 作者表 (authors)
- **查看策略**: 所有人都可以查看
- **管理策略**: 只有认证用户可以管理

#### 诗词表 (poems)
- **查看策略**: 所有人都可以查看
- **添加策略**: 认证用户可以添加新诗词
- **更新策略**: 用户只能更新自己创建的诗词，管理员可以更新所有
- **删除策略**: 用户只能删除自己创建的诗词，管理员可以删除所有

### 权限层级

1. **匿名用户**（未登录）：
   - ✅ 查看所有分类、作者、诗词
   - ❌ 添加、修改、删除任何内容

2. **认证用户**（普通用户）：
   - ✅ 查看所有数据
   - ✅ 添加新诗词
   - ✅ 修改自己创建的诗词
   - ✅ 删除自己创建的诗词
   - ❌ 管理分类和作者

3. **管理员用户**：
   - ✅ 所有权限（完全控制）

## 故障排除

### 常见问题

#### 问题1：RLS策略不生效
**解决方案**：
```sql
-- 检查RLS是否启用
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 如果未启用，手动启用
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
```

#### 问题2：用户无法添加诗词
**解决方案**：
- 检查用户是否已登录
- 验证认证配置是否正确
- 检查插入策略是否存在

#### 问题3：管理员权限不生效
**解决方案**：
```sql
-- 检查用户metadata
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@example.com';

-- 重新设置管理员角色
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin"}' 
WHERE email = 'admin@example.com';
```

### 调试技巧

1. **查看当前会话用户**：
```sql
SELECT auth.uid(), auth.role();
```

2. **测试特定策略**：
```sql
-- 模拟用户权限检查
SELECT is_admin();  -- 检查是否为管理员
```

3. **查看策略执行情况**：
```sql
-- 启用详细日志
SET log_statement = 'all';
```

## 最佳实践

### 安全建议

1. **定期审查策略**：定期检查RLS策略是否符合业务需求
2. **最小权限原则**：只授予必要的最小权限
3. **测试各种场景**：确保所有用户角色都能正确工作

### 性能优化

1. **创建适当索引**：
```sql
-- 为权限检查创建索引
CREATE INDEX idx_poems_created_by ON poems(created_by);
CREATE INDEX idx_user_roles ON auth.users((raw_user_meta_data->>'role'));
```

2. **监控性能**：使用Supabase的监控工具跟踪查询性能

### 备份策略

1. **定期备份数据库**
2. **备份RLS策略**：
```sql
-- 导出当前策略
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 后续扩展

### 添加更多角色
可以扩展支持更多角色，如：
- `moderator`：版主，可以管理内容但不能管理用户
- `editor`：编辑，可以编辑所有内容但不能删除

### 细化权限
可以根据需要添加更细粒度的权限控制，如：
- 按分类设置权限
- 按时间段设置权限
- 按用户组设置权限

## 支持与帮助

如果遇到问题，可以：
1. 查看Supabase官方文档
2. 检查Supabase控制台的错误日志
3. 在项目GitHub仓库提交Issue

---

**注意**：部署前请务必在测试环境中验证所有功能！