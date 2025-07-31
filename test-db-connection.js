/**
 * 数据库连接测试脚本
 * 用于诊断数据库连接问题
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './houduan/.env' });

async function testDatabaseConnection() {
    console.log('🔍 开始数据库连接测试...\n');

    // 显示配置信息（隐藏密码）
    console.log('📋 数据库配置信息:');
    console.log(`   主机: ${process.env.DB_HOST}`);
    console.log(`   端口: ${process.env.DB_PORT}`);
    console.log(`   用户: ${process.env.DB_USER}`);
    console.log(`   密码: ${process.env.DB_PASSWORD ? '***已设置***' : '❌未设置'}`);
    console.log(`   数据库: ${process.env.DB_NAME}\n`);

    const config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        connectTimeout: 60000,
        ssl: process.env.DB_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false
    };

    let connection = null;

    try {
        console.log('🔌 尝试连接数据库...');
        connection = await mysql.createConnection(config);
        console.log('✅ 数据库连接成功!\n');

        // 测试基本查询
        console.log('🔍 测试基本查询...');
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 基本查询成功:', rows[0]);

        // 检查数据库版本
        console.log('\n🔍 检查数据库版本...');
        const [version] = await connection.execute('SELECT VERSION() as version');
        console.log('✅ MySQL版本:', version[0].version);

        // 检查数据库是否存在
        console.log('\n🔍 检查数据库是否存在...');
        const [databases] = await connection.execute('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
        console.log(`${dbExists ? '✅' : '❌'} 数据库 '${process.env.DB_NAME}' ${dbExists ? '存在' : '不存在'}`);

        if (dbExists) {
            // 检查表结构
            console.log('\n🔍 检查表结构...');
            const [tables] = await connection.execute('SHOW TABLES');
            console.log('📊 数据库中的表:');
            if (tables.length === 0) {
                console.log('   ⚠️  数据库中没有表，可能需要初始化数据库');
            } else {
                tables.forEach(table => {
                    const tableName = table[`Tables_in_${process.env.DB_NAME}`];
                    console.log(`   - ${tableName}`);
                });
            }
        }

        console.log('\n🎉 数据库连接测试完成!');

    } catch (error) {
        console.error('\n❌ 数据库连接失败:');
        console.error('错误代码:', error.code);
        console.error('错误信息:', error.message);

        // 提供具体的解决建议
        switch (error.code) {
            case 'ECONNREFUSED':
                console.error('\n💡 解决建议:');
                console.error('   1. 检查数据库服务是否启动');
                console.error('   2. 检查主机地址和端口是否正确');
                console.error('   3. 检查防火墙设置');
                break;
            case 'ER_ACCESS_DENIED_ERROR':
                console.error('\n💡 解决建议:');
                console.error('   1. 检查用户名和密码是否正确');
                console.error('   2. 检查用户是否有访问权限');
                console.error('   3. 检查IP白名单设置');
                break;
            case 'ENOTFOUND':
                console.error('\n💡 解决建议:');
                console.error('   1. 检查主机地址是否正确');
                console.error('   2. 检查网络连接');
                console.error('   3. 检查DNS解析');
                break;
            case 'ETIMEDOUT':
                console.error('\n💡 解决建议:');
                console.error('   1. 检查网络连接');
                console.error('   2. 检查防火墙设置');
                console.error('   3. 增加连接超时时间');
                break;
            default:
                console.error('\n💡 建议联系数据库管理员检查配置');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 数据库连接已关闭');
        }
    }
}

// 运行测试
testDatabaseConnection().catch(console.error);