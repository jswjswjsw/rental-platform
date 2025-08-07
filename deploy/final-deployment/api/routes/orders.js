/**
 * 租赁订单路由模块
 * 
 * 功能说明：
 * - 处理租赁订单的完整生命周期管理
 * - 订单创建、查询、状态更新和统计
 * - 时间冲突检测和业务规则验证
 * - 订单状态流转和权限控制
 * 
 * 主要接口：
 * - POST /orders - 创建租赁订单
 * - GET /orders - 获取订单列表（支持筛选）
 * - GET /orders/:id - 获取订单详情
 * - PUT /orders/:id/status - 更新订单状态
 * - GET /orders/stats - 获取订单统计信息
 * 
 * 订单状态流转：
 * - pending（待确认）-> confirmed（已确认）
 * - confirmed -> ongoing（进行中）
 * - ongoing -> completed（已完成）
 * - pending/confirmed -> cancelled（已取消）
 * - confirmed/ongoing -> dispute（争议中）
 * 
 * 业务规则：
 * - 不能租赁自己的资源
 * - 检查时间段冲突
 * - 状态转换权限控制
 * - 自动更新资源状态
 * 
 * 权限控制：
 * - 所有接口需要用户认证
 * - 订单详情只能查看相关用户
 * - 状态更新需要相应权限
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const Joi = require('joi');
const { promisePool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 生成订单号
 */
function generateOrderNo() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `RO${timestamp}${random}`;
}

