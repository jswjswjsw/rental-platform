/**
 * Railway数据库初始化脚本
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    try {
        console.log('🔍 开始初始化Railway数据库...');
        
        // 从环境变量获取数据库连接信息
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        
        console.log('✅ 数据库连接成功');
        
        // 读取初始化SQL文件
        const initSqlPath = path.join(__dirname, 'shujuku', 'init.sql');
        const favoritesSqlPath = path.join(__dirname, 'add-favorites-table.sql');
        
        if (fs.existsSync(initSqlPath)) {
            const initSql = fs.readFileSync(initSqlPath, 'utf8');
            console.log('📄 执行初始化SQL...');
            await connection.query(initSql);
            console.log('✅ 初始化SQL执行成功');
        }
        
        if (fs.existsSync(favoritesSqlPath)) {
            const favoritesSql = fs.readFileSync(favoritesSqlPath, 'utf8');
            console.log('📄 执行收藏表SQL...');
            await connection.query(favoritesSql);
            console.log('✅ 收藏表SQL执行成功');
        }
        
        await connection.end();
        console.log('🎉 数据库初始化完成！');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

// 只在Railway环境中运行
if (process.env.RAILWAY_ENVIRONMENT) {
    initDatabase();
} else {
    console.log('ℹ️  非Railway环境，跳过数据库初始化');
}

module.exports = initDatabase;