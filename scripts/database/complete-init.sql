-- 完整的数据库初始化脚本
-- 直接在DMS中执行

-- 创建数据库
CREATE DATABASE IF NOT EXISTS rental_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE rental_platform;

-- 用户表
CREATE TABLE users (
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
) COMMENT '用户表';

-- 分类表
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '资源分类表';

-- 资源表
CREATE TABLE resources (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) COMMENT '资源表';

-- 订单表
CREATE TABLE rental_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
    resource_id INT NOT NULL COMMENT '资源ID',
    renter_id INT NOT NULL COMMENT '租赁者ID',
    owner_id INT NOT NULL COMMENT '资源拥有者ID',
    start_date DATE NOT NULL COMMENT '租赁开始日期',
    end_date DATE NOT NULL COMMENT '租赁结束日期',
    days INT NOT NULL COMMENT '租赁天数',
    daily_price DECIMAL(10,2) NOT NULL COMMENT '日租金',
    total_price DECIMAL(10,2) NOT NULL COMMENT '总金额',
    deposit DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
    status ENUM('pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'dispute') DEFAULT 'pending' COMMENT '订单状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resource (resource_id),
    INDEX idx_renter (renter_id),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status)
) COMMENT '租赁订单表';

-- 评价表
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '评价用户ID',
    resource_id INT NOT NULL COMMENT '资源ID',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5) COMMENT '评分(1-5)',
    comment TEXT COMMENT '评价内容',
    images JSON COMMENT '评价图片',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_resource (user_id, resource_id),
    INDEX idx_resource (resource_id),
    INDEX idx_user (user_id)
) COMMENT '评价表';

-- 收藏表
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    resource_id INT NOT NULL COMMENT '资源ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY unique_favorite (user_id, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_resource (resource_id)
) COMMENT '用户收藏表';

-- 插入初始数据
INSERT INTO categories (name, description, icon, sort_order) VALUES
('电子设备', '手机、电脑、相机等电子产品', 'el-icon-mobile-phone', 1),
('家用电器', '洗衣机、冰箱、空调等家电', 'el-icon-house', 2),
('交通工具', '自行车、电动车、汽车等', 'el-icon-truck', 3),
('运动器材', '健身器材、球类、户外用品等', 'el-icon-basketball', 4),
('服装配饰', '礼服、包包、首饰等', 'el-icon-shopping-bag-1', 5),
('图书音像', '书籍、CD、DVD等', 'el-icon-reading', 6),
('工具设备', '电钻、梯子、清洁工具等', 'el-icon-setting', 7),
('其他物品', '其他闲置物品', 'el-icon-more', 8);

INSERT INTO users (username, email, password, phone, real_name) VALUES
('admin', 'admin@example.com', '$2b$10$rQZ9uAKx.Vf8vGv8vGv8vOeKKK9uAKx.Vf8vGv8vGv8vOeKKK9uAK', '13800138000', '管理员'),
('testuser', 'test@example.com', '$2b$10$rQZ9uAKx.Vf8vGv8vGv8vOeKKK9uAKx.Vf8vGv8vGv8vOeKKK9uAK', '13800138001', '测试用户');