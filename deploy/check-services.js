/**
 * 服务状态检查脚本
 * 
 * 功能说明：
 * - 检查前后端服务是否正常运行
 * - 提供启动服务的建议
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-04
 */

const http = require('http');

/**
 * 检查服务状态
 */
function checkService(host, port, name) {
    return new Promise((resolve) => {
        const req = http.get(`http://${host}:${port}`, (res) => {
            console.log(`✅ ${name} 服务正常运行 (${host}:${port})`);
            resolve(true);
        });

        req.on('error', (error) => {
            console.log(`❌ ${name} 服务未运行 (${host}:${port})`);
            console.log(`   错误: ${error.message}`);
            resolve(false);
        });

        req.setTimeout(3000, () => {
            req.destroy();
            console.log(`❌ ${name} 服务连接超时 (${host}:${port})`);
            resolve(false);
        });
    });
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 检查服务状态...\n');

    const backendRunning = await checkService('localhost', 3000, '后端API');
    const frontendRunning = await checkService('localhost', 8080, '前端Web');

    console.log('\n' + '='.repeat(50));
    console.log('📊 服务状态汇总');
    console.log('='.repeat(50));
    console.log(`后端服务 (3000): ${backendRunning ? '✅ 运行中' : '❌ 未运行'}`);
    console.log(`前端服务 (8080): ${frontendRunning ? '✅ 运行中' : '❌ 未运行'}`);

    if (!backendRunning || !frontendRunning) {
        console.log('\n🚀 启动服务建议:');
        
        if (!backendRunning) {
            console.log('启动后端服务:');
            console.log('  cd houduan');
            console.log('  npm run dev');
            console.log('');
        }
        
        if (!frontendRunning) {
            console.log('启动前端服务:');
            console.log('  cd qianduan');
            console.log('  npm run dev');
            console.log('');
        }
        
        console.log('或者运行一键启动脚本:');
        console.log('  start-all-services.bat');
    } else {
        console.log('\n🎉 所有服务都在正常运行！');
        console.log('前端访问地址: http://localhost:8080');
        console.log('后端API地址: http://localhost:3000/api');
    }

    console.log('\n💡 支付按钮无响应的解决方案:');
    console.log('1. 确保前后端服务都在运行');
    console.log('2. 检查浏览器控制台是否有错误');
    console.log('3. 确认用户已登录');
    console.log('4. 检查网络请求是否成功发送');
    console.log('='.repeat(50));
}

main().catch(console.error);