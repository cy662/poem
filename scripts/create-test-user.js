// 测试用户创建脚本
// 这个脚本可以帮助快速创建测试用户，绕过邮箱验证问题

const testUsers = [
  {
    email: 'test@example.com',
    password: '123456',
    displayName: '测试用户',
    role: 'user'
  },
  {
    email: 'admin@example.com',
    password: '123456',
    displayName: '测试管理员',
    role: 'admin'
  }
]

console.log('测试用户信息：')
console.log('===============')
testUsers.forEach(user => {
  console.log(`邮箱: ${user.email}`)
  console.log(`密码: ${user.password}`)
  console.log(`角色: ${user.role}`)
  console.log('---')
})

console.log('\n使用说明：')
console.log('1. 在注册页面使用上述邮箱和密码进行测试')
console.log('2. 如果遇到"Invalid login credentials"错误：')
console.log('   - 在Supabase Dashboard中禁用邮箱验证')
console.log('   - 或检查邮箱是否已正确配置')
console.log('   - 或使用Supabase提供的测试邮箱功能')

console.log('\nSupabase配置检查：')
console.log('1. 确保VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY正确设置')
console.log('2. 在Supabase Dashboard中检查Authentication设置')
console.log('3. 确认邮箱提供者已启用')
console.log('4. 检查Site URL配置是否正确')

console.log('\n临时解决方案：')
console.log('- 在Supabase Dashboard → Authentication → Settings')
console.log('- 禁用"Enable email confirmations"')
console.log('- 或使用Supabase的"Disable email confirmations"功能')