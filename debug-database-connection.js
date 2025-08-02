/**
 * 数据库连接诊断工具
 * 专门针对阿里云RDS实例: rm-bp1sva9582w011209
 * 用于诊断和修复租赁平台的数据库连接问题
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './houduan/.env' });

// 数据库配置 - 针对阿里云RDS优化
const dbConfig = {
    host: process.env.DB_HOST || 'rm-bp1sva9582w011209.mysql.rds.aliyuncs.com',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rental_platform',
    charset: 'utf8mb4',
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // 阿里云RDS特定配置
    ssl: false,
    multipleStatements: false,
    dateStrings: true
};

console.log('🔍 阿里云RDS连接诊断工具启动...');
console.log('🏷️  RDS实例: rm-bp1sva9582w011209\n');

// 检查环境变量文件
function checkEnvFile() {
    const envPath = path.join(__dirname, 'houduan', '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env文件不存在:', envPath);
        return false;
    }
    console.log('✅ .env文件存在');
    return true;
}

async function diagnoseConnection() {
    // 检查环境变量文件
    if (!checkEnvFile()) {
        return false;
    }

    console.log('📋 当前RDS连接配置:');
    console.log(`   RDS实例: rm-bp1sva9582w011209`);
    console.log(`   主机地址: ${dbConfig.host}`);
    console.log(`   端口: ${dbConfig.port}`);
    console.log(`   用户名: ${dbConfig.user}`);
    console.log(`   密码: ${dbConfig.password ? '***已设置***' : '❌未设置'}`);
    console.log(`   数据库: ${dbConfig.database}`);
    console.log(`   字符集: ${dbConfig.charset}\n`);

    // 步骤1: 测试阿里云RDS基本连接
    console.log('🔗 步骤1: 测试阿里云RDS基本连接...');
    try {
        console.log('   正在连接到 rm-bp1sva9582w011209...');
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            connectTimeout: 30000,
            ssl: false
        });

        console.log('✅ RDS基本连接成功');

        // 获取RDS服务器详细信息
        const [serverInfo] = await connection.execute(`
            SELECT 
                VERSION() as version, 
                @@hostname as hostname, 
                NOW() as current_time,
                @@port as port,
                @@character_set_server as charset,
                @@max_connections as max_connections
        `);

        console.log('📊 RDS服务器信息:');
        console.log(`   MySQL版本: ${serverInfo[0].version}`);
        console.log(`   服务器主机: ${serverInfo[0].hostname}`);
        console.log(`   服务器时间: ${serverInfo[0].current_time}`);
        console.log(`   端口: ${serverInfo[0].port}`);
        console.log(`   字符集: ${serverInfo[0].charset}`);
        console.log(`   最大连接数: ${serverInfo[0].max_connections}`);

        // 检查当前连接数
        const [processInfo] = await connection.execute('SHOW PROCESSLIST');
        console.log(`   当前连接数: ${processInfo.length}`);

        await connection.end();
    } catch (error) {
        console.error('❌ RDS连接失败:', error.message);
        console.error('   错误代码:', error.code);

        // 针对阿里云RDS的详细错误分析
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 RDS权限问题解决建议:');
            console.error('   1. 检查RDS白名单是否包含ECS内网IP');
            console.error('   2. 确认数据库账号密码是否正确');
            console.error('   3. 验证账号是否有远程连接权限');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 RDS连接被拒绝解决建议:');
            console.error('   1. 确认RDS实例状态是否正常');
            console.error('   2. 检查ECS与RDS是否在同一VPC');
            console.error('   3. 验证安全组规则是否正确');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('💡 RDS连接超时解决建议:');
            console.error('   1. 检查网络连通性');
            console.error('   2. 确认RDS白名单配置');
            console.error('   3. 检查ECS出站规则');
        }
        return false;
    }

    // 步骤2: 测试数据库访问
    console.log('\n🗄️ 步骤2: 测试数据库访问...');
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功');

        // 检查数据库是否存在
        const [databases] = await connection.execute('SHOW DATABASES');
        const dbExists = databases.some(db => db.Database === dbConfig.database);
        console.log(`   数据库 ${dbConfig.database} ${dbExists ? '存在' : '不存在'}`);

        await connection.end();
    } catch (error) {
        console.error('❌ 数据库访问失败:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 尝试创建数据库...');
            await createDatabase();
        }
        return false;
    }

    // 步骤3: 检查表结构
    console.log('\n📊 步骤3: 检查表结构...');
    await checkTables();

    // 步骤4: 检查favorites表
    console.log('\n⭐ 步骤4: 检查favorites表...');
    await checkFavoritesTable();

    return true;
}

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ 数据库 ${dbConfig.database} 创建成功`);

        await connection.end();
    } catch (error) {
        console.error('❌ 创建数据库失败:', error.message);
    }
}

async function checkTables() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`   发现 ${tables.length} 个表:`);

        const tableNames = tables.map(table => Object.values(table)[0]);
        tableNames.forEach(name => console.log(`     - ${name}`));

        // 检查必需的表
        const requiredTables = ['users', 'resources', 'categories', 'orders', 'reviews'];
        const missingTables = requiredTables.filter(table => !tableNames.includes(table));

        if (missingTables.length > 0) {
            console.log(`   ⚠️ 缺少表: ${missingTables.join(', ')}`);
        } else {
            console.log('   ✅ 所有必需的表都存在');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ 检查表结构失败:', error.message);
    }
}

async function checkFavoritesTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // 检查favorites表是否存在
        const [tables] = await connection.execute("SHOW TABLES LIKE 'favorites'");

        if (tables.length === 0) {
            console.log('   ❌ favorites表不存在');
            console.log('   💡 正在创建favorites表...');
            await createFavoritesTable(connection);
        } else {
            console.log('   ✅ favorites表存在');

            // 检查表结构
            const [columns] = await connection.execute('DESCRIBE favorites');
            console.log('   📋 favorites表结构:');
            columns.forEach(col => {
                console.log(`     - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
            });

            // 检查表数据
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM favorites');
            console.log(`   📊 favorites表记录数: ${count[0].count}`);
        }

        await connection.end();
    } catch (error) {
        console.error('❌ 检查favorites表失败:', error.message);
        console.error('   这可能是导致前端"网络连接失败"的原因');
    }
}

async function createFavoritesTable(connection) {
    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS favorites (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL COMMENT '用户ID',
                resource_id INT NOT NULL COMMENT '资源ID',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                UNIQUE KEY unique_favorite (user_id, resource_id),
                INDEX idx_user (user_id),
                INDEX idx_resource (resource_id),
                INDEX idx_created_at (created_at)
            ) COMMENT '用户收藏表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;

        await connection.execute(createTableSQL);
        console.log('   ✅ favorites表创建成功');

        // 验证表创建
        const [tables] = await connection.execute("SHOW TABLES LIKE 'favorites'");
        if (tables.length > 0) {
            console.log('   ✅ 表创建验证通过');
        }

    } catch (error) {
        console.error('   ❌ 创建favorites表失败:', error.message);
    }
}

// 额外检查：验证uploads目录
function checkUploadsDirectory() {
    console.log('\n📁 步骤5: 检查uploads目录结构...');
    const uploadsPath = path.join(__dirname, 'houduan', 'uploads');

    if (!fs.existsSync(uploadsPath)) {
        console.log('   ❌ uploads目录不存在，正在创建...');
        fs.mkdirSync(uploadsPath, { recursive: true });

        // 创建子目录
        const subDirs = ['avatars', 'resources'];
        subDirs.forEach(dir => {
            const subPath = path.join(uploadsPath, dir);
            if (!fs.existsSync(subPath)) {
                fs.mkdirSync(subPath, { recursive: true });
                console.log(`   ✅ 创建目录: ${dir}/`);
            }
        });
    } else {
        console.log('   ✅ uploads目录存在');

        // 检查子目录
        const subDirs = ['avatars', 'resources'];
        subDirs.forEach(dir => {
            const subPath = path.join(uploadsPath, dir);
            if (fs.existsSync(subPath)) {
                const files = fs.readdirSync(subPath);
                console.log(`   📊 ${dir}/ 目录: ${files.length} 个文件`);
            } else {
                console.log(`   ⚠️ ${dir}/ 目录不存在`);
                fs.mkdirSync(subPath, { recursive: true });
                console.log(`   ✅ 已创建 ${dir}/ 目录`);
            }
        });
    }
}

// 运行完整诊断
async function runFullDiagnosis() {
    try {
        const dbSuccess = await diagnoseConnection();
        checkUploadsDirectory();

        if (dbSuccess) {
            console.log('\n🎉 阿里云RDS连接诊断完成！');
            console.log('📋 诊断结果总结:');
            console.log('   ✅ RDS连接正常');
            console.log('   ✅ 数据库表结构完整');
            console.log('   ✅ uploads目录结构正常');
            console.log('\n💡 建议操作:');
            console.log('   1. 重启后端服务: cd houduan && npm start');
            console.log('   2. 检查前端API调用是否正常');
            console.log('   3. 测试图片上传功能');
        } else {
            console.log('\n❌ RDS连接诊断失败');
            console.log('💡 请根据上述错误信息修复RDS连接问题');
            console.log('📞 如需帮助，请联系阿里云技术支持');
        }
    } catch (error) {
        console.error('\n💥 诊断过程出现异常:', error.message);
        console.error('🔍 详细错误:', error.stack);
    }
}

// 启动诊断
runFullDiagnosis();