/**
 * 数据库表名一致性检查脚本
 * 检查并修复项目中的表名引用不一致问题
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'houduan', '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    connectTimeout: 60000
};

async function verifyTableNames() {
    console.log('🔍 检查数据库表名一致性...\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功');
        
        // 获取所有表名
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);
        
        console.log('📊 数据库中的表:');
        tableNames.forEach(name => console.log(`   - ${name}`));
        
        // 检查订单表名
        const orderTableExists = tableNames.includes('rental_orders');
        const ordersTableExists = tableNames.includes('orders');
        
        console.log('\n🔍 订单表检查:');
        console.log(`   rental_orders: ${orderTableExists ? '✅ 存在' : '❌ 不存在'}`);
        console.log(`   orders: ${ordersTableExists ? '✅ 存在' : '❌ 不存在'}`);
        
        if (!orderTableExists && !ordersTableExists) {
            console.log('❌ 订单表不存在，需要创建');
        } else if (orderTableExists && ordersTableExists) {
            console.log('⚠️  两个订单表都存在，可能有重复');
        }
        
        // 检查支付表
        const paymentsTableExists = tableNames.includes('payments');
        console.log(`\n💳 payments表: ${paymentsTableExists ? '✅ 存在' : '❌ 不存在'}`);
        
        if (paymentsTableExists) {
            // 检查支付表的外键约束
            const [constraints] = await connection.execute(`
                SELECT 
                    CONSTRAINT_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'payments' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [process.env.DB_NAME]);
            
            console.log('🔗 payments表外键约束:');
            if (constraints.length === 0) {
                console.log('   ❌ 没有外键约束');
            } else {
                constraints.forEach(constraint => {
                    console.log(`   - ${constraint.CONSTRAINT_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
                });
            }
        }
        
        await connection.end();
        
        console.log('\n💡 建议:');
        if (!orderTableExists && !ordersTableExists) {
            console.log('   1. 运行数据库初始化脚本创建订单表');
        }
        if (!paymentsTableExists) {
            console.log('   2. 运行 create-payments-table.js 创建支付表');
        }
        console.log('   3. 确保代码中的表名引用一致');
        
    } catch (error) {
        console.error('❌ 检查失败:', error.message);
    }
}

verifyTableNames();