/**
 * 测试资源查询脚本
 */

// 设置正确的环境变量路径
require('dotenv').config({ path: './houduan/.env' });

const { promisePool } = require('./houduan/config/database');

async function testResourceQuery() {
    try {
        console.log('🔍 测试数据库数据...');

        // 检查用户数据
        const [users] = await promisePool.execute('SELECT id, username, email FROM users');
        console.log('✅ 用户总数:', users.length);
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.email})`);
        });

        // 检查分类数据
        const [categories] = await promisePool.execute('SELECT COUNT(*) as total FROM categories');
        console.log('✅ 分类总数:', categories[0].total);

        // 检查资源数据
        const [resources] = await promisePool.execute('SELECT id, title, images FROM resources');
        console.log('✅ 资源总数:', resources.length);
        
        resources.forEach(resource => {
            console.log(`   - ${resource.title}`);
            console.log(`     图片数据: ${resource.images}`);
            
            try {
                const imageArray = JSON.parse(resource.images);
                console.log(`     解析后的图片:`, imageArray);
            } catch (e) {
                console.log(`     图片数据解析失败: ${e.message}`);
            }
        });

    } catch (error) {
        console.error('❌ 查询失败:', error);
    } finally {
        process.exit(0);
    }
}

testResourceQuery();