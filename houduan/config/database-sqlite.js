/**
 * SQLite数据库配置模块 - 开发环境专用
 * 
 * 功能说明：
 * - 提供简单的SQLite数据库连接
 * - 用于开发和演示环境
 * - 自动创建表结构
 * - 兼容MySQL语法的基础操作
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-05
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 数据库文件路径
const dbPath = path.join(__dirname, '..', 'data', 'rental_platform.db');

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🔧 SQLite数据库配置:');
console.log(`   数据库文件: ${dbPath}`);
console.log(`   连接模式: 开发环境`);

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite连接失败:', err.message);
    } else {
        console.log('✅ SQLite数据库连接成功');
    }
});

// 初始化数据库表结构
async function initializeTables() {
    return new Promise((resolve, reject) => {
        // 用户表
        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            avatar VARCHAR(255) DEFAULT '/api/uploads/avatars/default-avatar.png',
            real_name VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;

        // 分类表
        const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            icon VARCHAR(100),
            sort_order INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;

        // 资源表
        const createResourcesTable = `
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            images TEXT,
            price_per_day DECIMAL(10,2) NOT NULL,
            deposit DECIMAL(10,2) DEFAULT 0,
            location VARCHAR(200),
            contact_info VARCHAR(500),
            status VARCHAR(20) DEFAULT 'available',
            view_count INTEGER DEFAULT 0,
            rating DECIMAL(3,1) DEFAULT 0,
            review_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )`;

        // 订单表
        const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS rental_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_no VARCHAR(32) UNIQUE NOT NULL,
            resource_id INTEGER NOT NULL,
            renter_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            days INTEGER NOT NULL,
            daily_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            deposit DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            remark TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (resource_id) REFERENCES resources(id),
            FOREIGN KEY (renter_id) REFERENCES users(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        )`;

        // 评价表
        const createReviewsTable = `
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            resource_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            images TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (resource_id) REFERENCES resources(id),
            UNIQUE(user_id, resource_id)
        )`;

        // 收藏表
        const createFavoritesTable = `
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            resource_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (resource_id) REFERENCES resources(id),
            UNIQUE(user_id, resource_id)
        )`;

        // 支付表
        const createPaymentsTable = `
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            transaction_id VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES rental_orders(id)
        )`;

        // 创建表的顺序很重要，因为有外键约束
        const tables = [
            createUsersTable,
            createCategoriesTable,
            createResourcesTable,
            createOrdersTable,
            createReviewsTable,
            createFavoritesTable,
            createPaymentsTable
        ];

        let completed = 0;
        const errors = [];

        tables.forEach((sql, index) => {
            db.run(sql, (err) => {
                if (err) {
                    errors.push(`Table ${index}: ${err.message}`);
                }
                completed++;
                
                if (completed === tables.length) {
                    if (errors.length > 0) {
                        console.error('❌ 创建表时出现错误:', errors);
                        reject(new Error(errors.join('; ')));
                    } else {
                        console.log('✅ 数据库表结构初始化完成');
                        insertDefaultData().then(resolve).catch(reject);
                    }
                }
            });
        });
    });
}

// 插入默认数据
async function insertDefaultData() {
    return new Promise((resolve, reject) => {
        // 默认分类数据
        const categories = [
            { name: '电子设备', description: '手机、电脑、平板等电子产品', icon: 'laptop' },
            { name: '家居用品', description: '家具、装饰品等家居物品', icon: 'home' },
            { name: '运动器材', description: '健身器材、球类等运动用品', icon: 'bike' },
            { name: '交通工具', description: '自行车、电动车等交通工具', icon: 'car' },
            { name: '其他', description: '其他类型的物品', icon: 'box' }
        ];

        let inserted = 0;
        categories.forEach((cat, index) => {
            db.run(
                'INSERT OR REPLACE INTO categories (id, name, description, icon, sort_order) VALUES ((SELECT id FROM categories WHERE name = ? LIMIT 1), ?, ?, ?, ?)',
                [cat.name, cat.name, cat.description, cat.icon, index + 1],
                function(err) {
                    if (err) {
                        // If the above fails, try a simple INSERT OR IGNORE
                        db.run(
                            'INSERT OR IGNORE INTO categories (name, description, icon, sort_order) VALUES (?, ?, ?, ?)',
                            [cat.name, cat.description, cat.icon, index + 1],
                            (err2) => {
                                if (err2 && !err2.message.includes('UNIQUE constraint failed')) {
                                    console.error('插入分类数据错误:', err2.message);
                                }
                                inserted++;
                                if (inserted === categories.length) {
                                    console.log('✅ 默认分类数据初始化完成');
                                    resolve();
                                }
                            }
                        );
                    } else {
                        inserted++;
                        if (inserted === categories.length) {
                            console.log('✅ 默认分类数据初始化完成');
                            resolve();
                        }
                    }
                }
            );
        });
    });
}

// Promise版本的数据库操作
const promiseDb = {
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },
    
    // 模拟MySQL的query方法
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve([rows, null]); // MySQL格式: [rows, fields]
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
                });
            }
        });
    },
    
    // 模拟MySQL的execute方法
    execute: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve([rows, null]); // MySQL格式: [rows, fields]
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve([{ insertId: this.lastID, affectedRows: this.changes }, null]);
                });
            }
        });
    }
};

// 测试数据库连接
async function testConnection() {
    try {
        console.log('🔍 正在测试SQLite连接...');
        const result = await promiseDb.get('SELECT 1 as test');
        console.log('✅ SQLite连接测试成功');
        return true;
    } catch (error) {
        console.error('❌ SQLite连接失败:', error.message);
        return false;
    }
}

// 初始化数据库
initializeTables().catch(err => {
    console.error('数据库初始化失败:', err);
});

module.exports = {
    db,
    promisePool: promiseDb, // 兼容MySQL的命名
    testConnection
};