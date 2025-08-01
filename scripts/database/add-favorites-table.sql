-- 添加收藏表
-- 执行时间：2025-08-01
-- 用途：修复favorites表缺失问题

USE rental_platform;

-- 创建收藏表
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
) COMMENT '用户收藏表';

-- 验证表创建
SELECT 'favorites表创建完成' as message;
SHOW TABLES LIKE 'favorites';
DESCRIBE favorites;