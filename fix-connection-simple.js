/**
 * 简化版网络连接修复脚本
 * 专门针对阿里云RDS实例: rm-bp1sva9582w011209
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './houduan/.env' });

console.log('🔧 简化版连接修复工具启动...\n');

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    connectTimeout: 60000
};

async function fixConnection() {
    try {
        console.log('🔗 测试数据库连接...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ RDS连接成功');
        
        // 获取基本信息
        const [version] = await connection.execute('SELECT VERSION() as version');
        console.log(`📊 MySQL版本: ${version[0].version}`);
        
        // 检查并创建favorites表
        console.log('\n⭐ 检查favorites表...');
        const [tables] = await connection.execute("SHOW TABLES LIKE 'favorites'");
        
        if (tables.length === 0) {
            console.log('   正在创建favorites表...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS favorites (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL COMMENT '用户ID',
                    resource_id INT NOT NULL COMMENT '资源ID',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                    UNIQUE KEY unique_favorite (user_id, resource_id),
                    INDEX idx_user (user_id),
                    INDEX idx_resource (resource_id),
                    INDEX idx_created_at (created_at)
                ) COMMENT '用户收藏表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            `);
            console.log('✅ favorites表创建成功');
        } else {
            console.log('✅ favorites表已存在');
        }
        
        // 验证表结构
        const [columns] = await connection.execute('DESCRIBE favorites');
        console.log('📋 favorites表结构:');
        columns.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // 检查其他必需的表
        console.log('\n📊 检查其他表...');
        const [allTables] = await connection.execute('SHOW TABLES');
        const existingTables = allTables.map(table => Object.values(table)[0]);
        
        const requiredTables = ['users', 'resources', 'categories', 'orders', 'reviews'];
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        
        if (missingTables.length > 0) {
            console.log(`⚠️ 缺少表: ${missingTables.join(', ')}`);
            console.log('💡 建议: 运行完整的数据库初始化脚本');
        } else {
            console.log('✅ 所有必需的表都存在');
        }
        
        await connection.end();
        
        // 检查uploads目录
        console.log('\n📁 检查uploads目录...');
        const uploadsPath = path.join(__dirname, 'houduan', 'uploads');
        
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('✅ 创建uploads主目录');
        }
        
        const subDirs = ['avatars', 'resources'];
        subDirs.forEach(dir => {
            const subPath = path.join(uploadsPath, dir);
            if (!fs.existsSync(subPath)) {
                fs.mkdirSync(subPath, { recursive: true });
                console.log(`✅ 创建${dir}目录`);
            } else {
                console.log(`✅ ${dir}目录已存在`);
            }
        });
        
        console.log('\n🎉 所有问题修复完成！');
        console.log('\n💡 下一步操作:');
        console.log('   1. 重启后端服务: cd houduan && npm start');
        console.log('   2. 重启前端服务: cd qianduan && npm run dev');
        console.log('   3. 访问 http://localhost:8080 测试前端');
        console.log('   4. 测试用户注册、登录、收藏等功能');
        
    } catch (error) {
        console.error('❌ 修复失败:', error.message);
        console.error('错误代码:', error.code);
    }
}

fixConnection();