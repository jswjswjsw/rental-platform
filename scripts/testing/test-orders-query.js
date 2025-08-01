/**
 * 测试订单查询
 */

require('dotenv').config({ path: './houduan/.env' });
const { promisePool } = require('./houduan/config/database');

async function testOrdersQuery() {
    try {
        console.log('🔍 测试订单查询...');

        const userId = 3; // testlogin用户的ID

        // 测试简单查询
        console.log('1️⃣ 测试简单查询...');
        const [simpleResult] = await promisePool.execute(
            'SELECT COUNT(*) as total FROM rental_orders WHERE renter_id = ? OR owner_id = ?',
            [userId, userId]
        );
        console.log('✅ 简单查询成功，订单数量:', simpleResult[0].total);

        // 测试复杂查询
        console.log('2️⃣ 测试复杂查询...');
        const whereClause = 'WHERE (o.renter_id = ? OR o.owner_id = ?)';
        const queryParams = [userId, userId];
        const limit = 10;
        const offset = 0;

        const query = `SELECT o.*, r.title as resource_title, r.images as resource_images,
                renter.username as renter_name, renter.avatar as renter_avatar,
                owner.username as owner_name, owner.avatar as owner_avatar
         FROM rental_orders o
         LEFT JOIN resources r ON o.resource_id = r.id
         LEFT JOIN users renter ON o.renter_id = renter.id
         LEFT JOIN users owner ON o.owner_id = owner.id
         ${whereClause}
         ORDER BY o.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`;

        console.log('📋 查询语句:', query);
        console.log('📋 查询参数:', queryParams);

        const [complexResult] = await promisePool.execute(query, queryParams);
        console.log('✅ 复杂查询成功，结果数量:', complexResult.length);

        if (complexResult.length > 0) {
            console.log('📄 第一条结果:', complexResult[0]);
        }

    } catch (error) {
        console.error('❌ 查询失败:', error);
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

testOrdersQuery();