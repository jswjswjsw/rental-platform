/**
 * 详细的RDS连接调试脚本
 */

const mysql = require('mysql2/promise');
const net = require('net');
require('dotenv').config({ path: './houduan/.env' });

async function debugConnection() {
    const host = process.env.DB_HOST;
    const port = parseInt(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER;
    const database = process.env.DB_NAME;
    
    console.log('🔍 开始连接调试...');
    console.log('配置信息:');
    console.log(`  主机: ${host}`);
    console.log(`  端口: ${port}`);
    console.log(`  用户: ${user}`);
    console.log(`  数据库: ${database}`);
    console.log('');
    
    // 1. 测试网络连通性
    console.log('1️⃣ 测试网络连通性...');
    try {
        await testNetworkConnection(host, port);
        console.log('✅ 网络连通正常');
    } catch (error) {
        console.error('❌ 网络连接失败:', error.message);
        console.error('💡 可能的原因:');
        console.error('   - 白名单未添加你的IP地址');
        console.error('   - 安全组未开放3306端口');
        console.error('   - RDS实例状态异常');
        return;
    }
    
    // 2. 测试MySQL连接
    console.log('\n2️⃣ 测试MySQL连接...');
    try {
        const connection = await mysql.createConnection({
            host: host,
            port: port,
            user: user,
            password: process.env.DB_PASSWORD,
            connectTimeout: 10000,
            acquireTimeout: 10000,
            timeout: 10000
        });
        
        console.log('✅ MySQL认证成功');
        await connection.end();
        
    } catch (error) {
        console.error('❌ MySQL连接失败:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 用户名或密码错误');
        } else if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
            console.error('💡 用户没有访问数据库的权限');
        } else {
            console.error('💡 其他MySQL错误');
        }
        return;
    }
    
    // 3. 测试数据库访问
    console.log('\n3️⃣ 测试数据库访问...');
    try {
        const connection = await mysql.createConnection({
            host: host,
            port: port,
            user: user,
            password: process.env.DB_PASSWORD,
            database: database,
            connectTimeout: 10000
        });
        
        console.log('✅ 数据库访问成功');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 查询测试成功:', rows[0]);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ 数据库访问失败:', error.message);
        
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 数据库不存在，请先在RDS控制台创建 rental_platform 数据库');
        } else {
            console.error('💡 其他数据库错误');
        }
    }
}

function testNetworkConnection(host, port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        
        const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error('连接超时'));
        }, 10000);
        
        socket.connect(port, host, () => {
            clearTimeout(timeout);
            socket.destroy();
            resolve();
        });
        
        socket.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

debugConnection();