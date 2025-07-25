/**
 * 阿里云RDS数据库初始化脚本
 * 
 * 功能：
 * - 连接到阿里云RDS MySQL实例
 * - 执行数据库初始化SQL脚本
 * - 创建表结构和初始数据
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: './houduan/.env' });

async function initDatabase() {
    let connection;
    
    try {
        console.log('🔄 正在连接阿里云RDS...');
        
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            charset: 'utf8mb4',
            multipleStatements: true // 允许执行多条SQL语句
        });
        
        console.log('✅ RDS连接成功');
        
        // 读取初始化SQL脚本
        const sqlPath = path.join(__dirname, 'shujuku', 'init.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('🔄 正在执行数据库初始化脚本...');
        
        // 执行SQL脚本
        await connection.execute(sqlContent);
        
        console.log('✅ 数据库初始化完成！');
        console.log('📋 已创建的表：');
        console.log('  - users (用户表)');
        console.log('  - categories (分类表)');
        console.log('  - resources (资源表)');
        console.log('  - rental_orders (订单表)');
        console.log('  - reviews (评价表)');
        console.log('📊 已插入初始数据：');
        console.log('  - 8个资源分类');
        console.log('  - 2个测试用户');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.error('💡 请检查RDS地址是否正确');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 请检查用户名和密码是否正确');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 请检查安全组是否允许访问3306端口');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 数据库连接已关闭');
        }
    }
}

// 运行初始化
initDatabase();