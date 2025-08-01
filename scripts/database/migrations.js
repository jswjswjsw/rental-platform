/**
 * 数据库迁移管理系统
 * 用于管理数据库结构变更，确保所有环境数据库结构一致
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '../../houduan/.env' });

class DatabaseMigration {
    constructor() {
        this.connection = null;
        this.migrations = [
            {
                version: '001',
                name: 'create_favorites_table',
                description: '创建用户收藏表',
                sql: `
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
                `
            }
            // 未来可以在这里添加更多迁移
        ];
    }

    async connect() {
        this.connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            charset: 'utf8mb4'
        });
        console.log('✅ 数据库连接成功');
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 数据库连接已关闭');
        }
    }

    async createMigrationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                version VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_version (version)
            ) COMMENT '数据库迁移记录表'
        `;
        
        await this.connection.execute(sql);
        console.log('📋 迁移记录表已准备就绪');
    }

    async getExecutedMigrations() {
        try {
            const [rows] = await this.connection.execute(
                'SELECT version FROM migrations ORDER BY version'
            );
            return rows.map(row => row.version);
        } catch (error) {
            // 如果migrations表不存在，返回空数组
            return [];
        }
    }

    async executeMigration(migration) {
        console.log(`🔧 执行迁移: ${migration.version} - ${migration.name}`);
        
        try {
            // 执行迁移SQL
            await this.connection.execute(migration.sql);
            
            // 记录迁移执行
            await this.connection.execute(
                'INSERT INTO migrations (version, name, description) VALUES (?, ?, ?)',
                [migration.version, migration.name, migration.description]
            );
            
            console.log(`✅ 迁移 ${migration.version} 执行成功`);
        } catch (error) {
            console.error(`❌ 迁移 ${migration.version} 执行失败:`, error.message);
            throw error;
        }
    }

    async runMigrations() {
        console.log('🚀 开始执行数据库迁移...');
        
        await this.createMigrationsTable();
        const executedMigrations = await this.getExecutedMigrations();
        
        let executedCount = 0;
        
        for (const migration of this.migrations) {
            if (!executedMigrations.includes(migration.version)) {
                await this.executeMigration(migration);
                executedCount++;
            } else {
                console.log(`⏭️  跳过已执行的迁移: ${migration.version} - ${migration.name}`);
            }
        }
        
        if (executedCount === 0) {
            console.log('✨ 所有迁移都已是最新状态');
        } else {
            console.log(`🎉 成功执行了 ${executedCount} 个迁移`);
        }
    }

    async checkDatabaseStatus() {
        console.log('🔍 检查数据库状态...');
        
        // 检查所有必需的表
        const requiredTables = ['users', 'categories', 'resources', 'rental_orders', 'reviews', 'favorites'];
        const [tables] = await this.connection.execute('SHOW TABLES');
        const existingTables = tables.map(row => Object.values(row)[0]);
        
        console.log('📋 现有表:', existingTables.join(', '));
        
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        
        if (missingTables.length > 0) {
            console.log('⚠️  缺失的表:', missingTables.join(', '));
            return false;
        } else {
            console.log('✅ 所有必需的表都存在');
            return true;
        }
    }
}

// 主执行函数
async function main() {
    const migration = new DatabaseMigration();
    
    try {
        await migration.connect();
        await migration.checkDatabaseStatus();
        await migration.runMigrations();
        await migration.checkDatabaseStatus();
    } catch (error) {
        console.error('💥 迁移执行失败:', error.message);
        process.exit(1);
    } finally {
        await migration.disconnect();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => {
            console.log('🎉 数据库迁移完成！');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 迁移失败:', error.message);
            process.exit(1);
        });
}

module.exports = DatabaseMigration;