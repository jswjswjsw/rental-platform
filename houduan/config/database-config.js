/**
 * 数据库配置切换器
 * 
 * 功能说明：
 * - 根据环境变量自动选择数据库类型
 * - 开发环境使用SQLite，生产环境使用MySQL
 * - 提供统一的数据库操作接口
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-05
 */

require('dotenv').config();

const isDevelopment = process.env.NODE_ENV === 'development';
const useMySQL = process.env.USE_MYSQL === 'true';

console.log('🔧 数据库配置选择:');
console.log(`   环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`   强制使用MySQL: ${useMySQL}`);

let database;

if (isDevelopment && !useMySQL) {
    console.log('📱 使用SQLite数据库 (开发环境)');
    database = require('./database-sqlite');
} else {
    console.log('🌐 使用MySQL数据库 (生产环境)');
    database = require('./database');
}

module.exports = database;