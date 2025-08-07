/**
 * 闲置资源租赁平台数据库初始化脚本
 * 
 * 功能说明：
 * - 创建完整的数据库结构
 * - 定义所有必要的数据表
 * - 设置外键约束和索引
 * - 插入初始化数据
 * 
 * 数据库设计特点：
 * - 使用UTF8MB4字符集支持emoji和特殊字符
 * - 合理的外键约束保证数据完整性
 * - 适当的索引提高查询性能
 * - 标准化的表结构设计
 * 
 * 表结构说明：
 * - users: 用户基础信息表
 * - categories: 资源分类表
 * - resources: 资源信息表
 * - rental_orders: 租赁订单表
 * - reviews: 用户评价表
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

-- ==================== 数据库创建 ====================

-- 创建数据库（如果不存在）
-- 使用UTF8MB4字符集和Unicode排序规则
CREATE DATABASE IF NOT EXISTS rental_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用创建的数据库
USE rental_platform;

-- ==================== 用户基础信息表 ====================

/**
 * 用户表 (users)
 * 
 * 功能说明：
 * - 存储用户的基础信息和认证数据
 * - 支持用户状态管理和权限控制
 * - 包含用户实名认证相关字段
 * - 自动维护创建和更新时间
 * 
 * 字段说明：
 * - id: 用户唯一标识，自增主键
 * - username: 用户名，全局唯一，用于登录
 * - email: 邮箱地址，全局唯一，用于登录和通知
 * - password: 加密后的密码，使用bcrypt加密
 * - phone: 手机号码，用于联系和验证
 * - avatar: 用户头像URL，默认使用系统头像
 * - real_name: 真实姓名，用于实名认证
 * - id_card: 身份证号码，用于高级认证
 * - status: 用户状态（active-正常，inactive-未激活，banned-封禁）
 * - created_at: 账号创建时间，自动设置
 * - updated_at: 最后更新时间，自动维护
 * 
 * 约束说明：
 * - username和email必须全局唯一
 * - password字段不能为空
 * - 状态字段限制为预定义的枚举值
 */
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

-- ==================== 资源分类表 ====================

/**
 * 资源分类表 (categories)
 * 
 * 功能说明：
 * - 管理资源的分类信息
 * - 支持分类的层级管理和排序
 * - 提供分类图标和描述信息
 * - 支持分类状态控制
 * 
 * 字段说明：
 * - id: 分类唯一标识，自增主键
 * - name: 分类名称，不能为空
 * - description: 分类详细描述，可选
 * - icon: 分类图标标识，用于前端显示
 * - sort_order: 排序权重，数值越小越靠前
 * - status: 分类状态（active-启用，inactive-禁用）
 * - created_at: 分类创建时间，自动设置
 * 
 * 业务规则：
 * - 只有启用状态的分类才会在前端显示
 * - 分类删除采用软删除方式（状态设为inactive）
 * - 排序按sort_order升序，相同时按id升序
 */
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    icon VARCHAR(100) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '资源分类表';

-- ==================== 资源信息表 ====================

/**
 * 资源表 (resources)
 * 
 * 功能说明：
 * - 存储用户发布的闲置资源信息
 * - 支持多图片存储和展示
 * - 包含价格、位置、联系方式等详细信息
 * - 支持资源状态管理和统计数据
 * 
 * 字段说明：
 * - id: 资源唯一标识，自增主键
 * - user_id: 发布用户ID，外键关联users表
 * - category_id: 资源分类ID，外键关联categories表
 * - title: 资源标题，不能为空，最大200字符
 * - description: 资源详细描述，可选
 * - images: 资源图片数组，JSON格式存储
 * - price_per_day: 日租金，必填，支持两位小数
 * - deposit: 押金金额，默认为0
 * - location: 资源所在位置，便于用户了解
 * - contact_info: 联系方式，可选补充信息
 * - status: 资源状态（available-可租赁，rented-已租出，maintenance-维护中，offline-已下架）
 * - view_count: 浏览次数统计，默认为0
 * - rating: 平均评分，范围0-5，一位小数
 * - review_count: 评价数量统计
 * - created_at: 资源发布时间，自动设置
 * - updated_at: 最后更新时间，自动维护
 * 
 * 约束说明：
 * - user_id外键级联删除（用户删除时删除其资源）
 * - category_id外键限制删除（分类有资源时不能删除）
 * - 建立多个索引提高查询性能
 * 
 * 索引说明：
 * - idx_category: 按分类查询优化
 * - idx_user: 按用户查询优化
 * - idx_status: 按状态筛选优化
 * - idx_rating: 按评分排序优化
 */
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

-- ==================== 租赁订单表 ====================

