/**
 * 网络连接检查脚本
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkNetwork() {
    console.log('🌐 网络连接检查...\n');
    
    // 从环境变量读取配置，确保与实际配置一致
    require('dotenv').config({ path: './houduan/.env' });
    const dbHost = process.env.DB_HOST || 'rm-bp1f62b28m6dxaqhf1219.mysql.rds.aliyuncs.com';
    const dbPort = parseInt(process.env.DB_PORT) || 3306;
    
    try {
        // 检查DNS解析
        console.log('🔍 检查DNS解析...');
        try {
            const { stdout } = await execAsync(`nslookup ${dbHost}`);
            console.log('✅ DNS解析成功:');
            console.log(stdout);
        } catch (error) {
            console.log('❌ DNS解析失败:', error.message);
        }
        
        // 检查端口连通性
        console.log('\n🔍 检查端口连通性...');
        try {
            await execAsync(`powershell -Command "Test-NetConnection -ComputerName ${dbHost} -Port ${dbPort} -InformationLevel Quiet"`, { timeout: 10000 });
            console.log('✅ 端口连通性正常');
        } catch (error) {
            console.log('❌ 端口连接失败 - 可能是防火墙或白名单问题');
        }
        
        // 检查本机IP
        console.log('\n🔍 检查本机公网IP...');
        try {
            const { stdout } = await execAsync('powershell -Command "(Invoke-WebRequest -Uri https://ifconfig.me/ip).Content"');
            console.log('🌐 本机公网IP:', stdout.trim());
            console.log('💡 请确保此IP已添加到阿里云RDS白名单中');
        } catch (error) {
            console.log('❌ 无法获取公网IP');
        }
        
    } catch (error) {
        console.error('检查过程中出现错误:', error.message);
    }
}

checkNetwork();