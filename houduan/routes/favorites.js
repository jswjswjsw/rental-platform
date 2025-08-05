/**
 * 收藏功能路由模块
 * 
 * 功能说明：
 * - 处理用户收藏和取消收藏资源
 * - 获取用户的收藏列表
 * - 检查资源是否已被收藏
 * 
 * 主要接口：
 * - POST /favorites - 添加收藏
 * - DELETE /favorites/:resourceId - 取消收藏
 * - GET /favorites - 获取收藏列表
 * - GET /favorites/check/:resourceId - 检查是否已收藏
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const { promisePool } = require('../config/database-config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 添加收藏
 * POST /api/favorites
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { resource_id } = req.body;

        if (!resource_id) {
            return res.status(400).json({
                status: 'error',
                message: '请提供资源ID'
            });
        }

        // 检查资源是否存在
        const [resources] = await promisePool.execute(
            'SELECT id FROM resources WHERE id = ?',
            [resource_id]
        );

        if (resources.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '资源不存在'
            });
        }

        // 检查是否已经收藏
        const [existing] = await promisePool.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND resource_id = ?',
            [userId, resource_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: '已经收藏过了'
            });
        }

        // 添加收藏
        await promisePool.execute(
            'INSERT INTO favorites (user_id, resource_id) VALUES (?, ?)',
            [userId, resource_id]
        );

        res.json({
            status: 'success',
            message: '收藏成功'
        });

    } catch (error) {
        console.error('添加收藏错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 取消收藏
 * DELETE /api/favorites/:resourceId
 */
router.delete('/:resourceId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const resourceId = req.params.resourceId;

        // 删除收藏
        const [result] = await promisePool.execute(
            'DELETE FROM favorites WHERE user_id = ? AND resource_id = ?',
            [userId, resourceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: '收藏不存在'
            });
        }

        res.json({
            status: 'success',
            message: '取消收藏成功'
        });

    } catch (error) {
        console.error('取消收藏错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取收藏列表
 * GET /api/favorites
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        // 获取总数
        const [countResult] = await promisePool.execute(
            'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
            [userId]
        );
        const total = countResult[0].total;

        // 获取收藏列表
        const [favorites] = await promisePool.execute(
            `SELECT f.*, r.*, c.name as category_name, u.username as owner_name
             FROM favorites f
             LEFT JOIN resources r ON f.resource_id = r.id
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
            [userId]
        );

        res.json({
            status: 'success',
            data: {
                favorites,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取收藏列表错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 检查是否已收藏
 * GET /api/favorites/check/:resourceId
 */
router.get('/check/:resourceId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const resourceId = req.params.resourceId;

        const [result] = await promisePool.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND resource_id = ?',
            [userId, resourceId]
        );

        res.json({
            status: 'success',
            data: {
                isFavorited: result.length > 0
            }
        });

    } catch (error) {
        console.error('检查收藏状态错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 批量检查收藏状态
 * POST /api/favorites/check-batch
 */
router.post('/check-batch', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { resource_ids } = req.body;

        if (!Array.isArray(resource_ids) || resource_ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: '请提供资源ID数组'
            });
        }

        const placeholders = resource_ids.map(() => '?').join(',');
        const [result] = await promisePool.execute(
            `SELECT resource_id FROM favorites WHERE user_id = ? AND resource_id IN (${placeholders})`,
            [userId, ...resource_ids]
        );

        const favoritedIds = result.map(row => row.resource_id);
        const favoriteStatus = {};
        resource_ids.forEach(id => {
            favoriteStatus[id] = favoritedIds.includes(id);
        });

        res.json({
            status: 'success',
            data: favoriteStatus
        });

    } catch (error) {
        console.error('批量检查收藏状态错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

module.exports = router;