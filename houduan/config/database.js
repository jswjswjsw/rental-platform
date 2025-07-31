/**
 * 数据库连接配置模块
 * 
 * 功能说明：
 * - 使用MySQL2连接池管理数据库连接
 * - 提供Promise版本的数据库操作接口
 * - 自动重连和连接超时处理
 * - 连接状态检测和错误处理
 * 
 * 配置特性：
 * - 连接池管理：避免频繁创建/销毁连接
 * - 自动重连：网络中断时自动恢复连接
 * - 超时控制：防止长时间等待
 * - 安全配置：禁止多语句查询防止SQL注入
 * 
 * 环境变量依赖：
 * - DB_HOST: 数据库主机地址
 * - DB_PORT: 数据库端口
 * - DB_USER: 数据库用户名
 * - DB_PASSWORD: 数据库密码
 * - DB_NAME: 数据库名称
 * - DB_SSL: 是否启用SSL连接 (true/false)
 * - DATABASE_URL: 完整数据库连接URL (可选，优先级高于分离变量)
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const mysql = require('mysql2');

// 加载环境变量
require('dotenv').config();

// 解析DATABASE_URL或使用分离的环境变量
function parseConnectionConfig() {
    // 验证端口号
    const validatePort = (port) => {
        const parsed = parseInt(port);
        return (parsed && parsed > 0 && parsed <= 65535) ? parsed : null;
    };

    if (process.env.DATABASE_URL) {
        // 解析DATABASE_URL: mysql://user:password@host:port/database
        const url = new URL(process.env.DATABASE_URL);
        return {
            host: url.hostname,
            port: validatePort(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // 移除开头的 '/'
            charset: 'utf8mb4',
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: false,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        };
    } else {
        // 使用分离的环境变量
        return {
            host: process.env.DB_HOST || 'localhost',
            port: validatePort(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'rental_platform',
            charset: 'utf8mb4',
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: false,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        };
    }
}

const poolConfig = parseConnectionConfig();
console.log('🔧 数据库配置:', {
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user ? '***' : 'not set',
    database: poolConfig.database
});

const pool = mysql.createPool(poolConfig);

// 获取Promise版本的连接池
const promisePool = pool.promise();

/**
 * 测试数据库连接
 */
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ 数据库连接成功');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);

        // 提供更详细的错误信息
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 建议: 检查数据库服务是否启动，主机地址和端口是否正确');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 建议: 检查数据库用户名和密码是否正确');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 建议: 检查数据库名称是否存在');
        }

        return false;
    }
}

// 启动时测试连接
testConnection();

module.exports = {
    pool,
    promisePool,
    testConnection
};