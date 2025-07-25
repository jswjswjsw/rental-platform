/**
 * Railway数据库初始化脚本
 * 使用Railway提供的PostgreSQL数据库
 */

const { Client } = require('pg');
const fs = require('fs');

// Railway PostgreSQL连接配置
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@host:port/database'
});

async function initRailwayDB() {
    try {
        console.log('🚂 连接Railway数据库...');
        await client.connect();
        
        console.log('📋 创建表结构...');
        
        // 用户表
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                avatar VARCHAR(255) DEFAULT '/default-avatar.png',
                real_name VARCHAR(50),
                id_card VARCHAR(18),
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 分类表
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                description TEXT,
                icon VARCHAR(100),
                sort_order INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 资源表
        await client.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                images JSONB,
                price_per_day DECIMAL(10,2) NOT NULL,
                deposit DECIMAL(10,2) DEFAULT 0,
                location VARCHAR(200),
                contact_info VARCHAR(500),
                status VARCHAR(20) DEFAULT 'available',
                view_count INTEGER DEFAULT 0,
                rating DECIMAL(3,1) DEFAULT 0,
                review_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 订单表
        await client.query(`
            CREATE TABLE IF NOT EXISTS rental_orders (
                id SERIAL PRIMARY KEY,
                order_no VARCHAR(32) UNIQUE NOT NULL,
                resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                renter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                days INTEGER NOT NULL,
                daily_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                deposit DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT 'pending',
                remark TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 评价表
        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                images JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, resource_id)
            );
        `);
        
        console.log('📊 插入初始数据...');
        
        // 插入分类数据
        await client.query(`
            INSERT INTO categories (name, description, icon, sort_order) VALUES
            ('电子设备', '手机、电脑、相机等电子产品', 'el-icon-mobile-phone', 1),
            ('家用电器', '洗衣机、冰箱、空调等家电', 'el-icon-house', 2),
            ('交通工具', '自行车、电动车、汽车等', 'el-icon-truck', 3),
            ('运动器材', '健身器材、球类、户外用品等', 'el-icon-basketball', 4),
            ('服装配饰', '礼服、包包、首饰等', 'el-icon-shopping-bag-1', 5),
            ('图书音像', '书籍、CD、DVD等', 'el-icon-reading', 6),
            ('工具设备', '电钻、梯子、清洁工具等', 'el-icon-setting', 7),
            ('其他物品', '其他闲置物品', 'el-icon-more', 8)
            ON CONFLICT (name) DO NOTHING;
        `);
        
        // 插入测试用户
        await client.query(`
            INSERT INTO users (username, email, password, phone, real_name) VALUES
            ('admin', 'admin@example.com', '$2b$10$rQZ9uAKx.Vf8vGv8vGv8vOeKKK9uAKx.Vf8vGv8vGv8vOeKKK9uAK', '13800138000', '管理员'),
            ('testuser', 'test@example.com', '$2b$10$rQZ9uAKx.Vf8vGv8vGv8vOeKKK9uAKx.Vf8vGv8vGv8vOeKKK9uAK', '13800138001', '测试用户')
            ON CONFLICT (username) DO NOTHING;
        `);
        
        console.log('✅ Railway数据库初始化完成！');
        console.log('📋 已创建的表：');
        console.log('  - users (用户表)');
        console.log('  - categories (分类表)');
        console.log('  - resources (资源表)');
        console.log('  - rental_orders (订单表)');
        console.log('  - reviews (评价表)');
        
    } catch (error) {
        console.error('❌ 初始化失败:', error.message);
    } finally {
        await client.end();
    }
}

initRailwayDB();