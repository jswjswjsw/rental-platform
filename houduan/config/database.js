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
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const mysql = require('mysql2');

// 加载环境变量
require('dotenv').config();

// 创建数据库连接池
let poolConfig;

if (process.env.DATABASE_URL) {
    // 使用完整的数据库URL
    poolConfig = {
        uri: process.env.DATABASE_URL,
        charset: 'utf8mb4',
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: false,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        ssl: false
    };
} else {
    // 使用分离的环境变量
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
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
        ssl: false
    };
}

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