/**
 * 创建租赁订单
 * POST /api/orders
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            resource_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': '资源ID必须是数字',
                    'any.required': '请选择要租赁的资源'
                }),
            start_date: Joi.date().min('now').required()
                .messages({
                    'date.min': '开始日期不能早于今天',
                    'any.required': '请选择开始日期'
                }),
            end_date: Joi.date().greater(Joi.ref('start_date')).required()
                .messages({
                    'date.greater': '结束日期必须晚于开始日期',
                    'any.required': '请选择结束日期'
                }),
            remark: Joi.string().max(500).optional().allow('')
                .messages({
                    'string.max': '备注最多500个字符'
                })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { resource_id, start_date, end_date, remark } = value;
        const renterId = req.user.id;

        // 获取资源信息
        const [resources] = await promisePool.execute(
            'SELECT * FROM resources WHERE id = ? AND status = ?',
            [resource_id, 'available']
        );

        if (resources.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '资源不存在或不可租赁'
            });
        }

        const resource = resources[0];

        // 检查是否是自己的资源
        if (resource.user_id === renterId) {
            return res.status(400).json({
                status: 'error',
                message: '不能租赁自己的资源'
            });
        }

        // 检查时间段是否有冲突
        const startDateStr = new Date(start_date).toISOString().split('T')[0];
        const endDateStr = new Date(end_date).toISOString().split('T')[0];

        const [conflictOrders] = await promisePool.execute(
            `SELECT id FROM rental_orders 
             WHERE resource_id = ? 
             AND status IN ('confirmed', 'ongoing') 
             AND NOT (end_date < ? OR start_date > ?)`,
            [resource_id, startDateStr, endDateStr]
        );

        if (conflictOrders.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: '选择的时间段已被预订'
            });
        }

        // 计算租赁天数和总价
        const startTime = new Date(start_date).getTime();
        const endTime = new Date(end_date).getTime();
        const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
        const totalPrice = days * resource.price_per_day;

        // 生成订单号
        const orderNo = generateOrderNo();

        // 创建订单
        const [result] = await promisePool.execute(
            `INSERT INTO rental_orders 
             (order_no, resource_id, renter_id, owner_id, start_date, end_date, 
              days, daily_price, total_price, deposit, remark) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNo,
                resource_id,
                renterId,
                resource.user_id,
                startDateStr,
                endDateStr,
                days,
                resource.price_per_day,
                totalPrice,
                resource.deposit,
                remark || null
            ]
        );

        // 获取创建的订单信息
        const [newOrder] = await promisePool.execute(
            `SELECT o.*, r.title as resource_title, r.images as resource_images,
                    renter.username as renter_name, owner.username as owner_name
             FROM rental_orders o
             LEFT JOIN resources r ON o.resource_id = r.id
             LEFT JOIN users renter ON o.renter_id = renter.id
             LEFT JOIN users owner ON o.owner_id = owner.id
             WHERE o.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            status: 'success',
            message: '订单创建成功',
            data: {
                order: newOrder[0]
            }
        });

    } catch (error) {
        console.error('创建订单错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取订单列表
 * GET /api/orders
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const type = req.query.type || 'all'; // all, rented, owned
        const status = req.query.status; // pending, confirmed, ongoing, completed, cancelled, dispute
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 构建查询条件
        let whereClause = '';
        let queryParams = [];

        if (type === 'rented') {
            whereClause = 'WHERE o.renter_id = ?';
            queryParams = [userId];
        } else if (type === 'owned') {
            whereClause = 'WHERE o.owner_id = ?';
            queryParams = [userId];
        } else {
            whereClause = 'WHERE (o.renter_id = ? OR o.owner_id = ?)';
            queryParams = [userId, userId];
        }

        if (status) {
            whereClause += ' AND o.status = ?';
            queryParams.push(status);
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
                    renter.username as renter_name, renter.avatar as renter_avatar,
                    owner.username as owner_name, owner.avatar as owner_avatar
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
        console.error('获取订单列表错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取订单详情
 * GET /api/orders/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const [orders] = await promisePool.execute(
            `SELECT o.*, r.title as resource_title, r.description as resource_description,
                    r.images as resource_images, r.location as resource_location,
                    renter.username as renter_name, renter.phone as renter_phone,
                    renter.avatar as renter_avatar, renter.real_name as renter_real_name,
                    owner.username as owner_name, owner.phone as owner_phone,
                    owner.avatar as owner_avatar, owner.real_name as owner_real_name
             FROM rental_orders o
             LEFT JOIN resources r ON o.resource_id = r.id
             LEFT JOIN users renter ON o.renter_id = renter.id
             LEFT JOIN users owner ON o.owner_id = owner.id
             WHERE o.id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 检查权限（只有租赁者或资源拥有者可以查看）
        if (order.renter_id !== userId && order.owner_id !== userId) {
            return res.status(403).json({
                status: 'error',
                message: '无权限查看此订单'
            });
        }

        res.json({
            status: 'success',
            data: {
                order
            }
        });

    } catch (error) {
        console.error('获取订单详情错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 更新订单状态
 * PUT /api/orders/:id/status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // 数据验证
        const schema = Joi.object({
            status: Joi.string().valid('confirmed', 'cancelled', 'ongoing', 'completed', 'dispute').required()
                .messages({
                    'any.only': '无效的订单状态',
                    'any.required': '请提供订单状态'
                }),
            remark: Joi.string().max(500).optional().allow('')
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { status, remark } = value;

        // 获取订单信息
        const [orders] = await promisePool.execute(
            'SELECT * FROM rental_orders WHERE id = ?',
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 检查权限和状态转换规则
        let canUpdate = false;
        const currentStatus = order.status;

        switch (status) {
            case 'confirmed':
                // 只有资源拥有者可以确认待处理的订单
                canUpdate = (order.owner_id === userId && currentStatus === 'pending');
                break;
            case 'cancelled':
                // 租赁者可以取消待处理的订单，双方都可以取消已确认的订单
                canUpdate = (
                    (order.renter_id === userId && ['pending', 'confirmed'].includes(currentStatus)) ||
                    (order.owner_id === userId && currentStatus === 'confirmed')
                );
                break;
            case 'ongoing':
                // 资源拥有者可以将已确认的订单标记为进行中
                canUpdate = (order.owner_id === userId && currentStatus === 'confirmed');
                break;
            case 'completed':
                // 双方都可以将进行中的订单标记为完成
                canUpdate = (
                    (order.renter_id === userId || order.owner_id === userId) && 
                    currentStatus === 'ongoing'
                );
                break;
            case 'dispute':
                // 双方都可以发起争议
                canUpdate = (
                    (order.renter_id === userId || order.owner_id === userId) && 
                    ['confirmed', 'ongoing'].includes(currentStatus)
                );
                break;
        }

        if (!canUpdate) {
            return res.status(403).json({
                status: 'error',
                message: '无权限执行此操作或状态转换不合法'
            });
        }

        // 更新订单状态
        await promisePool.execute(
            'UPDATE rental_orders SET status = ?, remark = ? WHERE id = ?',
            [status, remark || order.remark, orderId]
        );

        // 如果订单被取消或完成，更新资源状态为可用
        if (['cancelled', 'completed'].includes(status)) {
            await promisePool.execute(
                'UPDATE resources SET status = ? WHERE id = ?',
                ['available', order.resource_id]
            );
        }
        // 如果订单确认或进行中，更新资源状态为已租赁
        else if (['confirmed', 'ongoing'].includes(status)) {
            await promisePool.execute(
                'UPDATE resources SET status = ? WHERE id = ?',
                ['rented', order.resource_id]
            );
        }

        // 获取更新后的订单信息
        const [updatedOrder] = await promisePool.execute(
            `SELECT o.*, r.title as resource_title, r.images as resource_images,
                    renter.username as renter_name, owner.username as owner_name
             FROM rental_orders o
             LEFT JOIN resources r ON o.resource_id = r.id
             LEFT JOIN users renter ON o.renter_id = renter.id
             LEFT JOIN users owner ON o.owner_id = owner.id
             WHERE o.id = ?`,
            [orderId]
        );

        res.json({
            status: 'success',
            message: '订单状态更新成功',
            data: {
                order: updatedOrder[0]
            }
        });

    } catch (error) {
        console.error('更新订单状态错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取订单统计信息
 * GET /api/orders/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // 获取各种状态的订单数量
        const [stats] = await promisePool.execute(
            `SELECT 
                COUNT(CASE WHEN renter_id = ? THEN 1 END) as rented_count,
                COUNT(CASE WHEN owner_id = ? THEN 1 END) as owned_count,
                COUNT(CASE WHEN (renter_id = ? OR owner_id = ?) AND status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN (renter_id = ? OR owner_id = ?) AND status = 'ongoing' THEN 1 END) as ongoing_count,
                COUNT(CASE WHEN (renter_id = ? OR owner_id = ?) AND status = 'completed' THEN 1 END) as completed_count,
                SUM(CASE WHEN renter_id = ? AND status = 'completed' THEN total_price ELSE 0 END) as total_spent,
                SUM(CASE WHEN owner_id = ? AND status = 'completed' THEN total_price ELSE 0 END) as total_earned
             FROM rental_orders`,
            [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId]
        );

        res.json({
            status: 'success',
            data: {
                stats: stats[0]
            }
        });

    } catch (error) {
        console.error('获取订单统计错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

module.exports = router;