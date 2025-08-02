/**
 * 支付路由模块
 * 
 * 功能说明：
 * - 处理微信支付相关的所有接口
 * - 支持JSAPI支付（公众号/小程序）
 * - 支持H5支付（移动端网页）
 * - 处理支付回调和状态更新
 * 
 * 主要接口：
 * - POST /payments/wechat/create - 创建微信支付订单
 * - POST /payments/wechat/notify - 微信支付回调
 * - GET /payments/:id/status - 查询支付状态
 * - POST /payments/:id/refund - 申请退款
 * 
 * 支付流程：
 * 1. 用户选择支付方式，调用创建支付接口
 * 2. 后端调用微信统一下单API
 * 3. 返回支付参数给前端
 * 4. 前端调用微信支付SDK
 * 5. 微信回调通知支付结果
 * 6. 更新订单和支付状态
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-02
 */

const express = require('express');
const Joi = require('joi');
const { promisePool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const {
    unifiedOrder,
    generateJSAPIPayParams,
    queryOrder,
    verifyNotifySign,
    objectToXml,
    xmlToObject
} = require('../config/wechat-pay');

const router = express.Router();

/**
 * 生成支付单号
 */
function generatePaymentNo() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `PAY${timestamp}${random}`;
}

/**
 * 创建微信支付订单
 * POST /api/payments/wechat/create
 */
