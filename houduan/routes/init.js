/**
 * 数据库初始化路由
 * 临时接口，用于初始化Railway数据库表结构
 */

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

/**
 * 初始化数据库表结构
 */
router.post('/database', async (req, res) => {
    try {
        console.log('🔧 开始初始化数据库...');

        // 创建用户表
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
                email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
                password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
                phone VARCHAR(20) COMMENT '手机号',
                avatar VARCHAR(255) DEFAULT '/default-avatar.png' COMMENT '头像',
                real_name VARCHAR(50) COMMENT '真实姓名',
                id_card VARCHAR(18) COMMENT '身份证号',
                status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
            ) COMMENT '用户表'
        `);
        console.log('✅ 用户表创建成功');

        // 创建分类表
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL COMMENT '分类名称',
                description TEXT COMMENT '分类描述',
                icon VARCHAR(100) COMMENT '分类图标',
                sort_order INT DEFAULT 0 COMMENT '排序',
                status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
            ) COMMENT '资源分类表'
        `);
        console.log('✅ 分类表创建成功');

        // 检查是否已有分类数据
        const [existingCategories] = await promisePool.execute('SELECT COUNT(*) as count FROM categories');
        
        if (existingCategories[0].count === 0) {
            // 插入初始分类数据
            await promisePool.execute(`
                INSERT INTO categories (name, description, icon, sort_order) VALUES
                ('电子设备', '手机、电脑、相机等电子产品', 'el-icon-mobile-phone', 1),
                ('家用电器', '洗衣机、冰箱、空调等家电', 'el-icon-house', 2),
                ('交通工具', '自行车、电动车、汽车等', 'el-icon-truck', 3),
                ('运动器材', '健身器材、球类、户外用品等', 'el-icon-basketball', 4),
                ('服装配饰', '礼服、包包、首饰等', 'el-icon-shopping-bag-1', 5),
                ('图书音像', '书籍、CD、DVD等', 'el-icon-reading', 6),
                ('工具设备', '电钻、梯子、清洁工具等', 'el-icon-setting', 7),
                ('其他物品', '其他闲置物品', 'el-icon-more', 8)
            `);
            console.log('✅ 初始分类数据插入成功');
        } else {
            console.log('ℹ️ 分类数据已存在，跳过插入');
        }

        // 创建资源表
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS resources (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL COMMENT '发布用户ID',
                category_id INT NOT NULL COMMENT '分类ID',
                title VARCHAR(200) NOT NULL COMMENT '资源标题',
                description TEXT COMMENT '资源描述',
                images JSON COMMENT '资源图片(JSON数组)',
                price_per_day DECIMAL(10,2) NOT NULL COMMENT '日租金',
                deposit DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
                location VARCHAR(200) COMMENT '资源位置',
                contact_info VARCHAR(500) COMMENT '联系方式',
                status ENUM('available', 'rented', 'maintenance', 'offline') DEFAULT 'available' COMMENT '资源状态',
                view_count INT DEFAULT 0 COMMENT '浏览次数',
                rating DECIMAL(3,1) DEFAULT 0 COMMENT '平均评分',
                review_count INT DEFAULT 0 COMMENT '评价数量',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                INDEX idx_category (category_id),
                INDEX idx_user (user_id),
                INDEX idx_status (status),
                INDEX idx_rating (rating)
            ) COMMENT '资源表'
        `);
        console.log('✅ 资源表创建成功');

        console.log('🎉 数据库初始化完成！');

        res.json({
            status: 'success',
            message: '数据库初始化成功',
            data: {
                tables_created: ['users', 'categories', 'resources'],
                categories_inserted: existingCategories[0].count === 0 ? 8 : 0
            }
        });

    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        res.status(500).json({
            status: 'error',
            message: '数据库初始化失败',
            error: error.message
        });
    }
});

module.exports = router;