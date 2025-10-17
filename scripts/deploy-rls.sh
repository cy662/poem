#!/bin/bash

# RLS快速部署脚本
# 用于一键设置诗词应用的RLS策略

set -e

echo "🚀 开始部署RLS策略..."

# 检查是否已安装supabase-cli
if ! command -v supabase &> /dev/null; then
    echo "❌ 未找到supabase-cli，请先安装："
    echo "npm install -g supabase"
    exit 1
fi

# 检查环境变量
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ 请先设置环境变量："
    echo "export VITE_SUPABASE_URL=您的项目URL"
    echo "export VITE_SUPABASE_ANON_KEY=您的匿名密钥"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 设置Supabase项目
echo "🔗 连接到Supabase项目..."
supabase link --project-ref $(echo $VITE_SUPABASE_URL | grep -o '[^/]*$')

# 执行RLS设置脚本
echo "📋 执行RLS设置脚本..."
supabase db push --file scripts/simple-rls-setup.sql

# 验证部署
echo "🔍 验证RLS策略..."
supabase db query "
SELECT 
    tablename, 
    CASE WHEN rowsecurity THEN '✅ 已启用' ELSE '❌ 未启用' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'authors', 'poems');
"

echo "🔍 查看创建的策略..."
supabase db query "
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"

echo "🎉 RLS部署完成！"
echo ""
echo "📝 下一步操作："
echo "1. 在Supabase控制台中启用认证"
echo "2. 设置管理员用户（参考RLS部署指南.md）"
echo "3. 测试权限控制功能"
echo ""
echo "💡 提示：运行 'npm run dev' 启动开发服务器测试功能"