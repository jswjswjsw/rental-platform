/**
 * 资源管理路由模块
 * 
 * 功能说明：
 * - 处理闲置资源的发布、查询、更新和删除
 * - 支持多条件搜索和筛选功能
 * - 图片上传和管理
 * - 浏览量统计和相关推荐
 * 
 * 主要接口：
 * - GET /resources - 获取资源列表（支持搜索筛选排序）
 * - GET /resources/:id - 获取资源详情（含相关推荐）
 * - POST /resources - 发布新资源（需认证）
 * - PUT /resources/:id - 更新资源信息（需所有权）
 * - DELETE /resources/:id - 删除资源（需所有权）
 * 
 * 搜索功能：
 * - 关键词搜索：标题和描述
 * - 分类筛选：按资源分类
 * - 价格区间：最低价到最高价
 * - 位置筛选：按地理位置
 * - 排序方式：时间、价格、浏览量
 * 
 * 权限控制：
 * - 公开接口：资源列表、资源详情
 * - 认证接口：发布资源
 * - 所有权检查：更新、删除资源
 * 
 * 文件管理：
 * - 支持多图片上传（最多5张）
 * - 图片格式验证和大小限制
 * - 自动删除无用图片文件
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const Joi = require('joi');
const { promisePool } = require('../config/database');
const { authenticateToken, optionalAuth, checkResourceOwnership } = require('../middleware/auth');
const { uploadMultiple, deleteFile } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

/**
 * 获取资源列表（支持搜索和筛选）
 * GET /api/resources
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const categoryId = req.query.category_id;
        const minPrice = parseFloat(req.query.min_price) || 0;
        const maxPrice = parseFloat(req.query.max_price) || 999999;
        const location = req.query.location || '';
        const sortBy = req.query.sort || 'created_at'; // created_at, price_asc, price_desc, view_count

        // 构建查询条件
        let whereClause = 'WHERE r.status = ?';
        let queryParams = ['available'];

        if (search) {
            whereClause += ' AND (r.title LIKE ? OR r.description LIKE ?)';
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern);
        }

        if (categoryId) {
            whereClause += ' AND r.category_id = ?';
            queryParams.push(categoryId);
        }

        if (minPrice > 0 || maxPrice < 999999) {
            whereClause += ' AND r.price_per_day BETWEEN ? AND ?';
            queryParams.push(minPrice, maxPrice);
        }

        if (location) {
            whereClause += ' AND r.location LIKE ?';
            queryParams.push(`%${location}%`);
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

        // 获取总数
        const [countResult] = await promisePool.execute(
            `SELECT COUNT(*) as total FROM resources r ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;

        // 获取资源列表
        const [resources] = await promisePool.execute(
            `SELECT r.*, c.name as category_name, u.username as owner_name, u.avatar as owner_avatar
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             ${whereClause}
             ORDER BY ${orderBy}
             LIMIT ${limit} OFFSET ${offset}`,
            queryParams
        );

        res.json({
            status: 'success',
            data: {
                resources: resources || [],
                pagination: {
                    page,
                    limit,
                    total: total || 0,
                    pages: Math.ceil((total || 0) / limit)
                }
            }
        });

    } catch (error) {
        console.error('获取资源列表错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取资源详情
 * GET /api/resources/:id
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const resourceId = req.params.id;

        // 获取资源详情
        const [resources] = await promisePool.execute(
            `SELECT r.*, c.name as category_name, u.username as owner_name, 
                    u.avatar as owner_avatar, u.phone as owner_phone, u.real_name as owner_real_name
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.id = ?`,
            [resourceId]
        );

        if (resources.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '资源不存在'
            });
        }

        const resource = resources[0];

        // 增加浏览次数（如果不是资源拥有者）
        if (!req.user || req.user.id !== resource.user_id) {
            await promisePool.execute(
                'UPDATE resources SET view_count = view_count + 1 WHERE id = ?',
                [resourceId]
            );
            resource.view_count += 1;
        }

        // 获取相关资源推荐（同分类的其他资源）
        const [relatedResources] = await promisePool.execute(
            `SELECT r.*, u.username as owner_name
             FROM resources r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.category_id = ? AND r.id != ? AND r.status = 'available'
             ORDER BY r.view_count DESC
             LIMIT 4`,
            [resource.category_id, resourceId]
        );

        resource.related_resources = relatedResources;

        res.json({
            status: 'success',
            data: {
                resource
            }
        });

    } catch (error) {
        console.error('获取资源详情错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 发布新资源
 * POST /api/resources
 */
