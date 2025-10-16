-- 诗词应用数据库初始化脚本
-- 在Supabase SQL编辑器中执行此脚本

-- 创建诗词分类表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建作者表
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dynasty VARCHAR(50) NOT NULL,
  birth VARCHAR(20),
  death VARCHAR(20),
  description TEXT,
  avatar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为作者表添加唯一约束
ALTER TABLE authors ADD CONSTRAINT authors_name_dynasty_unique UNIQUE (name, dynasty);

-- 创建诗词表
CREATE TABLE IF NOT EXISTS poems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  dynasty VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  translation TEXT,
  annotation TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at DATE DEFAULT CURRENT_DATE
);

-- 为诗词表添加唯一约束
ALTER TABLE poems ADD CONSTRAINT poems_title_author_unique UNIQUE (title, author);

-- 插入默认分类数据
INSERT INTO categories (name, description) VALUES
('思乡', '表达思念家乡之情的诗词'),
('写景', '描写自然景色的诗词'),
('励志', '激励人心的诗词'),
('爱情', '表达爱情的诗词'),
('友情', '歌颂友谊的诗词'),
('咏物', '描写物品的诗词'),
('怀古', '怀念古代人事的诗词'),
('边塞', '描写边塞生活的诗词'),
('田园', '描写田园生活的诗词'),
('送别', '表达离别之情的诗词')
ON CONFLICT (name) DO NOTHING;

-- 插入默认作者数据
INSERT INTO authors (name, dynasty, birth, death, description) VALUES
('李白', '唐', '701', '762', '唐代伟大的浪漫主义诗人，被后人誉为"诗仙"'),
('杜甫', '唐', '712', '770', '唐代伟大的现实主义诗人，被后人誉为"诗圣"'),
('白居易', '唐', '772', '846', '唐代伟大的现实主义诗人，新乐府运动的倡导者'),
('王维', '唐', '701', '761', '唐代著名诗人、画家，被誉为"诗佛"'),
('孟浩然', '唐', '689', '740', '唐代著名的山水田园派诗人'),
('王之涣', '唐', '688', '742', '唐代著名诗人，以《登鹳雀楼》闻名'),
('苏轼', '宋', '1037', '1101', '北宋著名文学家、书画家，唐宋八大家之一'),
('李清照', '宋', '1084', '1155', '宋代著名女词人，婉约词派代表'),
('辛弃疾', '宋', '1140', '1207', '南宋著名词人，豪放派代表'),
('陆游', '宋', '1125', '1210', '南宋著名诗人，爱国诗人代表')
ON CONFLICT (name, dynasty) DO NOTHING;

-- 插入示例诗词数据
INSERT INTO poems (title, author, dynasty, category, content, translation, annotation, tags) VALUES
('静夜思', '李白', '唐', '思乡', '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', '明亮的月光洒在床前的窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。', '这是一首写远客思乡之情的诗，诗以明白如话的语言雕琢出明静醇美的意境。', '{"思乡", "月亮", "经典"}'),
('春晓', '孟浩然', '唐', '写景', '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。', '春日里贪睡不知不觉天已破晓，搅乱我酣眠的是那啁啾的小鸟。昨天夜里风声雨声一直不断，那娇美的春花不知被吹落了多少？', '这首诗写的是春日早晨的景色和诗人的感受。', '{"春天", "写景", "经典"}'),
('登鹳雀楼', '王之涣', '唐', '励志', '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。', '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。若想把千里的风光景物看够，那就要登上更高的一层城楼。', '这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负，反映了盛唐时期人们积极向上的进取精神。', '{"励志", "登高", "经典"}'),
('望庐山瀑布', '李白', '唐', '写景', '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。', '香炉峰在阳光的照射下生起紫色烟霞，远远望见瀑布似白色绢绸悬挂在山前。高崖上飞腾直落的瀑布好像有几千尺，让人恍惚以为银河从天上泻落到人间。', '这首诗形象地描绘了庐山瀑布雄奇壮丽的景色，反映了诗人对祖国大好河山的热爱。', '{"写景", "瀑布", "山水"}'),
('相思', '王维', '唐', '爱情', '红豆生南国，春来发几枝。\n愿君多采撷，此物最相思。', '红豆生长在南方，春天来了又生出了多少新枝？希望你多多采摘它，因为它最能寄托相思之情。', '这首诗通过红豆表达相思之情，语言朴素无华，却意味深长。', '{"爱情", "相思", "红豆"}'),
('江雪', '柳宗元', '唐', '写景', '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。', '所有的山上，飞鸟的身影已经绝迹，所有道路都不见人的踪迹。江面孤舟上，一位披戴着蓑笠的老翁，独自在漫天风雪中垂钓。', '这首诗描绘了一幅江乡雪景图，表现了诗人清高孤傲的情怀。', '{"写景", "冬天", "孤独"}')
ON CONFLICT (title, author) DO NOTHING;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author);
CREATE INDEX IF NOT EXISTS idx_poems_category ON poems(category);
CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty);
CREATE INDEX IF NOT EXISTS idx_poems_created_at ON poems(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_authors_dynasty ON authors(dynasty);
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);

-- 启用行级安全策略（RLS）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

-- 创建允许匿名访问的策略（根据实际需求调整）
CREATE POLICY "允许匿名访问分类" ON categories FOR SELECT USING (true);
CREATE POLICY "允许匿名访问作者" ON authors FOR SELECT USING (true);
CREATE POLICY "允许匿名访问诗词" ON poems FOR SELECT USING (true);

-- 创建允许插入的策略（如果需要用户添加数据）
CREATE POLICY "允许插入诗词" ON poems FOR INSERT WITH CHECK (true);

-- 创建统计视图
CREATE OR REPLACE VIEW poem_stats AS
SELECT 
  (SELECT COUNT(*) FROM poems) as total_poems,
  (SELECT COUNT(*) FROM authors) as total_authors,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(DISTINCT dynasty) FROM poems) as total_dynasties;