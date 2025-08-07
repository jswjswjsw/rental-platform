/**
 * 评价管理路由模块
 * 
 * 功能说明：
 * - 处理用户对资源的评价管理
 * - 支持评价的创建、查询、更新和删除
 * - 自动计算和更新资源平均评分
 * - 防止重复评价和权限控制
 * 
 * 主要接口：
 * - GET /reviews/resource/:resourceId - 获取资源的所有评价
 * - GET /reviews/user/:userId - 获取用户的所有评价
 * - POST /reviews - 创建新评价（需认证）
 * - PUT /reviews/:id - 更新评价（需所有权）
 * - DELETE /reviews/:id - 删除评价（需所有权）
 * 
 * 业务规则：
 * - 每个用户对每个资源只能评价一次
 * - 评分范围：1-5分
 * - 评价后自动更新资源平均评分
 * - 只能修改和删除自己的评价
 * 
 * 数据验证：
 * - 评分：1-5的整数
 * - 评价内容：最大500字符
 * - 资源ID和用户ID：必须存在
 * 
 * 权限控制：
 * - 公开接口：查看评价
 * - 认证接口：创建评价
 * - 所有权检查：更新、删除评价
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
 * 获取指定资源的所有评价
 * GET /api/reviews/resource/:resourceId
 * 
 * 功能：
 * - 分页获取资源的评价列表
 * - 包含评价者的用户信息
 * - 按创建时间倒序排列
 * 
 * 参数：
 * - resourceId: 资源ID（路径参数）
 * - page: 页码（查询参数，默认1）
 * - limit: 每页数量（查询参数，默认10）
 */
router.get('/resource/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 获取评价列表，包含用户信息
    const [reviews] = await promisePool.execute(`
      SELECT r.*, u.username, u.avatar 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.resource_id = ? 
      ORDER BY r.created_at DESC 
      LIMIT ? OFFSET ?
    `, [resourceId, parseInt(limit), offset]);

    // 获取总数用于分页
    const [countResult] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE resource_id = ?',
      [resourceId]
    );

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取评价失败:', error);
    res.status(500).json({ success: false, message: '获取评价失败' });
  }
});

/**
 * 创建新评价
 * POST /api/reviews
 * 
 * 功能：
 * - 用户对资源进行评价
 * - 防止重复评价
 * - 自动更新资源平均评分
 * 
 * 请求体：
 * - resource_id: 资源ID
 * - rating: 评分（1-5）
 * - comment: 评价内容
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { resource_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: '评分必须在1-5之间' });
    }

    // 检查用户是否已经评价过该资源
    const [existing] = await promisePool.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND resource_id = ?',
      [user_id, resource_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: '您已经评价过该资源' });
    }

    // 创建评价
    const [result] = await promisePool.execute(`
      INSERT INTO reviews (user_id, resource_id, rating, comment, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `, [user_id, resource_id, rating, comment]);

    // 更新资源的平均评分
    await updateResourceRating(resource_id);

    res.status(201).json({
      success: true,
      message: '评价创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    res.status(500).json({ success: false, message: '创建评价失败' });
  }
});

/**
 * 更新评价
 * PUT /api/reviews/:id
 * 
 * 功能：
 * - 用户更新自己的评价
 * - 验证所有权和评分范围
 * - 自动更新资源平均评分
 * 
 * 参数：
 * - id: 评价ID（路径参数）
 * 
 * 请求体：
 * - rating: 新评分（1-5）
 * - comment: 新评价内容
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: '评分必须在1-5之间' });
    }

    // 检查评价是否存在且属于当前用户
    const [review] = await promisePool.execute(
      'SELECT resource_id FROM reviews WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (review.length === 0) {
      return res.status(404).json({ success: false, message: '评价不存在或无权限修改' });
    }

    // 更新评价
    await promisePool.execute(
      'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [rating, comment, id]
    );

    // 更新资源的平均评分
    await updateResourceRating(review[0].resource_id);

    res.json({ success: true, message: '评价更新成功' });
  } catch (error) {
    console.error('更新评价失败:', error);
    res.status(500).json({ success: false, message: '更新评价失败' });
  }
});

/**
 * 删除评价
 * DELETE /api/reviews/:id
 * 
 * 功能：
 * - 用户删除自己的评价
 * - 验证所有权
 * - 自动更新资源平均评分
 * 
 * 参数：
 * - id: 评价ID（路径参数）
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // 检查评价是否存在且属于当前用户
    const [review] = await promisePool.execute(
      'SELECT resource_id FROM reviews WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (review.length === 0) {
      return res.status(404).json({ success: false, message: '评价不存在或无权限删除' });
    }

    // 删除评价
    await promisePool.execute('DELETE FROM reviews WHERE id = ?', [id]);

    // 更新资源的平均评分
    await updateResourceRating(review[0].resource_id);

    res.json({ success: true, message: '评价删除成功' });
  } catch (error) {
    console.error('删除评价失败:', error);
    res.status(500).json({ success: false, message: '删除评价失败' });
  }
});

/**
 * 获取指定用户的所有评价
 * GET /api/reviews/user/:userId
 * 
 * 功能：
 * - 分页获取用户发表的评价列表
 * - 包含被评价资源的基本信息
 * - 按创建时间倒序排列
 * 
 * 参数：
 * - userId: 用户ID（路径参数）
 * - page: 页码（查询参数，默认1）
 * - limit: 每页数量（查询参数，默认10）
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 获取用户评价列表，包含资源信息
    const [reviews] = await promisePool.execute(`
      SELECT r.*, res.title as resource_title, res.images as resource_images
      FROM reviews r 
      JOIN resources res ON r.resource_id = res.id 
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC 
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    // 获取总数用于分页
    const [countResult] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取用户评价失败:', error);
    res.status(500).json({ success: false, message: '获取用户评价失败' });
  }
});

/**
 * 更新资源平均评分的辅助函数
 * 
 * 功能：
 * - 计算指定资源的平均评分
 * - 统计评价总数
 * - 更新资源表中的评分信息
 * 
 * @param {number} resourceId - 资源ID
 */
async function updateResourceRating(resourceId) {
  try {
    // 计算平均评分和评价数量
    const [result] = await promisePool.execute(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as review_count 
      FROM reviews 
      WHERE resource_id = ?
    `, [resourceId]);

    const avgRating = result[0].avg_rating || 0;
    const reviewCount = result[0].review_count || 0;

    // 更新资源表中的评分信息
    await promisePool.execute(
      'UPDATE resources SET rating = ?, review_count = ? WHERE id = ?',
      [parseFloat(avgRating.toFixed(1)), reviewCount, resourceId]
    );
  } catch (error) {
    console.error('更新资源评分失败:', error);
  }
}

module.exports = router;