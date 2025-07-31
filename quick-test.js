/**
 * 快速数据库连接测试脚本
 * 用于验证阿里云RDS连接是否正常
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './houduan/.env' });

async function quickTest() {
    console.log('⚡ 快速RDS连接测试');
    console.log('==================');
    
    const config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        connectTimeout: 5000
    };
    
    console.log(`🎯 连接目标: ${config.host}:${config.port}`);
    console.log(`👤 用户: ${config.user}`);
    console.log(`💾 数据库: ${config.database}\n`);
    
    try {
        console.log('🔌 正在连接...');
        const connection = await mysql.createConnection(config);
        
        console.log('✅ 连接成功!');
        
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
        console.log('📊 测试查询结果:', rows[0]);
        
        await connection.end();
        console.log('🎉 测试完成，连接正常!');
        
    } catch (error) {
        console.log('❌ 连接失败:', error.message);
        console.log('🔧 错误代码:', error.code);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 请检查RDS白名单和用户权限');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 请检查网络连接和RDS状态');
        }
    }
}

quickTest();