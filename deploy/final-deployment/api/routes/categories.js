/**
 * 资源分类路由模块
 * 
 * 功能说明：
 * - 处理资源分类的查询和管理
 * - 提供分类统计信息
 * - 支持分类下资源的查询
 * - 分类数据的维护和管理
 * 
 * 主要接口：
 * - GET /categories - 获取所有分类（含资源统计）
 * - GET /categories/:id - 获取分类详情（含统计信息）
 * - GET /categories/:id/resources - 获取分类下的资源列表
 * 
 * 业务特性：
 * - 只显示激活状态的分类
 * - 自动统计每个分类下的资源数量
 * - 支持分类资源的搜索和排序
 * - 提供分类的详细统计信息
 * 
 * 数据结构：
 * - 分类基本信息：名称、描述、图标、排序
 * - 统计信息：资源总数、可用资源数、平均价格
 * - 关联数据：分类下的资源列表
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const { promisePool } = require('../config/database');

const router = express.Router();

/**
 * 获取所有分类
 * GET /api/categories
 */
router.get('/', async (req, res) => {
    try {
        const [categories] = await promisePool.execute(
            `SELECT c.*, COUNT(r.id) as resource_count 
             FROM categories c 
             LEFT JOIN resources r ON c.id = r.category_id AND r.status = 'available'
             WHERE c.status = 'active'
             GROUP BY c.id 
             ORDER BY c.sort_order ASC, c.id ASC`
        );

        res.json({
            status: 'success',
            data: {
                categories
            }
        });

    } catch (error) {
        console.error('获取分类列表错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取分类详情
 * GET /api/categories/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [categories] = await promisePool.execute(
            'SELECT * FROM categories WHERE id = ? AND status = ?',
            [categoryId, 'active']
        );

        if (categories.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '分类不存在'
            });
        }

        // 获取该分类下的资源统计
        const [stats] = await promisePool.execute(
            `SELECT 
                COUNT(*) as total_resources,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_resources,
                AVG(price_per_day) as avg_price
             FROM resources 
             WHERE category_id = ?`,
            [categoryId]
        );

        const category = categories[0];
        category.stats = {
            total_resources: stats[0].total_resources,
            available_resources: stats[0].available_resources,
            avg_price: parseFloat(stats[0].avg_price) || 0
        };

        res.json({
            status: 'success',
            data: {
                category
            }
        });

    } catch (error) {
        console.error('获取分类详情错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取分类下的资源列表
 * GET /api/categories/:id/resources
 */
router.get('/:id/resources', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sort || 'created_at'; // created_at, price_asc, price_desc, view_count
        const search = req.query.search || '';

        // 验证分类是否存在
        const [categories] = await promisePool.execute(
            'SELECT id FROM categories WHERE id = ? AND status = ?',
            [categoryId, 'active']
        );

        if (categories.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '分类不存在'
            });
        }

        // 构建排序条件
        let orderBy = 'r.created_at DESC';
        switch (sortBy) {
            case 'price_asc':
                orderBy = 'r.price_per_day ASC';
                break;
            case 'price_desc':
                orderBy = 'r.price_per_day DESC';
                break;
            case 'view_count':
                orderBy = 'r.view_count DESC';
                break;
        }

        // 构建搜索条件
        let whereClause = 'WHERE r.category_id = ? AND r.status = ?';
        let queryParams = [categoryId, 'available'];

        if (search) {
            whereClause += ' AND (r.title LIKE ? OR r.description LIKE ?)';
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        // 获取总数
        const [countResult] = await promisePool.execute(
            `SELECT COUNT(*) as total FROM resources r ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;

        // 获取资源列表
        const [resources] = await promisePool.execute(
            `SELECT r.*, u.username as owner_name, u.avatar as owner_avatar
             FROM resources r
             LEFT JOIN users u ON r.user_id = u.id
             ${whereClause}
             ORDER BY ${orderBy}
             LIMIT ? OFFSET ?`,
            [...queryParams, limit, offset]
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
        console.error('获取分类资源错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

module.exports = router;