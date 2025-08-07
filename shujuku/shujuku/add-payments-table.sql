-- ==================== 支付记录表 ====================

/**
 * 支付记录表 (payments)
 * 
 * 功能说明：
 * - 记录所有支付相关的交易流水
 * - 支持租金支付、押金支付、退款等类型
 * - 集成微信支付、支付宝等第三方支付
 * - 提供完整的支付状态跟踪
 * 
 * 字段说明：
 * - id: 支付记录唯一标识
 * - order_id: 关联的订单ID
 * - payment_no: 平台支付单号，全局唯一
 * - transaction_id: 第三方支付交易号
 * - payment_type: 支付类型（rent-租金, deposit-押金, refund-退款）
 * - payment_method: 支付方式（wechat-微信, alipay-支付宝）
 * - amount: 支付金额（分）
 * - currency: 货币类型，默认CNY
 * - status: 支付状态
 * - user_id: 支付用户ID
 * - openid: 微信用户openid（微信支付时使用）
 * - prepay_id: 微信预支付ID
 * - notify_data: 支付回调原始数据
 * - remark: 支付备注
 * - paid_at: 实际支付完成时间
 * - created_at: 记录创建时间
 * - updated_at: 记录更新时间
 * 
 * 支付状态说明：
 * - pending: 待支付（已创建支付单，等待用户支付）
 * - processing: 支付处理中（用户已支付，等待确认）
 * - success: 支付成功
 * - failed: 支付失败
 * - cancelled: 支付取消
 * - refunded: 已退款
 * - partial_refunded: 部分退款
 * 
 * 索引设计：
 * - 主键索引：id
 * - 唯一索引：payment_no, transaction_id
 * - 业务索引：order_id, user_id, status, payment_type
 * - 时间索引：created_at, paid_at
 */

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
    
    -- 外键约束
    FOREIGN KEY (order_id) REFERENCES rental_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- 索引
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

-- ==================== 支付配置表 ====================

/**
 * 支付配置表 (payment_configs)
 * 
 * 功能说明：
 * - 存储各种支付方式的配置信息
 * - 支持多环境配置（开发、测试、生产）
 * - 敏感信息加密存储
 */

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
    
) COMMENT '支付配置表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入微信支付默认配置（请在生产环境中修改这些值）
-- INSERT INTO payment_configs (payment_method, config_key, config_value, environment) VALUES
-- ('wechat', 'app_id', 'your_wechat_app_id', 'development'),
-- ('wechat', 'mch_id', 'your_merchant_id', 'development'),
-- ('wechat', 'api_key', 'your_api_key', 'development'),
-- ('wechat', 'notify_url', 'https://your-domain.com/api/payments/wechat/notify', 'development');

-- 创建支付单号生成函数（可选）
DELIMITER //
CREATE FUNCTION generate_payment_no() RETURNS VARCHAR(64)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE payment_no VARCHAR(64);
    DECLARE current_time BIGINT;
    DECLARE random_num INT;
    
    SET current_time = UNIX_TIMESTAMP(NOW());
    SET random_num = FLOOR(RAND() * 999999);
    SET payment_no = CONCAT('PAY', current_time, LPAD(random_num, 6, '0'));
    
    RETURN payment_no;
END //
DELIMITER ;