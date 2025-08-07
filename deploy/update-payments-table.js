/**
 * 支付表更新脚本
 * 用于在现有数据库中添加支付相关表结构
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './houduan/.env' });

console.log('🔧 支付表更新脚本启动...\n');

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    connectTimeout: 60000
};

async function updatePaymentsTables() {
    try {
        console.log('🔗 连接数据库...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功');

        // 读取支付表SQL文件
        const sqlPath = path.join(__dirname, 'shujuku', 'add-payments-table.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error('支付表SQL文件不存在');
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // 分割SQL语句（处理DELIMITER）
        const statements = sqlContent
            .split('DELIMITER')[0] // 只取DELIMITER之前的部分
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📊 准备执行 ${statements.length} 条SQL语句...\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.length > 0) {
                try {
                    console.log(`执行语句 ${i + 1}/${statements.length}...`);
                    await connection.execute(statement);
                    console.log('✅ 执行成功');
                } catch (error) {
                    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log('⚠️ 表已存在，跳过');
                    } else {
                        console.error('❌ 执行失败:', error.message);
                        throw error;
                    }
                }
            }
        }

        // 验证表是否创建成功
        console.log('\n🔍 验证表结构...');
        const [tables] = await connection.execute("SHOW TABLES LIKE 'payments'");
        if (tables.length > 0) {
            console.log('✅ payments表创建成功');
            
            // 显示表结构
            const [columns] = await connection.execute('DESCRIBE payments');
            console.log('📋 payments表结构:');
            columns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        }

        const [configTables] = await connection.execute("SHOW TABLES LIKE 'payment_configs'");
        if (configTables.length > 0) {
            console.log('✅ payment_configs表创建成功');
        }

        await connection.end();

        console.log('\n🎉 支付表更新完成！');
        console.log('\n💡 下一步操作:');
        console.log('   1. 重启后端服务测试支付功能');
        console.log('   2. 配置微信支付参数（如需要）');
        console.log('   3. 测试支付订单创建和查询');

    } catch (error) {
        console.error('❌ 更新失败:', error.message);
        console.error('💡 请检查数据库连接和SQL语法');
    }
}

updatePaymentsTables();