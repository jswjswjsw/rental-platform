/**
 * 创建支付记录表脚本
 * 在阿里云RDS上执行支付相关表的创建
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './houduan/.env' });

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    connectTimeout: 60000
};

async function createPaymentsTables() {
    try {
        console.log('🔗 连接到阿里云RDS...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 连接成功');

        // 创建支付记录表
        console.log('📊 创建支付记录表...');
        const createPaymentsTableSQL = `
            CREATE TABLE IF NOT EXISTS payments (
                id INT PRIMARY KEY AUTO_INCREMENT COMMENT '支付记录ID',
                order_id INT NOT NULL COMMENT '订单ID',
                payment_no VARCHAR(64) NOT NULL UNIQUE COMMENT '平台支付单号',
                transaction_id VARCHAR(64) COMMENT '第三方交易号',
                
                payment_type ENUM('rent', 'deposit', 'refund') NOT NULL COMMENT '支付类型',
                payment_method ENUM('wechat', 'alipay', 'bank') NOT NULL COMMENT '支付方式',
                
                amount INT NOT NULL COMMENT '支付金额（分）',
                currency VARCHAR(3) DEFAULT 'CNY' COMMENT '货币类型',
                
                status ENUM('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'partial_refunded') 
                       DEFAULT 'pending' COMMENT '支付状态',
                
                user_id INT NOT NULL COMMENT '支付用户ID',
                openid VARCHAR(128) COMMENT '微信用户openid',
                prepay_id VARCHAR(64) COMMENT '微信预支付ID',
                
                notify_data TEXT COMMENT '支付回调数据',
                remark VARCHAR(500) COMMENT '支付备注',
                
                paid_at TIMESTAMP NULL COMMENT '支付完成时间',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                
                INDEX idx_order (order_id),
                INDEX idx_user (user_id),
                INDEX idx_status (status),
                INDEX idx_payment_type (payment_type),
                INDEX idx_payment_method (payment_method),
                INDEX idx_created_at (created_at),
                INDEX idx_paid_at (paid_at),
                UNIQUE INDEX idx_payment_no (payment_no),
                INDEX idx_transaction_id (transaction_id)
                
            ) COMMENT '支付记录表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;

        await connection.execute(createPaymentsTableSQL);
        console.log('✅ payments表创建成功');

        // 创建支付配置表
        console.log('📊 创建支付配置表...');
        const createPaymentConfigsTableSQL = `
            CREATE TABLE IF NOT EXISTS payment_configs (
                id INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
                payment_method VARCHAR(20) NOT NULL COMMENT '支付方式',
                config_key VARCHAR(50) NOT NULL COMMENT '配置键',
                config_value TEXT COMMENT '配置值',
                is_encrypted BOOLEAN DEFAULT FALSE COMMENT '是否加密',
                environment ENUM('development', 'test', 'production') DEFAULT 'development' COMMENT '环境',
                status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                
                UNIQUE INDEX idx_method_key_env (payment_method, config_key, environment),
                INDEX idx_method (payment_method),
                INDEX idx_status (status)
                
            ) COMMENT '支付配置表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;

        await connection.execute(createPaymentConfigsTableSQL);
        console.log('✅ payment_configs表创建成功');

        // 插入默认配置
        console.log('📊 插入默认支付配置...');
        const insertConfigSQL = `
            INSERT IGNORE INTO payment_configs (payment_method, config_key, config_value, environment) VALUES
            ('wechat', 'app_id', 'your_wechat_app_id', 'development'),
            ('wechat', 'mch_id', 'your_merchant_id', 'development'),
            ('wechat', 'api_key', 'your_api_key', 'development'),
            ('wechat', 'notify_url', 'http://116.62.44.24:3000/api/payments/wechat/notify', 'development')
        `;

        await connection.execute(insertConfigSQL);
        console.log('✅ 默认配置插入成功');

        // 验证表创建
        console.log('🔍 验证表结构...');
        const [paymentsTables] = await connection.execute("SHOW TABLES LIKE 'payments'");
        const [configsTables] = await connection.execute("SHOW TABLES LIKE 'payment_configs'");

        if (paymentsTables.length > 0) {
            console.log('✅ payments表验证通过');
            
            // 显示表结构
            const [paymentsColumns] = await connection.execute('DESCRIBE payments');
            console.log('📋 payments表结构:');
            paymentsColumns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        }

        if (configsTables.length > 0) {
            console.log('✅ payment_configs表验证通过');
        }

        await connection.end();
        
        console.log('\n🎉 支付表创建完成！');
        console.log('💡 现在可以使用微信支付功能了');

    } catch (error) {
        console.error('❌ 创建支付表失败:', error.message);
        console.error('🔍 详细错误:', error);
    }
}

// 运行脚本
createPaymentsTables();