router.post('/', authenticateToken, uploadMultiple('images', 5), async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            category_id: Joi.number().integer().positive().required()
                .messages({
                    'number.base': '分类ID必须是数字',
                    'number.positive': '分类ID必须是正数',
                    'any.required': '请选择资源分类'
                }),
            title: Joi.string().min(2).max(200).required()
                .messages({
                    'string.min': '标题至少2个字符',
                    'string.max': '标题最多200个字符',
                    'any.required': '请输入资源标题'
                }),
            description: Joi.string().max(2000).optional().allow('')
                .messages({
                    'string.max': '描述最多2000个字符'
                }),
            price_per_day: Joi.number().positive().precision(2).required()
                .messages({
                    'number.base': '日租金必须是数字',
                    'number.positive': '日租金必须大于0',
                    'any.required': '请输入日租金'
                }),
            deposit: Joi.number().min(0).precision(2).optional()
                .messages({
                    'number.base': '押金必须是数字',
                    'number.min': '押金不能小于0'
                }),
            location: Joi.string().max(200).optional().allow('')
                .messages({
                    'string.max': '位置信息最多200个字符'
                }),
            contact_info: Joi.string().max(500).optional().allow('')
                .messages({
                    'string.max': '联系方式最多500个字符'
                })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            // 删除已上传的文件
            if (req.files) {
                req.files.forEach(file => deleteFile(file.path));
            }
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { category_id, title, description, price_per_day, deposit, location, contact_info } = value;

        // 验证分类是否存在
        const [categories] = await promisePool.execute(
            'SELECT id FROM categories WHERE id = ? AND status = ?',
            [category_id, 'active']
        );

        if (categories.length === 0) {
            if (req.files) {
                req.files.forEach(file => deleteFile(file.path));
            }
            return res.status(400).json({
                status: 'error',
                message: '选择的分类不存在'
            });
        }

        // 处理上传的图片
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/resources/${file.filename}`);
        }

        // 插入资源记录
        const [result] = await promisePool.execute(
            `INSERT INTO resources (user_id, category_id, title, description, images, 
                                   price_per_day, deposit, location, contact_info) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                category_id,
                title,
                description || null,
                JSON.stringify(images),
                price_per_day,
                deposit || 0,
                location || null,
                contact_info || null
            ]
        );

        // 获取新创建的资源信息
        const [newResource] = await promisePool.execute(
            `SELECT r.*, c.name as category_name, u.username as owner_name
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            status: 'success',
            message: '资源发布成功',
            data: {
                resource: newResource[0]
            }
        });

    } catch (error) {
        console.error('发布资源错误:', error);
        
        // 删除已上传的文件
        if (req.files) {
            req.files.forEach(file => deleteFile(file.path));
        }

        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 更新资源信息
 * PUT /api/resources/:id
 */
router.put('/:id', authenticateToken, checkResourceOwnership, uploadMultiple('images', 5), async (req, res) => {
    try {
        const resourceId = req.params.id;

        // 数据验证（与创建时相同）
        const schema = Joi.object({
            category_id: Joi.number().integer().positive().optional(),
            title: Joi.string().min(2).max(200).optional(),
            description: Joi.string().max(2000).optional().allow(''),
            price_per_day: Joi.number().positive().precision(2).optional(),
            deposit: Joi.number().min(0).precision(2).optional(),
            location: Joi.string().max(200).optional().allow(''),
            contact_info: Joi.string().max(500).optional().allow(''),
            status: Joi.string().valid('available', 'maintenance', 'offline').optional(),
            remove_images: Joi.string().optional() // 要删除的图片索引，逗号分隔
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            if (req.files) {
                req.files.forEach(file => deleteFile(file.path));
            }
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        // 获取当前资源信息
        const [currentResource] = await promisePool.execute(
            'SELECT * FROM resources WHERE id = ?',
            [resourceId]
        );

        if (currentResource.length === 0) {
            if (req.files) {
                req.files.forEach(file => deleteFile(file.path));
            }
            return res.status(404).json({
                status: 'error',
                message: '资源不存在'
            });
        }

        const resource = currentResource[0];
        let currentImages = [];
        
        try {
            currentImages = JSON.parse(resource.images || '[]');
        } catch (e) {
            currentImages = [];
        }

        // 处理要删除的图片
        if (value.remove_images) {
            const removeIndexes = value.remove_images.split(',').map(i => parseInt(i)).filter(i => !isNaN(i));
            removeIndexes.sort((a, b) => b - a); // 从大到小排序，避免删除时索引变化
            
            removeIndexes.forEach(index => {
                if (index >= 0 && index < currentImages.length) {
                    const imagePath = currentImages[index];
                    if (imagePath && imagePath.startsWith('/uploads/')) {
                        const fullPath = path.join(__dirname, '..', imagePath);
                        deleteFile(fullPath);
                    }
                    currentImages.splice(index, 1);
                }
            });
        }

        // 添加新上传的图片
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/resources/${file.filename}`);
            currentImages = currentImages.concat(newImages);
        }

        // 构建更新字段
        const updateFields = [];
        const updateValues = [];

        Object.keys(value).forEach(key => {
            if (key !== 'remove_images' && value[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value[key]);
            }
        });

        // 更新图片字段
        updateFields.push('images = ?');
        updateValues.push(JSON.stringify(currentImages));

        updateValues.push(resourceId);

        // 执行更新
        await promisePool.execute(
            `UPDATE resources SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // 获取更新后的资源信息
        const [updatedResource] = await promisePool.execute(
            `SELECT r.*, c.name as category_name, u.username as owner_name
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.id = ?`,
            [resourceId]
        );

        res.json({
            status: 'success',
            message: '资源更新成功',
            data: {
                resource: updatedResource[0]
            }
        });

    } catch (error) {
        console.error('更新资源错误:', error);
        
        if (req.files) {
            req.files.forEach(file => deleteFile(file.path));
        }

        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 删除资源
 * DELETE /api/resources/:id
 */
router.delete('/:id', authenticateToken, checkResourceOwnership, async (req, res) => {
    try {
        const resourceId = req.params.id;

        // 检查是否有进行中的订单
        const [activeOrders] = await promisePool.execute(
            'SELECT id FROM rental_orders WHERE resource_id = ? AND status IN (?, ?, ?)',
            [resourceId, 'pending', 'confirmed', 'ongoing']
        );

        if (activeOrders.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: '该资源有进行中的订单，无法删除'
            });
        }

        // 获取资源信息以删除图片文件
        const [resources] = await promisePool.execute(
            'SELECT images FROM resources WHERE id = ?',
            [resourceId]
        );

        if (resources.length > 0) {
            try {
                const images = JSON.parse(resources[0].images || '[]');
                images.forEach(imagePath => {
                    if (imagePath && imagePath.startsWith('/uploads/')) {
                        const fullPath = path.join(__dirname, '..', imagePath);
                        deleteFile(fullPath);
                    }
                });
            } catch (e) {
                console.error('删除图片文件失败:', e);
            }
        }

        // 删除资源记录
        await promisePool.execute('DELETE FROM resources WHERE id = ?', [resourceId]);

        res.json({
            status: 'success',
            message: '资源删除成功'
        });

    } catch (error) {
        console.error('删除资源错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

module.exports = router;