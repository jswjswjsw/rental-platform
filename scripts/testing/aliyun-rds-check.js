/**
 * 阿里云ECS连接RDS专用诊断脚本
 * 
 * 目标RDS实例信息：
 * - 实例ID: rm-bp1f62b28m6dxaqhf1219
 * - 内网地址: rm-bp1f62b28m6dxaqhf1219.mysql.rds.aliyuncs.com
 * - 数据库版本: MySQL 8.0
 * - 端口: 3306
 * 
 * 功能：
 * - 检测ECS网络环境
 * - 验证RDS连接配置
 * - 测试数据库连接
 * - 提供详细的故障排除建议
 */

const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

require('dotenv').config({ path: './houduan/.env' });

async function checkAliyunRDS() {
    console.log('🔍 阿里云ECS -> RDS连接诊断');
    console.log('=====================================');
    console.log('目标RDS实例: rm-bp1f62b28m6dxaqhf1205');
    console.log('=====================================\n');
    
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER;
    const dbName = process.env.DB_NAME;
    
    console.log('📋 当前配置信息:');
    console.log(`   RDS地址: ${dbHost}`);
    console.log(`   端口: ${dbPort}`);
    console.log(`   用户: ${dbUser}`);
    console.log(`   数据库: ${dbName}`);
    console.log(`   密码: ${process.env.DB_PASSWORD ? '***已设置***' : '❌未设置'}\n`);

    // 1. 检查ECS环境信息
    console.log('🔍 1. 检查ECS环境信息...');
    try {
        // 获取ECS实例ID
        const { stdout: instanceId } = await execAsync('curl -s --connect-timeout 3 http://100.100.100.200/latest/meta-data/instance-id');
        if (instanceId && instanceId.trim()) {
            console.log('✅ ECS实例ID:', instanceId.trim());
        }
        
        // 获取ECS内网IP
        const { stdout: privateIP } = await execAsync('curl -s --connect-timeout 3 http://100.100.100.200/latest/meta-data/private-ipv4');
        if (privateIP && privateIP.trim()) {
            console.log('🏠 ECS内网IP:', privateIP.trim());
            console.log('💡 请确保此IP已添加到RDS白名单中');
        }
        
        // 获取ECS所在区域
        const { stdout: region } = await execAsync('curl -s --connect-timeout 3 http://100.100.100.200/latest/meta-data/region-id');
        if (region && region.trim()) {
            console.log('🌍 ECS所在区域:', region.trim());
        }
        
        // 获取ECS所在可用区
        const { stdout: zone } = await execAsync('curl -s --connect-timeout 3 http://100.100.100.200/latest/meta-data/zone-id');
        if (zone && zone.trim()) {
            console.log('📍 ECS可用区:', zone.trim());
        }
        
    } catch (error) {
        console.log('⚠️  无法获取ECS元数据，可能不在阿里云环境中');
    }

    // 2. 检查DNS解析
    console.log('\n🔍 2. 检查RDS域名解析...');
    try {
        const { stdout } = await execAsync(`nslookup ${dbHost}`);
        console.log('✅ DNS解析成功');
        
        // 提取IP地址
        const ipMatch = stdout.match(/Address:\s*(\d+\.\d+\.\d+\.\d+)/);
        if (ipMatch) {
            console.log('🎯 RDS解析IP:', ipMatch[1]);
        }
    } catch (error) {
        console.log('❌ DNS解析失败:', error.message);
        console.log('💡 建议检查网络配置和DNS设置');
    }

    // 3. 检查网络连通性
    console.log('\n🔍 3. 检查网络连通性...');
    try {
        // Windows环境使用Test-NetConnection
        const { stdout } = await execAsync(`powershell -Command "Test-NetConnection -ComputerName ${dbHost} -Port ${dbPort} -InformationLevel Quiet"`);
        if (stdout.trim() === 'True') {
            console.log('✅ 网络连通性正常');
        } else {
            console.log('❌ 网络连接失败');
        }
    } catch (error) {
        console.log('❌ 网络连接测试失败');
        console.log('💡 可能原因:');
        console.log('   1. RDS白名单未包含ECS IP');
        console.log('   2. ECS安全组出站规则限制');
        console.log('   3. RDS实例状态异常');
    }

    // 4. 测试数据库连接
    console.log('\n🔍 4. 测试数据库连接...');
    const config = {
        host: dbHost,
        port: parseInt(dbPort),
        user: dbUser,
        password: process.env.DB_PASSWORD,
        database: dbName,
        charset: 'utf8mb4',
        connectTimeout: 10000,
        ssl: false
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ 数据库连接成功!');
        
        // 获取数据库信息
        const [versionRows] = await connection.execute('SELECT VERSION() as version');
        console.log('📊 MySQL版本:', versionRows[0].version);
        
        const [timeRows] = await connection.execute('SELECT NOW() as server_time');
        console.log('⏰ 服务器时间:', timeRows[0].server_time);
        
        // 检查数据库是否存在
        const [dbRows] = await connection.execute('SHOW DATABASES LIKE ?', [dbName]);
        if (dbRows.length > 0) {
            console.log('✅ 目标数据库存在');
            
            // 检查表结构
            await connection.execute(`USE ${dbName}`);
            const [tables] = await connection.execute('SHOW TABLES');
            console.log(`📋 数据库中共有 ${tables.length} 个表`);
            
            if (tables.length > 0) {
                console.log('📊 表列表:');
                tables.forEach((table, index) => {
                    const tableName = table[`Tables_in_${dbName}`];
                    console.log(`   ${index + 1}. ${tableName}`);
                });
            }
        } else {
            console.log('⚠️  目标数据库不存在，需要初始化');
        }
        
        await connection.end();
        
        console.log('\n🎉 所有测试通过! RDS连接正常');
        
    } catch (error) {
        console.log('❌ 数据库连接失败:');
        console.log('错误代码:', error.code);
        console.log('错误信息:', error.message);
        
        console.log('\n💡 针对阿里云RDS的解决方案:');
        
        if (error.code === 'ENOTFOUND') {
            console.log('🔧 DNS解析问题:');
            console.log('   1. 确认RDS实例ID是否正确');
            console.log('   2. 检查RDS实例是否在同一地域');
            console.log('   3. 验证内网地址格式');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.log('🔧 网络连接问题:');
            console.log('   1. 登录阿里云控制台');
            console.log('   2. RDS管理 -> 数据安全性 -> 白名单设置');
            console.log('   3. 添加ECS内网IP到白名单');
            console.log('   4. 检查ECS安全组出站规则');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('🔧 认证问题:');
            console.log('   1. 检查数据库用户名和密码');
            console.log('   2. 确认用户权限设置');
            console.log('   3. 验证用户主机访问权限');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('🔧 数据库问题:');
            console.log('   1. 确认数据库名称是否正确');
            console.log('   2. 检查用户是否有访问权限');
            console.log('   3. 可能需要先创建数据库');
        }
        
        console.log('\n🔗 阿里云官方文档:');
        console.log('   - RDS白名单: https://help.aliyun.com/document_detail/43185.html');
        console.log('   - ECS连接RDS: https://help.aliyun.com/document_detail/26128.html');
        console.log('   - 安全组配置: https://help.aliyun.com/document_detail/25471.html');
    }
    
    console.log('\n=====================================');
    console.log('诊断完成');
    console.log('=====================================');
}

// 运行诊断
checkAliyunRDS().catch(console.error);