/**
 * 用户管理路由模块
 * 
 * 功能说明：
 * - 处理用户信息的查询、更新和管理
 * - 用户头像上传和个人资料维护
 * - 用户发布的资源和订单查询
 * - 用户统计信息和活动记录
 * 
 * 主要接口：
 * - GET /users - 获取用户列表（支持搜索分页）
 * - GET /users/:id - 获取用户详情和统计
 * - PUT /users/profile - 更新个人信息
 * - POST /users/avatar - 上传用户头像
 * - GET /users/:id/resources - 获取用户发布的资源
 * - GET /users/orders - 获取用户订单列表
 * 
 * 权限控制：
 * - 公开接口：用户列表、用户详情
 * - 认证接口：个人信息更新、头像上传、订单查询
 * - 数据隔离：用户只能修改自己的信息
 * 
 * 数据验证：
 * - 手机号：中国大陆手机号格式
 * - 真实姓名：最大50字符
 * - 头像文件：图片格式和大小限制
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const Joi = require('joi');
const { promisePool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, deleteFile } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

/**
 * 获取用户列表（分页）
 * GET /api/users
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let whereClause = '';
        let queryParams = [];

        if (search) {
            whereClause = 'WHERE username LIKE ? OR email LIKE ? OR real_name LIKE ?';
            const searchPattern = `%${search}%`;
            queryParams = [searchPattern, searchPattern, searchPattern];
        }

        // 获取总数
        const [countResult] = await promisePool.execute(
            `SELECT COUNT(*) as total FROM users ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;

        // 获取用户列表
        const [users] = await promisePool.execute(
            `SELECT id, username, email, phone, real_name, avatar, status, created_at 
             FROM users ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...queryParams, limit, offset]
        );

        res.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取当前用户发布的资源
 * GET /api/users/resources
 */
router.get('/resources', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 获取总数
        const [countResult] = await promisePool.execute(
            'SELECT COUNT(*) as total FROM resources WHERE user_id = ?',
            [userId]
        );
        const total = countResult[0].total;

        // 获取资源列表
        const [resources] = await promisePool.execute(
            `SELECT r.*, c.name as category_name
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            [userId]
        );

        res.json({
            status: 'success',
            data: {
                resources,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取用户资源错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取用户的租赁订单
 * GET /api/users/orders
 */
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const type = req.query.type || 'all'; // all, rented, owned
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let queryParams = [userId];

        if (type === 'rented') {
            whereClause = 'WHERE o.renter_id = ?';
        } else if (type === 'owned') {
            whereClause = 'WHERE o.owner_id = ?';
        } else {
            whereClause = 'WHERE (o.renter_id = ? OR o.owner_id = ?)';
            queryParams = [userId, userId];
        }

        // 获取总数
        const [countResult] = await promisePool.execute(
            `SELECT COUNT(*) as total FROM rental_orders o ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;

        // 获取订单列表
        const [orders] = await promisePool.execute(
            `SELECT o.*, r.title as resource_title, r.images as resource_images,
                    renter.username as renter_name, owner.username as owner_name
             FROM rental_orders o
             LEFT JOIN resources r ON o.resource_id = r.id
             LEFT JOIN users renter ON o.renter_id = renter.id
             LEFT JOIN users owner ON o.owner_id = owner.id
             ${whereClause}
             ORDER BY o.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            queryParams
        );

        res.json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取用户订单错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取用户详情
 * GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const [users] = await promisePool.execute(
            'SELECT id, username, email, phone, real_name, avatar, status, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        // 获取用户统计信息
        const [resourceStats] = await promisePool.execute(
            'SELECT COUNT(*) as resource_count FROM resources WHERE user_id = ?',
            [userId]
        );

        const [orderStats] = await promisePool.execute(
            'SELECT COUNT(*) as order_count FROM rental_orders WHERE renter_id = ? OR owner_id = ?',
            [userId, userId]
        );

        const [reviewStats] = await promisePool.execute(
            'SELECT AVG(r.rating) as avg_rating, COUNT(*) as review_count FROM reviews r JOIN resources res ON r.resource_id = res.id WHERE res.user_id = ?',
            [userId]
        );

        const user = users[0];
        user.stats = {
            resource_count: resourceStats[0].resource_count,
            order_count: orderStats[0].order_count,
            avg_rating: parseFloat(reviewStats[0].avg_rating) || 0,
            review_count: reviewStats[0].review_count
        };

        res.json({
            status: 'success',
            data: {
                user
            }
        });

    } catch (error) {
        console.error('获取用户详情错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 更新用户信息
 * PUT /api/users/profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().allow('')
                .messages({
                    'string.pattern.base': '手机号格式不正确'
                }),
            real_name: Joi.string().max(50).optional().allow('')
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { phone, real_name } = value;
        const userId = req.user.id;

        // 更新用户信息
        await promisePool.execute(
            'UPDATE users SET phone = ?, real_name = ? WHERE id = ?',
            [phone || null, real_name || null, userId]
        );

        // 获取更新后的用户信息
        const [users] = await promisePool.execute(
            'SELECT id, username, email, phone, real_name, avatar, status FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            status: 'success',
            message: '用户信息更新成功',
            data: {
                user: users[0]
            }
        });

    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 上传用户头像
 * POST /api/users/avatar
 */
router.post('/avatar', authenticateToken, uploadSingle('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: '请选择要上传的头像文件'
            });
        }

        const userId = req.user.id;
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        // 获取用户当前头像
        const [users] = await promisePool.execute(
            'SELECT avatar FROM users WHERE id = ?',
            [userId]
        );

        const oldAvatar = users[0]?.avatar;

        // 更新用户头像
        await promisePool.execute(
            'UPDATE users SET avatar = ? WHERE id = ?',
            [avatarPath, userId]
        );

        // 删除旧头像文件（如果不是默认头像）
        if (oldAvatar && oldAvatar !== '/default-avatar.png' && oldAvatar.startsWith('/uploads/')) {
            const oldAvatarPath = path.join(__dirname, '..', oldAvatar);
            deleteFile(oldAvatarPath);
        }

        res.json({
            status: 'success',
            message: '头像上传成功',
            data: {
                avatar: avatarPath
            }
        });

    } catch (error) {
        console.error('上传头像错误:', error);
        
        // 删除上传的文件
        if (req.file) {
            deleteFile(req.file.path);
        }

        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取用户发布的资源
 * GET /api/users/:id/resources
 */
router.get('/:id/resources', async (req, res) => {
    try {
        const userId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 获取总数
        const [countResult] = await promisePool.execute(
            'SELECT COUNT(*) as total FROM resources WHERE user_id = ?',
            [userId]
        );
        const total = countResult[0].total;

        // 获取资源列表
        const [resources] = await promisePool.execute(
            `SELECT r.*, c.name as category_name, u.username as owner_name
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        res.json({
            status: 'success',
            data: {
                resources,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取用户资源错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});



module.exports = router;