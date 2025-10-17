-- 简化的RLS设置脚本
-- 为诗词应用提供基本的行级安全控制

-- ========== 1. 添加created_by字段到诗词表 ==========

-- 为诗词表添加创建者字段（如果不存在）
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'poems' AND column_name = 'created_by') THEN
    ALTER TABLE poems ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 更新现有诗词的created_by字段（设置为NULL，表示系统创建）
UPDATE poems SET created_by = NULL WHERE created_by IS NULL;

-- ========== 2. 启用RLS ==========

-- 确保所有表都启用了行级安全
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

-- ========== 3. 删除现有策略（如果存在） ==========

DROP POLICY IF EXISTS "允许匿名访问分类" ON categories;
DROP POLICY IF EXISTS "允许匿名访问作者" ON authors;
DROP POLICY IF EXISTS "允许匿名访问诗词" ON poems;
DROP POLICY IF EXISTS "允许插入诗词" ON poems;

-- ========== 4. 创建新的RLS策略 ==========

-- 分类表策略：所有人都可以查看，只有认证用户可以管理
CREATE POLICY "分类_查看策略" ON categories FOR SELECT USING (true);
CREATE POLICY "分类_管理策略" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- 作者表策略：所有人都可以查看，只有认证用户可以管理
CREATE POLICY "作者_查看策略" ON authors FOR SELECT USING (true);
CREATE POLICY "作者_管理策略" ON authors FOR ALL USING (auth.role() = 'authenticated');

-- 诗词表策略：
-- 1. 所有人都可以查看
CREATE POLICY "诗词_查看策略" ON poems FOR SELECT USING (true);

-- 2. 认证用户可以添加诗词
CREATE POLICY "诗词_添加策略" ON poems FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. 认证用户可以更新自己添加的诗词（通过created_by字段）
CREATE POLICY "诗词_更新策略" ON poems FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  (created_by = auth.uid() OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ))
);

-- 4. 认证用户可以删除自己添加的诗词
CREATE POLICY "诗词_删除策略" ON poems FOR DELETE USING (
  auth.role() = 'authenticated' AND 
  (created_by = auth.uid() OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ))
);

-- ========== 5. 创建管理员检查函数 ==========

-- 检查用户是否为管理员的函数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== 6. 创建自动设置created_by的触发器 ==========

-- 自动设置诗词创建者的触发器函数
CREATE OR REPLACE FUNCTION set_poem_creator()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_set_poem_creator ON poems;
CREATE TRIGGER trigger_set_poem_creator
  BEFORE INSERT ON poems
  FOR EACH ROW EXECUTE FUNCTION set_poem_creator();

-- ========== 7. 创建视图用于权限检查 ==========

-- 创建包含权限信息的诗词视图
CREATE OR REPLACE VIEW poems_with_permissions AS
SELECT 
  p.*,
  (p.created_by = auth.uid()) as can_edit,
  (p.created_by = auth.uid() OR is_admin()) as can_delete
FROM poems p;

-- ========== 8. 使用说明 ==========

/*
RLS策略说明：

1. 匿名用户：
   - 可以查看所有分类、作者、诗词
   - 无法进行任何修改操作

2. 认证用户（登录用户）：
   - 可以查看所有数据
   - 可以添加新的诗词
   - 可以更新和删除自己添加的诗词
   - 无法修改分类和作者信息

3. 管理员用户：
   - 拥有所有权限
   - 可以管理所有数据

设置管理员：
1. 在Supabase Auth中为用户设置metadata：
   UPDATE auth.users SET raw_user_meta_data = '{"role": "admin"}' WHERE id = '用户ID';

或者通过Supabase Dashboard设置用户metadata。

当前策略特点：
- 简单易用，适合大多数应用场景
- 基于Supabase内置的auth.role()函数
- 支持用户管理自己创建的内容
- 管理员拥有完全控制权
*/

-- 测试查询（在Supabase SQL编辑器中执行）：
-- SELECT * FROM poems_with_permissions LIMIT 5;