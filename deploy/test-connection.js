/**
 * 快速连接测试脚本
 * 用于验证修复后的连接状态
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './houduan/.env' });

async function quickTest() {
    console.log('🧪 快速连接测试...\n');
    
    const dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        connectTimeout: 30000
    };
    
    try {
        // 测试连接
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功');
        
        // 测试favorites表
        const [tables] = await connection.execute("SHOW TABLES LIKE 'favorites'");
        console.log(`✅ favorites表: ${tables.length > 0 ? '存在' : '不存在'}`);
        
        // 测试简单查询
        const [result] = await connection.execute('SELECT 1 as test');
        console.log(`✅ 查询测试: ${result[0].test === 1 ? '正常' : '异常'}`);
        
        await connection.end();
        
        console.log('\n🎉 所有测试通过！');
        console.log('💡 现在可以启动服务了');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('💡 请先运行修复脚本: node fix-network-connection.js');
    }
}

quickTest();