router.post('/wechat/create', authenticateToken, async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            order_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': '订单ID必须是数字',
                    'any.required': '请提供订单ID'
                }),
            payment_type: Joi.string().valid('rent', 'deposit').required()
                .messages({
                    'any.only': '支付类型只能是rent或deposit',
                    'any.required': '请选择支付类型'
                }),
            openid: Joi.string().optional()
                .messages({
                    'string.base': 'OpenID格式不正确'
                }),
            trade_type: Joi.string().valid('JSAPI', 'H5').default('JSAPI')
                .messages({
                    'any.only': '交易类型只能是JSAPI或H5'
                })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { order_id, payment_type, openid, trade_type } = value;
        const userId = req.user.id;

        // 获取订单信息
        const [orders] = await promisePool.execute(
            `SELECT o.*, r.title as resource_title 
             FROM rental_orders o 
             LEFT JOIN resources r ON o.resource_id = r.id 
             WHERE o.id = ?`,
            [order_id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '订单不存在'
            });
        }

        const order = orders[0];

        // 检查权限（只有租赁者可以支付）
        if (order.renter_id !== userId) {
            return res.status(403).json({
                status: 'error',
                message: '无权限支付此订单'
            });
        }

        // 检查订单状态
        if (order.status !== 'pending') {
            return res.status(400).json({
                status: 'error',
                message: '订单状态不允许支付'
            });
        }

        // 计算支付金额
        let amount = 0;
        let description = '';
        
        if (payment_type === 'rent') {
            amount = Math.round(order.total_price * 100); // 转换为分
            description = `租赁费用-${order.resource_title}`;
        } else if (payment_type === 'deposit') {
            amount = Math.round(order.deposit * 100); // 转换为分
            description = `押金-${order.resource_title}`;
        }

        if (amount <= 0) {
            return res.status(400).json({
                status: 'error',
                message: '支付金额不能为0'
            });
        }

        // 检查是否已有待支付的记录
        const [existingPayments] = await promisePool.execute(
            'SELECT id FROM payments WHERE order_id = ? AND payment_type = ? AND status = ?',
            [order_id, payment_type, 'pending']
        );

        if (existingPayments.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: '已有待支付的订单，请勿重复创建'
            });
        }

        // 生成支付单号
        const paymentNo = generatePaymentNo();

        // 获取用户IP
        const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

        // 调用微信统一下单
        const wechatOrderResult = await unifiedOrder({
            outTradeNo: paymentNo,
            totalFee: amount,
            body: description,
            tradeType: trade_type,
            openid: openid,
            spbillCreateIp: clientIp
        });

        if (!wechatOrderResult.success) {
            return res.status(400).json({
                status: 'error',
                message: `微信支付创建失败: ${wechatOrderResult.error}`
            });
        }

        // 保存支付记录
        const [paymentResult] = await promisePool.execute(
            `INSERT INTO payments 
             (order_id, payment_no, payment_type, payment_method, amount, user_id, openid, prepay_id, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                order_id,
                paymentNo,
                payment_type,
                'wechat',
                amount,
                userId,
                openid || null,
                wechatOrderResult.data.prepay_id,
                'pending'
            ]
        );

        // 生成前端支付参数
        let paymentParams = {};
        
        if (trade_type === 'JSAPI') {
            paymentParams = generateJSAPIPayParams(wechatOrderResult.data.prepay_id);
        } else if (trade_type === 'H5') {
            paymentParams = {
                mweb_url: wechatOrderResult.data.mweb_url
            };
        }

        res.json({
            status: 'success',
            message: '支付订单创建成功',
            data: {
                payment_id: paymentResult.insertId,
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
 * 微信支付回调
 * POST /api/payments/wechat/notify
 */
router.post('/wechat/notify', async (req, res) => {
    try {
        // 解析XML数据
        const notifyData = await xmlToObject(req.body);
        
        console.log('收到微信支付回调:', notifyData);

        // 验证签名
        if (!verifyNotifySign(notifyData)) {
            console.error('微信支付回调签名验证失败');
            return res.send(objectToXml({
                return_code: 'FAIL',
                return_msg: '签名验证失败'
            }));
        }

        // 检查支付结果
        if (notifyData.return_code !== 'SUCCESS' || notifyData.result_code !== 'SUCCESS') {
            console.error('微信支付失败:', notifyData);
            return res.send(objectToXml({
                return_code: 'SUCCESS',
                return_msg: 'OK'
            }));
        }

        const {
            out_trade_no: paymentNo,
            transaction_id: transactionId,
            total_fee: totalFee,
            time_end: timeEnd
        } = notifyData;

        // 查找支付记录
        const [payments] = await promisePool.execute(
            'SELECT * FROM payments WHERE payment_no = ?',
            [paymentNo]
        );

        if (payments.length === 0) {
            console.error('支付记录不存在:', paymentNo);
            return res.send(objectToXml({
                return_code: 'FAIL',
                return_msg: '支付记录不存在'
            }));
        }

        const payment = payments[0];

        // 检查金额是否一致
        if (parseInt(totalFee) !== payment.amount) {
            console.error('支付金额不一致:', totalFee, payment.amount);
            return res.send(objectToXml({
                return_code: 'FAIL',
                return_msg: '支付金额不一致'
            }));
        }

        // 如果已经处理过，直接返回成功
        if (payment.status === 'success') {
            return res.send(objectToXml({
                return_code: 'SUCCESS',
                return_msg: 'OK'
            }));
        }

        // 解析支付时间
        const paidAt = new Date(
            timeEnd.substr(0, 4) + '-' +
            timeEnd.substr(4, 2) + '-' +
            timeEnd.substr(6, 2) + ' ' +
            timeEnd.substr(8, 2) + ':' +
            timeEnd.substr(10, 2) + ':' +
            timeEnd.substr(12, 2)
        );

        // 更新支付记录
        await promisePool.execute(
            `UPDATE payments 
             SET status = ?, transaction_id = ?, notify_data = ?, paid_at = ? 
             WHERE id = ?`,
            [
                'success',
                transactionId,
                JSON.stringify(notifyData),
                paidAt,
                payment.id
            ]
        );

        // 检查订单是否所有必需的支付都完成了
        const [orderPayments] = await promisePool.execute(
            `SELECT payment_type, status FROM payments 
             WHERE order_id = ? AND payment_type IN ('rent', 'deposit')`,
            [payment.order_id]
        );

        const rentPaid = orderPayments.some(p => p.payment_type === 'rent' && p.status === 'success');
        const depositPaid = orderPayments.some(p => p.payment_type === 'deposit' && p.status === 'success');

        // 如果租金和押金都支付完成，更新订单状态
        if (rentPaid && depositPaid) {
            await promisePool.execute(
                'UPDATE rental_orders SET status = ? WHERE id = ?',
                ['confirmed', payment.order_id]
            );
        }

        // 返回成功响应
        res.send(objectToXml({
            return_code: 'SUCCESS',
            return_msg: 'OK'
        }));

    } catch (error) {
        console.error('处理微信支付回调错误:', error);
        res.send(objectToXml({
            return_code: 'FAIL',
            return_msg: '处理失败'
        }));
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

        // 如果状态是pending，主动查询微信支付状态
        if (payment.status === 'pending' && payment.payment_method === 'wechat') {
            const queryResult = await queryOrder(payment.payment_no);
            
            if (queryResult.success && queryResult.data.trade_state === 'SUCCESS') {
                // 更新支付状态
                await promisePool.execute(
                    'UPDATE payments SET status = ?, transaction_id = ? WHERE id = ?',
                    ['success', queryResult.data.transaction_id, payment.id]
                );
                payment.status = 'success';
                payment.transaction_id = queryResult.data.transaction_id;
            }
        }

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 获取总数
        const [countResult] = await promisePool.execute(
            'SELECT COUNT(*) as total FROM payments WHERE user_id = ?',
            [userId]
        );
        const total = countResult[0].total;

        // 获取支付记录
        const [payments] = await promisePool.execute(
            `SELECT p.*, o.order_no, r.title as resource_title
             FROM payments p
             LEFT JOIN rental_orders o ON p.order_id = o.id
             LEFT JOIN resources r ON o.resource_id = r.id
             WHERE p.user_id = ?
             ORDER BY p.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            [userId]
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