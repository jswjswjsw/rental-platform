/**
 * 调试资源接口脚本
 */

require('dotenv').config({ path: './houduan/.env' });
const { promisePool } = require('./houduan/config/database');

async function debugResourcesAPI() {
    try {
        console.log('🔍 调试资源查询...');
        
        // 模拟资源接口的查询逻辑
        const page = 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        // 构建查询条件
        let whereClause = 'WHERE r.status = ?';
        let queryParams = ['available'];
        
        console.log('📋 查询条件:', whereClause);
        console.log('📋 查询参数:', queryParams);
        
        // 获取总数
        console.log('1️⃣ 获取资源总数...');
        const [countResult] = await promisePool.execute(
            `SELECT COUNT(*) as total FROM resources r ${whereClause}`,
            queryParams
        );
        const total = countResult[0].total;
        console.log('✅ 总数:', total);
        
        // 获取资源列表
        console.log('2️⃣ 获取资源列表...');
        const orderBy = 'r.created_at DESC';
        const query = `SELECT r.*, c.name as category_name, u.username as owner_name, u.avatar as owner_avatar
             FROM resources r
             LEFT JOIN categories c ON r.category_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             ${whereClause}
             ORDER BY ${orderBy}
             LIMIT ? OFFSET ?`;
        
        console.log('📋 完整查询:', query);
        console.log('📋 完整参数:', [...queryParams, limit, offset]);
        
        const [resources] = await promisePool.execute(query, [...queryParams, limit, offset]);
        
        console.log('✅ 查询成功，找到', resources.length, '个资源');
        
        const result = {
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
        };
        
        console.log('✅ 返回结果:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ 调试失败:', error);
        console.error('错误详情:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sql: error.sql
        });
    } finally {
        process.exit(0);
    }
}

debugResourcesAPI();