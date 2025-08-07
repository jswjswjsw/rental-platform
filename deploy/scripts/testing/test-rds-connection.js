/**
 * 测试阿里云RDS连接
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './houduan/.env' });

async function testConnection() {
    let connection;
    
    try {
        console.log('🔄 测试RDS连接...');
        console.log('配置信息:');
        console.log(`  主机: ${process.env.DB_HOST}`);
        console.log(`  端口: ${process.env.DB_PORT}`);
        console.log(`  用户: ${process.env.DB_USER}`);
        console.log(`  数据库: ${process.env.DB_NAME}`);
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            charset: 'utf8mb4'
        });
        
        console.log('✅ RDS连接成功！');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        console.log(`📊 分类表中有 ${rows[0].count} 条记录`);
        
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`👥 用户表中有 ${users[0].count} 条记录`);
        
    } catch (error) {
        console.error('❌ 连接失败:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.error('💡 RDS地址无法解析，请检查地址是否正确');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 用户名或密码错误');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 连接被拒绝，请检查：');
            console.error('   - 安全组是否开放3306端口');
            console.error('   - 白名单是否包含你的IP');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 数据库不存在，请先运行初始化脚本');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testConnection();