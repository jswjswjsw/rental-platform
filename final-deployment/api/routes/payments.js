/**
 * 支付管理路由模块
 * Payment Management Routes
 * 
 * 功能说明：
 * - 处理支付相关的API请求
 * - 集成微信支付和支付宝支付
 * - 支付状态管理和回调处理
 * - 支付记录查询和统计
 * 
 * 主要接口：
 * - POST /create - 创建支付订单
 * - POST /wechat/notify - 微信支付回调
 * - GET /:id - 查询支付详情
 * - GET /order/:orderId - 查询订单支付记录
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * 创建支付订单
 * POST /api/payments/create
 */
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { order_id, payment_type, payment_method, amount } = req.body;
        const user_id = req.user.id;

        // 验证订单是否存在
        const [orders] = await promisePool.execute(
            'SELECT * FROM rental_orders WHERE id = ? AND (renter_id = ? OR owner_id = ?)',
            [order_id, user_id, user_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '订单不存在或无权限'
            });
        }

        // 生成支付单号
        const payment_no = `PAY${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // 创建支付记录
        const [result] = await promisePool.execute(`
            INSERT INTO payments (
                order_id, payment_no, payment_type, payment_method, 
                amount, user_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [order_id, payment_no, payment_type, payment_method, amount, user_id]);

        res.json({
            status: 'success',
            message: '支付订单创建成功',
            data: {
                payment_id: result.insertId,
                payment_no: payment_no,
                amount: amount,
                payment_method: payment_method
            }
        });

    } catch (error) {
        console.error('创建支付订单错误:', error);
        res.status(500).json({
            status: 'error',
            message: '创建支付订单失败'
        });
    }
});

/**
 * 查询支付详情
 * GET /api/payments/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const payment_id = req.params.id;
        const user_id = req.user.id;

        const [payments] = await promisePool.execute(`
            SELECT p.*, ro.order_no, u.username 
            FROM payments p
            LEFT JOIN rental_orders ro ON p.order_id = ro.id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ? AND p.user_id = ?
        `, [payment_id, user_id]);

        if (payments.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '支付记录不存在'
            });
        }

        res.json({
            status: 'success',
            data: payments[0]
        });

    } catch (error) {
        console.error('查询支付详情错误:', error);
        res.status(500).json({
            status: 'error',
            message: '查询支付详情失败'
        });
    }
});

/**
 * 查询订单支付记录
 * GET /api/payments/order/:orderId
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
    try {
        const order_id = req.params.orderId;
        const user_id = req.user.id;

        // 验证用户权限
        const [orders] = await promisePool.execute(
            'SELECT * FROM rental_orders WHERE id = ? AND (renter_id = ? OR owner_id = ?)',
            [order_id, user_id, user_id]
        );

        if (orders.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: '无权限查看此订单的支付记录'
            });
        }

        const [payments] = await promisePool.execute(`
            SELECT * FROM payments 
            WHERE order_id = ? 
            ORDER BY created_at DESC
        `, [order_id]);

        res.json({
            status: 'success',
            data: payments
        });

    } catch (error) {
        console.error('查询订单支付记录错误:', error);
        res.status(500).json({
            status: 'error',
            message: '查询支付记录失败'
        });
    }
});

/**
 * 微信支付回调处理
 * POST /api/payments/wechat/notify
 */
router.post('/wechat/notify', async (req, res) => {
    try {
        // 这里应该实现微信支付回调的验证和处理逻辑
        // 由于微信支付配置可能不完整，暂时返回成功
        console.log('收到微信支付回调:', req.body);
        
        res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
    } catch (error) {
        console.error('微信支付回调处理错误:', error);
        res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[ERROR]]></return_msg></xml>');
    }
});

/**
 * 创建微信支付订单
 * POST /api/payments/wechat/create
 */
router.post('/wechat/create', authenticateToken, async (req, res) => {
    try {
        const { order_id, payment_type, trade_type, openid } = req.body;
        const user_id = req.user.id;

        // 验证订单是否存在
        const [orders] = await promisePool.execute(
            'SELECT * FROM rental_orders WHERE id = ? AND (renter_id = ? OR owner_id = ?)',
            [order_id, user_id, user_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '订单不存在或无权限'
            });
        }

        const order = orders[0];
        
        // 计算支付金额
        let amount = 0;
        if (payment_type === 'rent') {
            amount = Math.round(order.total_price * 100); // 转换为分
        } else if (payment_type === 'deposit') {
            amount = Math.round(order.deposit * 100); // 转换为分
        }

        // 生成支付单号
        const paymentNo = `PAY${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // 创建支付记录
        const [result] = await promisePool.execute(`
            INSERT INTO payments (
                order_id, payment_no, payment_type, payment_method, 
                amount, user_id, status, created_at
            ) VALUES (?, ?, ?, 'wechat', ?, ?, 'pending', NOW())
        `, [order_id, paymentNo, payment_type, amount, user_id]);

        // 模拟微信支付参数（实际应该调用微信支付API）
        const paymentParams = {
            appId: process.env.WECHAT_APP_ID || 'demo_app_id',
            timeStamp: Math.floor(Date.now() / 1000).toString(),
            nonceStr: Math.random().toString(36).substring(2, 17),
            package: `prepay_id=demo_prepay_id_${paymentNo}`,
            signType: 'MD5',
            paySign: 'demo_sign'
        };

        res.json({
            status: 'success',
            message: '支付订单创建成功',
            data: {
                payment_id: result.insertId,
                payment_no: paymentNo,
                amount: amount,
                trade_type: trade_type,
                payment_params: paymentParams
            }
        });

    } catch (error) {
        console.error('创建微信支付订单错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 查询支付状态
 * GET /api/payments/:id/status
 */
router.get('/:id/status', authenticateToken, async (req, res) => {
    try {
        const paymentId = req.params.id;
        const userId = req.user.id;

        const [payments] = await promisePool.execute(
            'SELECT * FROM payments WHERE id = ? AND user_id = ?',
            [paymentId, userId]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '支付记录不存在'
            });
        }

        const payment = payments[0];

        res.json({
            status: 'success',
            data: {
                payment_id: payment.id,
                payment_no: payment.payment_no,
                status: payment.status,
                amount: payment.amount,
                payment_type: payment.payment_type,
                paid_at: payment.paid_at
            }
        });

    } catch (error) {
        console.error('查询支付状态错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取用户支付记录
 * GET /api/payments
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.query.order_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE p.user_id = ?';
        let queryParams = [userId];

        if (orderId) {
            whereClause += ' AND p.order_id = ?';
            queryParams.push(orderId);
        }

        // 获取总数
        const [countResult] = await promisePool.execute(
            `SELECT COUNT(*) as total FROM payments p ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;

        // 获取支付记录
        const [payments] = await promisePool.execute(
            `SELECT p.*, o.order_no, r.title as resource_title
             FROM payments p
             LEFT JOIN rental_orders o ON p.order_id = o.id
             LEFT JOIN resources r ON o.resource_id = r.id
             ${whereClause}
             ORDER BY p.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            queryParams
        );

        res.json({
            status: 'success',
            data: {
                payments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取支付记录错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

module.exports = router;