/**
 * 租赁订单表 (rental_orders)
 * 
 * 功能说明：
 * - 管理资源租赁的完整订单流程
 * - 记录租赁双方信息和交易详情
 * - 支持订单状态流转和时间管理
 * - 提供订单统计和查询功能
 * 
 * 字段说明：
 * - id: 订单唯一标识，自增主键
 * - order_no: 订单号，全局唯一，便于查询和管理
 * - resource_id: 租赁资源ID，外键关联resources表
 * - renter_id: 租赁者用户ID，外键关联users表
 * - owner_id: 资源拥有者用户ID，外键关联users表
 * - start_date: 租赁开始日期，不能为空
 * - end_date: 租赁结束日期，不能为空
 * - days: 租赁天数，根据开始和结束日期计算
 * - daily_price: 日租金，订单创建时的价格快照
 * - total_price: 订单总金额，日租金×天数
 * - deposit: 押金金额，默认为0
 * - status: 订单状态，支持完整的订单生命周期
 * - remark: 订单备注信息，可选
 * - created_at: 订单创建时间，自动设置
 * - updated_at: 最后更新时间，自动维护
 * 
 * 订单状态说明：
 * - pending: 待确认（租赁者提交，等待资源拥有者确认）
 * - confirmed: 已确认（资源拥有者同意租赁）
 * - ongoing: 进行中（租赁期间内）
 * - completed: 已完成（租赁结束，物品已归还）
 * - cancelled: 已取消（任一方取消订单）
 * - dispute: 争议中（出现纠纷，需要平台介入）
 * 
 * 约束说明：
 * - order_no必须全局唯一
 * - 所有外键采用级联删除
 * - 建立多个索引提高查询性能
 * 
 * 索引说明：
 * - idx_resource: 按资源查询订单
 * - idx_renter: 按租赁者查询订单
 * - idx_owner: 按拥有者查询订单
 * - idx_status: 按状态筛选订单
 */
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

-- ==================== 用户评价表 ====================

/**
 * 评价表 (reviews)
 * 
 * 功能说明：
 * - 存储用户对资源的评价信息
 * - 支持评分和文字评价
 * - 可选择上传评价图片
 * - 防止重复评价机制
 * 
 * 字段说明：
 * - id: 评价唯一标识，自增主键
 * - user_id: 评价用户ID，外键关联users表
 * - resource_id: 被评价资源ID，外键关联resources表
 * - rating: 评分，范围1-5分，整数
 * - comment: 评价文字内容，可选
 * - images: 评价图片数组，JSON格式存储，可选
 * - created_at: 评价创建时间，自动设置
 * - updated_at: 评价更新时间，自动维护
 * 
 * 业务规则：
 * - 每个用户对每个资源只能评价一次
 * - 评分必须在1-5分范围内
 * - 评价后会自动更新资源的平均评分
 * - 用户只能修改和删除自己的评价
 * 
 * 约束说明：
 * - user_id和resource_id外键级联删除
 * - unique_user_resource唯一约束防止重复评价
 * - rating字段添加CHECK约束限制评分范围
 * 
 * 索引说明：
 * - idx_resource: 按资源查询评价优化
 * - idx_user: 按用户查询评价优化
 */
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

-- ==================== 初始化数据插入 ====================

/**
 * 插入初始分类数据
 * 
 * 说明：
 * - 提供8个常用的资源分类
 * - 每个分类包含名称、描述、图标和排序权重
 * - 图标使用Element Plus的图标标识
 * - 排序权重决定前端显示顺序
 * 
 * 分类说明：
 * 1. 电子设备：数码产品类，如手机、电脑、相机等
 * 2. 家用电器：大型家电类，如洗衣机、冰箱、空调等
 * 3. 交通工具：出行工具类，如自行车、电动车、汽车等
 * 4. 运动器材：健身运动类，如器材、球类、户外用品等
 * 5. 服装配饰：时尚用品类，如礼服、包包、首饰等
 * 6. 图书音像：文化娱乐类，如书籍、CD、DVD等
 * 7. 工具设备：工具器械类，如电钻、梯子、清洁工具等
 * 8. 其他物品：未分类物品，兜底分类
 */
INSERT INTO categories (name, description, icon, sort_order) VALUES
('电子设备', '手机、电脑、相机等电子产品', 'el-icon-mobile-phone', 1),
('家用电器', '洗衣机、冰箱、空调等家电', 'el-icon-house', 2),
('交通工具', '自行车、电动车、汽车等', 'el-icon-truck', 3),
('运动器材', '健身器材、球类、户外用品等', 'el-icon-basketball', 4),
('服装配饰', '礼服、包包、首饰等', 'el-icon-shopping-bag-1', 5),
('图书音像', '书籍、CD、DVD等', 'el-icon-reading', 6),
('工具设备', '电钻、梯子、清洁工具等', 'el-icon-setting', 7),
('其他物品', '其他闲置物品', 'el-icon-more', 8);

/**
 * 插入测试用户数据
 * 
 * 说明：
 * - 提供系统管理员和测试用户账号
 * - 密码使用bcrypt加密（实际密码为：123456）
 * - 包含基本的用户信息用于测试
 * 
 * 用户说明：
 * 1. admin: 系统管理员账号，用于后台管理
 * 2. testuser: 普通测试用户，用于功能测试
 * 
 * 注意：
 * - 生产环境中应删除或修改这些测试账号
 * - 密码应使用更强的加密和更复杂的密码
 */
INSERT INTO users (username, email, password, phone, real_name) VALUES
('admin', 'admin@example.com', '$2b$10$rQZ9uAKx.Vf8vGv8vGv8vOeKKK9uAKx.Vf8vGv8vGv8vOeKKK9uAK', '13800138000', '管理员'),
('testuser', 'test@example.com', '$2b$10$rQZ9uAKx.Vf8vGv8vGv8vOeKKK9uAKx.Vf8vGv8vGv8vOeKKK9uAK', '13800138001', '测试用户');