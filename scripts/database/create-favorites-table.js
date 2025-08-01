/**
 * 创建favorites表的Node.js脚本
 * 用于修复数据库缺失的收藏表
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../houduan/.env' });

async function createFavoritesTable() {
    console.log('🔧 开始创建favorites表...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4'
    });

    try {
        // 创建favorites表
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS favorites (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL COMMENT '用户ID',
                resource_id INT NOT NULL COMMENT '资源ID',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
                UNIQUE KEY unique_favorite (user_id, resource_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_resource (resource_id)
            ) COMMENT '用户收藏表'
        `;

        await connection.execute(createTableSQL);
        console.log('✅ favorites表创建成功！');

        // 验证表是否存在
        const [tables] = await connection.execute("SHOW TABLES LIKE 'favorites'");
        if (tables.length > 0) {
            console.log('✅ 验证通过：favorites表已存在');
            
            // 显示表结构
            const [columns] = await connection.execute('DESCRIBE favorites');
            console.log('📋 表结构：');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `(${col.Key})` : ''}`);
            });
        } else {
            console.log('❌ 验证失败：favorites表不存在');
        }

    } catch (error) {
        console.error('❌ 创建favorites表失败：', error.message);
        throw error;
    } finally {
        await connection.end();
        console.log('🔌 数据库连接已关闭');
    }
}

// 执行脚本
if (require.main === module) {
    createFavoritesTable()
        .then(() => {
            console.log('🎉 脚本执行完成！');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 脚本执行失败：', error.message);
            process.exit(1);
        });
}

module.exports = createFavoritesTable;