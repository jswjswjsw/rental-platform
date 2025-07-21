/**
 * 数据库连接测试脚本
 * 用于快速诊断数据库连接问题
 */

// 手动读取环境变量
const fs = require('fs');
const path = require('path');

// 读取.env文件
function loadEnv() {
    try {
        const envPath = path.join(__dirname, 'houduan', '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        
        return env;
    } catch (error) {
        console.log('❌ 无法读取.env文件:', error.message);
        return {};
    }
}

const env = loadEnv();

// 尝试加载mysql2
let mysql;
try {
    mysql = require('mysql2/promise');
} catch (error) {
    console.log('❌ mysql2模块未安装，请先执行: cd houduan && npm install');
    process.exit(1);
}

async function testConnection() {
    console.log('🔍 开始测试数据库连接...');
    console.log('📋 连接参数:');
    console.log(`   主机: ${env.DB_HOST}`);
    console.log(`   端口: ${env.DB_PORT}`);
    console.log(`   用户: ${env.DB_USER}`);
    console.log(`   数据库: ${env.DB_NAME}`);
    console.log(`   密码: ${env.DB_PASSWORD ? '***已设置***' : '❌未设置'}`);
    console.log('');

    try {
        // 测试基本连接
        console.log('1️⃣ 测试MySQL服务连接...');
        const connection = await mysql.createConnection({
            host: env.DB_HOST || 'localhost',
            port: env.DB_PORT || 3306,
            user: env.DB_USER || 'root',
            password: env.DB_PASSWORD || ''
        });
        console.log('✅ MySQL服务连接成功');

        // 测试数据库是否存在
        console.log('2️⃣ 检查数据库是否存在...');
        const [databases] = await connection.execute('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === env.DB_NAME);
        
        if (dbExists) {
            console.log('✅ 数据库存在');
            
            // 切换到目标数据库
            await connection.query(`USE ${env.DB_NAME}`);
            
            // 检查表是否存在
            console.log('3️⃣ 检查数据表...');
            const [tables] = await connection.query('SHOW TABLES');
            console.log(`📊 找到 ${tables.length} 个数据表:`);
            tables.forEach(table => {
                console.log(`   - ${Object.values(table)[0]}`);
            });
            
            if (tables.length === 0) {
                console.log('⚠️  数据库为空，需要执行初始化脚本');
            }
        } else {
            console.log('❌ 数据库不存在，需要创建');
        }

        await connection.end();
        console.log('');
        console.log('🎉 数据库连接测试完成');
        
    } catch (error) {
        console.log('❌ 数据库连接失败:');
        console.log(`   错误类型: ${error.code}`);
        console.log(`   错误信息: ${error.message}`);
        
        // 常见错误解决建议
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('');
            console.log('💡 解决建议:');
            console.log('   - 检查用户名和密码是否正确');
            console.log('   - 确认MySQL用户权限');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('💡 解决建议:');
            console.log('   - 检查MySQL服务是否启动');
            console.log('   - 确认端口号是否正确');
        }
    }
}

// 运行测试
testConnection();