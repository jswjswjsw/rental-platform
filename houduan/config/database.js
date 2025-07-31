/**
 * 阿里云RDS数据库连接配置模块
 * 
 * RDS实例信息：
 * - 实例ID: rm-bp1f62b28m6dxaqhf1219
 * - 内网地址: rm-bp1f62b28m6dxaqhf1219.mysql.rds.aliyuncs.com
 * - 数据库版本: MySQL 8.0
 * - 存储类型: 云盘ESSD
 * 
 * 功能说明：
 * - 使用MySQL2连接池管理数据库连接
 * - 提供Promise版本的数据库操作接口
 * - 针对阿里云RDS优化的连接配置
 * - 连接状态检测和错误处理
 * 
 * 配置特性：
 * - 连接池管理：避免频繁创建/销毁连接
 * - 超时控制：防止长时间等待
 * - 安全配置：禁止多语句查询防止SQL注入
 * - 字符集：utf8mb4支持emoji和特殊字符
 * 
 * 环境变量依赖：
 * - DB_HOST: RDS内网地址
 * - DB_PORT: 数据库端口(默认3306)
 * - DB_USER: 数据库用户名
 * - DB_PASSWORD: 数据库密码
 * - DB_NAME: 数据库名称
 * - DB_SSL: 是否启用SSL连接
 * 
 * @author 开发团队
 * @version 2.0.0
 * @since 2024-07-31
 */

const mysql = require('mysql2');

// 加载环境变量
require('dotenv').config();

/**
 * 解析数据库连接配置
 * 针对阿里云RDS优化的配置参数
 */
function parseConnectionConfig() {
    // 验证端口号
    const validatePort = (port) => {
        const parsed = parseInt(port);
        return (parsed && parsed > 0 && parsed <= 65535) ? parsed : null;
    };
    
    if (process.env.DATABASE_URL) {
        // 解析DATABASE_URL格式: mysql://user:password@host:port/database
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
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        };
    } else {
        // 使用分离的环境变量（推荐方式）
        return {
            host: process.env.DB_HOST || 'localhost',
            port: validatePort(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'rental_platform',
            charset: 'utf8mb4',
            connectionLimit: 10,        // 连接池大小
            queueLimit: 0,              // 队列限制
            multipleStatements: false,  // 禁止多语句查询（安全）
            acquireTimeout: 60000,      // 获取连接超时时间
            timeout: 60000,             // 查询超时时间
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        };
    }
}

const poolConfig = parseConnectionConfig();

// 验证必需的环境变量
if (!poolConfig.host || !poolConfig.user || !poolConfig.password || !poolConfig.database) {
    console.error('❌ 缺少必需的数据库环境变量:');
    if (!poolConfig.host) console.error('   - DB_HOST 未设置');
    if (!poolConfig.user) console.error('   - DB_USER 未设置');
    if (!poolConfig.password) console.error('   - DB_PASSWORD 未设置');
    if (!poolConfig.database) console.error('   - DB_NAME 未设置');
    console.error('💡 请检查 houduan/.env 文件配置');
    process.exit(1);
}

// 输出连接配置信息（隐藏敏感信息）
console.log('🔧 阿里云RDS连接配置:');
console.log(`   RDS地址: ${poolConfig.host}`);
console.log(`   端口: ${poolConfig.port}`);
console.log(`   用户: ${poolConfig.user ? poolConfig.user.substring(0, 3) + '***' : '❌未设置'}`);
console.log(`   密码: ${poolConfig.password ? '***已设置***' : '❌未设置'}`);
console.log(`   数据库: ${poolConfig.database}`);
console.log(`   字符集: ${poolConfig.charset}`);
console.log(`   连接池大小: ${poolConfig.connectionLimit}`);

// 创建连接池
const pool = mysql.createPool(poolConfig);

// 获取Promise版本的连接池
const promisePool = pool.promise();

/**
 * 测试数据库连接
 * 包含详细的错误诊断信息
 */
async function testConnection() {
    try {
        console.log('🔍 正在测试阿里云RDS连接...');
        const connection = await promisePool.getConnection();
        console.log('✅ 阿里云RDS连接成功');
        
        // 获取数据库版本信息
        const [rows] = await connection.execute('SELECT VERSION() as version, NOW() as current_time');
        console.log(`📊 MySQL版本: ${rows[0].version}`);
        console.log(`⏰ 服务器时间: ${rows[0].current_time}`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ 阿里云RDS连接失败:', error.message);
        console.error('错误代码:', error.code);

        // 提供针对阿里云RDS的详细错误信息和解决建议
        switch (error.code) {
            case 'ECONNREFUSED':
                console.error('💡 解决建议:');
                console.error('   1. 检查RDS实例是否正常运行');
                console.error('   2. 确认RDS内网地址是否正确');
                console.error('   3. 检查ECS与RDS是否在同一VPC');
                console.error('   4. 验证端口3306是否开放');
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.error('💡 解决建议:');
                console.error('   1. 检查数据库用户名和密码是否正确');
                console.error('   2. 确认用户是否有访问权限');
                console.error('   3. 检查RDS白名单是否包含ECS IP');
                console.error('   4. 验证用户是否允许从当前IP连接');
                break;
            case 'ER_BAD_DB_ERROR':
                console.error('💡 解决建议:');
                console.error('   1. 检查数据库名称是否存在');
                console.error('   2. 确认用户是否有访问该数据库的权限');
                console.error('   3. 尝试连接到默认数据库后创建目标数据库');
                break;
            case 'ENOTFOUND':
                console.error('💡 解决建议:');
                console.error('   1. 检查RDS内网地址是否正确');
                console.error('   2. 确认ECS网络配置');
                console.error('   3. 检查DNS解析是否正常');
                console.error('   4. 验证ECS与RDS的网络连通性');
                break;
            case 'ETIMEDOUT':
                console.error('💡 解决建议:');
                console.error('   1. 检查网络连接稳定性');
                console.error('   2. 确认RDS白名单设置');
                console.error('   3. 检查ECS安全组出站规则');
                console.error('   4. 尝试增加连接超时时间');
                break;
            default:
                console.error('💡 建议:');
                console.error('   1. 检查阿里云RDS控制台实例状态');
                console.error('   2. 查看RDS连接数是否达到上限');
                console.error('   3. 确认RDS实例规格和配置');
                console.error('   4. 联系阿里云技术支持');
        }
        
        console.error('\n🔗 相关文档:');
        console.error('   - RDS白名单设置: https://help.aliyun.com/document_detail/43185.html');
        console.error('   - ECS连接RDS: https://help.aliyun.com/document_detail/26128.html');
        
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