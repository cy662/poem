-- RLS（行级安全）管理脚本
-- 为诗词应用提供完整的权限控制解决方案

-- ========== 1. 用户认证和角色管理 ==========

-- 创建用户资料表（扩展Supabase Auth用户信息）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户角色表
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== 2. 启用RLS ==========

-- 启用所有表的行级安全
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

-- ========== 3. 用户资料表RLS策略 ==========

-- 允许用户查看所有公开的用户资料
CREATE POLICY "允许查看用户资料" ON user_profiles FOR SELECT USING (true);

-- 允许用户更新自己的资料
CREATE POLICY "允许用户更新自己的资料" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- 允许用户插入自己的资料（通过触发器自动创建）
CREATE POLICY "允许用户插入资料" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ========== 4. 用户角色表RLS策略 ==========

-- 允许用户查看所有角色（用于权限检查）
CREATE POLICY "允许查看用户角色" ON user_roles FOR SELECT USING (true);

-- 允许管理员管理所有角色
CREATE POLICY "允许管理员管理角色" ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid() AND role = 'admin')
);

-- ========== 5. 分类表RLS策略 ==========

-- 允许所有人查看分类
CREATE POLICY "分类_允许查看" ON categories FOR SELECT USING (true);

-- 允许管理员和版主管理分类
CREATE POLICY "分类_允许管理" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- ========== 6. 作者表RLS策略 ==========

-- 允许所有人查看作者
CREATE POLICY "作者_允许查看" ON authors FOR SELECT USING (true);

-- 允许管理员和版主管理作者
CREATE POLICY "作者_允许管理" ON authors FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- ========== 7. 诗词表RLS策略 ==========

-- 允许所有人查看诗词
CREATE POLICY "诗词_允许查看" ON poems FOR SELECT USING (true);

-- 允许认证用户添加诗词
CREATE POLICY "诗词_允许添加" ON poems FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (SELECT 1 FROM user_roles WHERE id = auth.uid())
);

-- 允许用户更新自己添加的诗词
CREATE POLICY "诗词_允许更新自己的" ON poems FOR UPDATE USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM poem_contributions 
    WHERE poem_id = id AND user_id = auth.uid()
  )
);

-- 允许管理员和版主管理所有诗词
CREATE POLICY "诗词_允许管理" ON poems FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- ========== 8. 诗词贡献记录表 ==========

-- 创建诗词贡献记录表（记录谁添加了哪首诗词）
CREATE TABLE IF NOT EXISTS poem_contributions (
  id SERIAL PRIMARY KEY,
  poem_id INTEGER REFERENCES poems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE poem_contributions ENABLE ROW LEVEL SECURITY;

-- 允许用户查看所有贡献记录
CREATE POLICY "贡献_允许查看" ON poem_contributions FOR SELECT USING (true);

-- 允许用户插入自己的贡献记录
CREATE POLICY "贡献_允许插入" ON poem_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========== 9. 触发器函数 ==========

-- 自动创建用户资料和角色的触发器函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 插入用户资料
  INSERT INTO user_profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  
  -- 插入默认用户角色
  INSERT INTO user_roles (id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户注册后的触发器
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 自动记录诗词贡献的触发器函数
CREATE OR REPLACE FUNCTION record_poem_contribution()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO poem_contributions (poem_id, user_id, action)
    VALUES (NEW.id, auth.uid(), 'created');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO poem_contributions (poem_id, user_id, action)
    VALUES (NEW.id, auth.uid(), 'updated');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建诗词操作的触发器
CREATE OR REPLACE TRIGGER on_poem_created
  AFTER INSERT ON poems
  FOR EACH ROW EXECUTE FUNCTION record_poem_contribution();

CREATE OR REPLACE TRIGGER on_poem_updated
  AFTER UPDATE ON poems
  FOR EACH ROW EXECUTE FUNCTION record_poem_contribution();

-- ========== 10. 权限检查函数 ==========

-- 检查用户是否有特定权限的函数
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
  user_permissions JSONB;
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM user_roles WHERE id = auth.uid();
  
  IF user_role = 'admin' THEN
    RETURN true;
  ELSIF user_role = 'moderator' THEN
    RETURN permission_name IN ('manage_categories', 'manage_authors', 'manage_poems');
  ELSE
    RETURN COALESCE(user_permissions->>permission_name, 'false')::BOOLEAN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== 11. 索引优化 ==========

-- 为权限检查创建索引
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_permissions ON user_roles USING gin(permissions);

-- 为贡献记录创建索引
CREATE INDEX IF NOT EXISTS idx_poem_contributions_user ON poem_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_poem_contributions_poem ON poem_contributions(poem_id);

-- ========== 12. 默认数据 ==========

-- 插入默认权限配置（如果需要）
-- 注意：实际管理员用户需要在Supabase Auth中创建后手动分配角色

-- ========== 13. 使用说明 ==========

/*
RLS策略使用说明：

1. 匿名用户：
   - 可以查看所有分类、作者、诗词
   - 无法进行任何修改操作

2. 普通用户（user角色）：
   - 拥有匿名用户的所有权限
   - 可以添加新的诗词
   - 可以更新自己添加的诗词
   - 无法删除诗词或管理分类/作者

3. 版主（moderator角色）：
   - 拥有普通用户的所有权限
   - 可以管理分类、作者、诗词
   - 无法管理用户角色

4. 管理员（admin角色）：
   - 拥有所有权限
   - 可以管理所有数据表和用户角色

设置管理员用户：
1. 在Supabase Auth中创建用户
2. 执行以下SQL（替换USER_ID为实际用户ID）：
   UPDATE user_roles SET role = 'admin' WHERE id = 'USER_ID';
*/

-- 示例：检查当前用户权限
-- SELECT has_permission('manage_poems');