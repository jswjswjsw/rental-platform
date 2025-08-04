/**
 * 本地数据库设置脚本
 * 
 * 功能说明：
 * - 创建本地MySQL数据库配置
 * - 初始化必要的数据表
 * - 解决支付功能测试问题
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-04
 */

const fs = require('fs');
const path = require('path');

/**
 * 创建本地数据库配置
 */
function createLocalConfig() {
    console.log('🔧 创建本地数据库配置...');
    
    const localEnvContent = `# 本地数据库配置 - 用于开发测试
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=rental_platform_local
DB_SSL=false

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# 微信支付配置（开发环境模拟）
WECHAT_APP_ID=demo_app_id
WECHAT_MCH_ID=demo_mch_id
WECHAT_API_KEY=demo_api_key
WECHAT_NOTIFY_URL=http://localhost:3000/api/payments/wechat/notify
`;

    // 备份原配置
    const envPath = path.join(__dirname, 'houduan', '.env');
    const backupPath = path.join(__dirname, 'houduan', '.env.backup');
    
    if (fs.existsSync(envPath)) {
        fs.copyFileSync(envPath, backupPath);
        console.log('✅ 已备份原配置文件到 .env.backup');
    }
    
    // 创建本地配置
    const localEnvPath = path.join(__dirname, 'houduan', '.env.local');
    fs.writeFileSync(localEnvPath, localEnvContent);
    console.log('✅ 已创建本地配置文件 .env.local');
    
    return localEnvPath;
}

/**
 * 创建数据库初始化SQL
 */
function createInitSQL() {
    console.log('🗄️  创建数据库初始化SQL...');
    
    const initSQL = `-- 本地数据库初始化脚本
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
    real_name VARCHAR(100) COMMENT '真实姓名',
    avatar VARCHAR(255),
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) COMMENT '用户表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 资源分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '分类状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) COMMENT '资源分类表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 资源表
CREATE TABLE IF NOT EXISTS resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT,
    user_id INT NOT NULL COMMENT '资源所有者ID',
    price_per_day DECIMAL(10,2) NOT NULL COMMENT '日租金',
    deposit DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
    location VARCHAR(200),
    contact_info VARCHAR(500) COMMENT '联系方式',
    images JSON,
    status ENUM('available', 'rented', 'maintenance', 'offline') DEFAULT 'available',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) COMMENT '资源表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
    payment_no VARCHAR(64) NOT NULL UNIQUE,
    transaction_id VARCHAR(64),
    payment_type ENUM('rent', 'deposit', 'refund') NOT NULL,
    payment_method ENUM('wechat', 'alipay', 'bank') NOT NULL,
    amount INT NOT NULL COMMENT '支付金额，单位：分',
    currency VARCHAR(3) DEFAULT 'CNY' COMMENT '货币类型',
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'partial_refunded') DEFAULT 'pending',
    user_id INT NOT NULL,
    openid VARCHAR(128) COMMENT '微信用户openid',
    prepay_id VARCHAR(64) COMMENT '微信预支付ID',
    notify_data TEXT COMMENT '支付回调数据',
    remark VARCHAR(500) COMMENT '支付备注',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES rental_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_type (payment_type),
    INDEX idx_payment_method (payment_method),
    INDEX idx_created_at (created_at),
    INDEX idx_paid_at (paid_at),
    UNIQUE INDEX idx_payment_no (payment_no),
    INDEX idx_transaction_id (transaction_id)
) COMMENT '支付记录表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
`;

    const sqlPath = path.join(__dirname, 'init-local-database.sql');
    fs.writeFileSync(sqlPath, initSQL);
    console.log('✅ 已创建数据库初始化文件 init-local-database.sql');
    
    return sqlPath;
}

/**
 * 创建使用说明
 */
function createInstructions() {
    const instructions = `# 本地数据库设置说明

## 问题描述
支付按钮无响应的主要原因是阿里云RDS连接超时，导致数据库操作失败。

## 解决方案
使用本地MySQL数据库进行开发测试。

## 设置步骤

### 1. 安装MySQL
如果还没有安装MySQL，请先安装：
- 下载地址：https://dev.mysql.com/downloads/mysql/
- 或使用XAMPP：https://www.apachefriends.org/

### 2. 创建数据库
\`\`\`sql
mysql -u root -p < init-local-database.sql
\`\`\`

### 3. 使用本地配置
将 .env.local 重命名为 .env：
\`\`\`bash
cd houduan
copy .env.local .env
\`\`\`

### 4. 重启后端服务
\`\`\`bash
cd houduan
npm run dev
\`\`\`

## 配置说明
- 数据库：rental_platform_local
- 用户名：root
- 密码：请在 .env.local 中设置您的MySQL密码
- 端口：3306

### 重要：修改数据库密码
编辑 houduan/.env.local 文件，将 DB_PASSWORD 设置为您的MySQL root密码：
\`\`\`
DB_PASSWORD=your_actual_mysql_password
\`\`\`

## 恢复阿里云配置
如需恢复阿里云RDS配置：
\`\`\`bash
cd houduan
copy .env.backup .env
\`\`\`

## 测试支付功能
1. 访问 http://localhost:8080
2. 注册/登录用户
3. 创建订单
4. 点击支付按钮
5. 查看浏览器控制台和网络请求

## 常见问题
1. MySQL连接失败：检查MySQL服务是否启动
2. 数据库不存在：运行初始化SQL脚本
3. 权限问题：确保MySQL用户有足够权限
`;

    const readmePath = path.join(__dirname, 'LOCAL_DATABASE_SETUP.md');
    fs.writeFileSync(readmePath, instructions);
    console.log('✅ 已创建设置说明文件 LOCAL_DATABASE_SETUP.md');
}

/**
 * 主函数
 */
function main() {
    console.log('🚀 开始设置本地数据库...\n');
    
    try {
        createLocalConfig();
        createInitSQL();
        createInstructions();
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ 本地数据库设置完成！');
        console.log('='.repeat(50));
        console.log('📁 生成的文件：');
        console.log('  - houduan/.env.local (本地配置)');
        console.log('  - houduan/.env.backup (原配置备份)');
        console.log('  - init-local-database.sql (数据库初始化)');
        console.log('  - LOCAL_DATABASE_SETUP.md (设置说明)');
        
        console.log('\n🔧 下一步操作：');
        console.log('1. 安装并启动MySQL服务');
        console.log('2. 运行：mysql -u root -p < init-local-database.sql');
        console.log('3. 将 houduan/.env.local 重命名为 houduan/.env');
        console.log('4. 重启后端服务');
        
        console.log('\n💡 这样可以解决支付按钮无响应的问题！');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ 设置过程中发生错误:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };