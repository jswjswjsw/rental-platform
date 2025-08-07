-- 本地数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS rental_platform_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_platform_local;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 资源分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 资源表
CREATE TABLE IF NOT EXISTS resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT,
    owner_id INT NOT NULL,
    daily_price DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    location VARCHAR(200),
    images JSON,
    status ENUM('available', 'rented', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 租赁订单表
CREATE TABLE IF NOT EXISTS rental_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    resource_id INT NOT NULL,
    renter_id INT NOT NULL,
    owner_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    daily_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'ongoing', 'completed', 'cancelled') DEFAULT 'pending',
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (renter_id) REFERENCES users(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_no VARCHAR(50) UNIQUE NOT NULL,
    payment_type ENUM('rent', 'deposit') NOT NULL,
    payment_method ENUM('wechat', 'alipay', 'bank') NOT NULL,
    amount INT NOT NULL COMMENT '支付金额，单位：分',
    user_id INT NOT NULL,
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES rental_orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    UNIQUE KEY unique_favorite (user_id, resource_id)
);

-- 评价表
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES rental_orders(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_id) REFERENCES users(id)
);

-- 插入测试数据
INSERT IGNORE INTO categories (name, description) VALUES 
('电子设备', '手机、电脑、相机等电子产品'),
('家具家电', '桌椅、冰箱、洗衣机等家具家电'),
('运动器材', '健身器材、球类、户外用品等'),
('交通工具', '自行车、电动车、汽车等'),
('其他', '其他类型的闲置物品');

INSERT IGNORE INTO users (username, email, password, phone) VALUES 
('testuser', 'test@example.com', '$2b$10$hash', '13800138000'),
('demo', 'demo@example.com', '$2b$10$hash', '13900139000');

-- 创建索引
CREATE INDEX idx_resources_owner ON resources(owner_id);
CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_orders_renter ON rental_orders(renter_id);
CREATE INDEX idx_orders_owner ON rental_orders(owner_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
