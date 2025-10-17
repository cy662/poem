# RLS快速部署脚本 (PowerShell版本)
# 用于一键设置诗词应用的RLS策略

Write-Host "🚀 开始部署RLS策略..." -ForegroundColor Green

# 检查环境变量
if (-not $env:VITE_SUPABASE_URL -or -not $env:VITE_SUPABASE_ANON_KEY) {
    Write-Host "❌ 请先设置环境变量：" -ForegroundColor Red
    Write-Host '$env:VITE_SUPABASE_URL = "您的项目URL"' -ForegroundColor Yellow
    Write-Host '$env:VITE_SUPABASE_ANON_KEY = "您的匿名密钥"' -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 环境变量检查通过" -ForegroundColor Green

# 提取项目引用ID
$projectRef = $env:VITE_SUPABASE_URL -replace '.*/', ''

Write-Host "🔗 连接到Supabase项目: $projectRef" -ForegroundColor Cyan

# 执行RLS设置脚本
Write-Host "📋 执行RLS设置脚本..." -ForegroundColor Cyan
try {
    # 使用supabase-cli执行SQL脚本
    supabase db push --file scripts/simple-rls-setup.sql
    
    if ($LASTEXITCODE -ne 0) {
        throw "SQL脚本执行失败"
    }
}
catch {
    Write-Host "❌ 执行SQL脚本时出错: $_" -ForegroundColor Red
    exit 1
}

# 验证部署
Write-Host "🔍 验证RLS策略..." -ForegroundColor Cyan
$verifyQuery = @"
SELECT 
    tablename, 
    CASE WHEN rowsecurity THEN '✅ 已启用' ELSE '❌ 未启用' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'authors', 'poems');
"@

try {
    supabase db query "$verifyQuery"
}
catch {
    Write-Host "❌ 验证查询失败: $_" -ForegroundColor Red
}

Write-Host "🔍 查看创建的策略..." -ForegroundColor Cyan
$policyQuery = @"
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"@

try {
    supabase db query "$policyQuery"
}
catch {
    Write-Host "❌ 策略查询失败: $_" -ForegroundColor Red
}

Write-Host "🎉 RLS部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 下一步操作：" -ForegroundColor Yellow
Write-Host "1. 在Supabase控制台中启用认证" -ForegroundColor White
Write-Host "2. 设置管理员用户（参考RLS部署指南.md）" -ForegroundColor White
Write-Host "3. 测试权限控制功能" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：运行 'npm run dev' 启动开发服务器测试功能" -ForegroundColor Cyan