/**
 * 阿里云ECS连接RDS诊断脚本
 * 专门用于排查阿里云环境下的数据库连接问题
 */

const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

require('dotenv').config({ path: './houduan/.env' });

async function checkAliyunRDS() {
    console.log('🔍 阿里云ECS -> RDS连接诊断\n');
    
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || 3306;
    
    // 验证必要的环境变量
    if (!dbHost || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
        console.log('❌ 缺少必要的环境变量，请检查 .env 文件');
        console.log('需要的变量: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
        return;
    }
    
    console.log('📋 当前配置:');
    console.log(`   RDS地址: ${dbHost}`);
    console.log(`   端口: ${dbPort}`);
    console.log(`   用户: ${process.env.DB_USER}`);
    console.log(`   数据库: ${process.env.DB_NAME}\n`);

    // 1. 检查ECS元数据（确认在阿里云环境）
    console.log('🔍 1. 检查ECS环境...');
    try {
        // Windows PowerShell equivalent of curl
        const { stdout } = await execAsync('powershell -Command "try { (Invoke-WebRequest -Uri http://100.100.100.200/latest/meta-data/instance-id -TimeoutSec 3).Content } catch { $null }"');
        if (stdout && stdout.trim()) {
            console.log('✅ 确认运行在阿里云ECS上，实例ID:', stdout.trim());
        } else {
            console.log('⚠️  可能不在阿里云ECS环境中');
        }
    } catch (error) {
        console.log('⚠️  无法获取ECS元数据，可能不在阿里云环境中');
    }

    // 2. 获取ECS内网IP
    console.log('\n🔍 2. 获取ECS网络信息...');
    try {
        const { stdout: privateIP } = await execAsync('powershell -Command "try { (Invoke-WebRequest -Uri http://100.100.100.200/latest/meta-data/private-ipv4 -TimeoutSec 3).Content } catch { $null }"');
        if (privateIP && privateIP.trim()) {
            console.log('🏠 ECS内网IP:', privateIP.trim());
        }
        
        const { stdout: publicIP } = await execAsync('powershell -Command "try { (Invoke-WebRequest -Uri http://100.100.100.200/latest/meta-data/public-ipv4 -TimeoutSec 3).Content } catch { $null }"');
        if (publicIP && publicIP.trim()) {
            console.log('🌐 ECS公网IP:', publicIP.trim());
        } else {
            console.log('🌐 ECS公网IP: 未分配');
        }
    } catch (error) {
        console.log('❌ 无法获取ECS IP信息');
    }

    // 3. 检查DNS解析
    console.log('\n🔍 3. 检查RDS域名解析...');
    try {
        const { stdout } = await execAsync(`nslookup ${dbHost}`);
        console.log('✅ DNS解析结果:');
        console.log(stdout);
    } catch (error) {
        console.log('❌ DNS解析失败:', error.message);
    }

    // 4. 检查网络连通性
    console.log('🔍 4. 检查网络连通性...');
    try {
        // Windows PowerShell equivalent of port connectivity test
        await execAsync(`powershell -Command "Test-NetConnection -ComputerName ${dbHost} -Port ${dbPort} -InformationLevel Quiet"`, { timeout: 10000 });
        console.log('✅ 端口连通性正常');
    } catch (error) {
        console.log('❌ 端口连接失败 - 可能原因:');
        console.log('   1. RDS白名单未添加ECS IP');
        console.log('   2. 安全组规则限制');
        console.log('   3. RDS实例状态异常');
    }

    // 5. 尝试数据库连接
    console.log('\n🔍 5. 尝试数据库连接...');
    const config = {
        host: dbHost,
        port: parseInt(dbPort),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        connectTimeout: 10000,
        ssl: false
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ 数据库连接成功!');
        
        // 测试查询
        const [rows] = await connection.execute('SELECT VERSION() as version, NOW() as current_time');
        console.log('📊 数据库信息:', rows[0]);
        
        await connection.end();
        console.log('🎉 所有测试通过!');
        
    } catch (error) {
        console.log('❌ 数据库连接失败:');
        console.log('错误代码:', error.code);
        console.log('错误信息:', error.message);
        
        // 针对阿里云RDS的具体建议
        console.log('\n💡 阿里云RDS连接问题解决步骤:');
        
        if (error.code === 'ENOTFOUND') {
            console.log('1. 检查RDS实例是否正常运行');
            console.log('2. 确认RDS连接地址是否正确');
            console.log('3. 检查ECS与RDS是否在同一地域');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.log('1. 登录阿里云控制台 -> RDS管理');
            console.log('2. 选择你的RDS实例 -> 数据安全性 -> 白名单设置');
            console.log('3. 添加ECS内网IP到白名单');
            console.log('4. 检查ECS安全组是否允许出站3306端口');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('1. 检查数据库用户名和密码');
            console.log('2. 确认用户权限设置');
            console.log('3. 检查用户是否允许从当前IP连接');
        }
        
        console.log('\n🔗 参考文档:');
        console.log('- 阿里云RDS白名单设置: https://help.aliyun.com/document_detail/43185.html');
        console.log('- ECS安全组配置: https://help.aliyun.com/document_detail/25471.html');
    }
}

checkAliyunRDS().catch(console.error);