/**
 * JWT认证中间件模块
 * 
 * 功能说明：
 * - 验证JWT Token的有效性
 * - 检查用户身份和账号状态
 * - 提供可选认证和权限检查
 * - 统一的错误处理和响应格式
 * 
 * 中间件类型：
 * - authenticateToken: 强制认证中间件
 * - optionalAuth: 可选认证中间件
 * - checkResourceOwnership: 资源所有权检查
 * 
 * 安全特性：
 * - Token过期检测
 * - 用户状态验证
 * - 权限级别控制
 * - 错误信息标准化
 * 
 * 依赖模块：
 * - jsonwebtoken: JWT处理
 * - database: 用户信息查询
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');

/**
 * 验证JWT token中间件
 */
const authenticateToken = async (req, res, next) => {
    try {
        // 验证JWT_SECRET是否配置
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET未配置');
            return res.status(500).json({
                status: 'error',
                message: '服务器配置错误'
            });
        }

        // 从请求头获取token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: '访问被拒绝，需要提供token'
            });
        }

        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 查询用户信息
        const [users] = await promisePool.execute(
            'SELECT id, username, email, status FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        const user = users[0];

        // 检查用户状态
        if (user.status !== 'active') {
            return res.status(401).json({
                status: 'error',
                message: '用户账号已被禁用'
            });
        }

        // 将用户信息添加到请求对象
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: '无效的token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'token已过期，请重新登录'
            });
        }

        console.error('认证中间件错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
};

/**
 * 可选的认证中间件（不强制要求登录）
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [users] = await promisePool.execute(
                'SELECT id, username, email, status FROM users WHERE id = ?',
                [decoded.userId]
            );

            if (users.length > 0 && users[0].status === 'active') {
                req.user = users[0];
            }
        }

        next();
    } catch (error) {
        // 可选认证失败时不返回错误，继续执行
        next();
    }
};

/**
 * 检查资源所有权中间件
 */
const checkResourceOwnership = async (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.id;

        const [resources] = await promisePool.execute(
            'SELECT user_id FROM resources WHERE id = ?',
            [resourceId]
        );

        if (resources.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '资源不存在'
            });
        }

        if (resources[0].user_id !== userId) {
            return res.status(403).json({
                status: 'error',
                message: '无权限操作此资源'
            });
        }

        next();
    } catch (error) {
        console.error('权限检查错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    checkResourceOwnership
};