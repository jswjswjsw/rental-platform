/**
 * 支付功能调试脚本
 * 
 * 功能说明：
 * - 检查前后端连接状态
 * - 测试支付API接口
 * - 验证数据库表结构
 * - 诊断支付按钮无响应问题
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-04
 */

const axios = require('axios');
const { promisePool } = require('./houduan/config/database');

// 配置
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8080';

/**
 * 检查后端服务状态
 */
async function checkBackendStatus() {
    console.log('\n=== 检查后端服务状态 ===');
    
    try {
        const response = await axios.get(`${BACKEND_URL}/api/health`, {
            timeout: 5000
        });
        
        console.log('✅ 后端服务正常运行');
        console.log('响应数据:', response.data);
        return true;
    } catch (error) {
        console.log('❌ 后端服务连接失败');
        console.log('错误信息:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 建议：请确保后端服务已启动 (npm run dev 在 houduan 目录)');
        }
        
        return false;
    }
}

/**
 * 检查数据库连接和表结构
 */
async function checkDatabase() {
    console.log('\n=== 检查数据库连接和表结构 ===');
    
    try {
        // 检查数据库连接
        const [rows] = await promisePool.execute('SELECT 1 as test');
        console.log('✅ 数据库连接正常');
        
        // 检查关键表是否存在
        const tables = ['users', 'rental_orders', 'payments', 'resources'];
        
        for (const table of tables) {
            try {
                const [result] = await promisePool.execute(`SHOW TABLES LIKE '${table}'`);
                if (result.length > 0) {
                    console.log(`✅ 表 ${table} 存在`);
                    
                    // 检查payments表结构
                    if (table === 'payments') {
                        const [columns] = await promisePool.execute(`DESCRIBE ${table}`);
                        console.log(`📋 ${table} 表结构:`, columns.map(col => col.Field).join(', '));
                    }
                } else {
                    console.log(`❌ 表 ${table} 不存在`);
                }
            } catch (error) {
                console.log(`❌ 检查表 ${table} 时出错:`, error.message);
            }
        }
        
        return true;
    } catch (error) {
        console.log('❌ 数据库连接失败');
        console.log('错误信息:', error.message);
        return false;
    }
}

/**
 * 测试支付API接口
 */
async function testPaymentAPI() {
    console.log('\n=== 测试支付API接口 ===');
    
    try {
        // 测试不需要认证的接口
        const response = await axios.get(`${BACKEND_URL}/api/health`);
        console.log('✅ 基础API连接正常');
        
        // 测试支付相关接口（需要模拟认证）
        console.log('⚠️  支付接口需要用户认证，无法直接测试');
        console.log('💡 建议：在浏览器开发者工具中检查网络请求');
        
        return true;
    } catch (error) {
        console.log('❌ API测试失败');
        console.log('错误信息:', error.message);
        return false;
    }
}

/**
 * 检查前端服务状态
 */
async function checkFrontendStatus() {
    console.log('\n=== 检查前端服务状态 ===');
    
    try {
        const response = await axios.get(FRONTEND_URL, {
            timeout: 5000
        });
        
        console.log('✅ 前端服务正常运行');
        return true;
    } catch (error) {
        console.log('❌ 前端服务连接失败');
        console.log('错误信息:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 建议：请确保前端服务已启动 (npm run dev 在 qianduan 目录)');
        }
        
        return false;
    }
}

/**
 * 检查环境变量配置
 */
async function checkEnvironmentConfig() {
    console.log('\n=== 检查环境变量配置 ===');
    
    try {
        // 检查后端环境变量
        const path = require('path');
        require('dotenv').config({ path: path.join(__dirname, 'houduan', '.env') });
        
        const requiredEnvVars = [
            'DB_HOST',
            'DB_USER', 
            'DB_PASSWORD',
            'DB_NAME',
            'JWT_SECRET'
        ];
        
        let allConfigured = true;
        
        for (const envVar of requiredEnvVars) {
            if (process.env[envVar]) {
                console.log(`✅ ${envVar} 已配置`);
            } else {
                console.log(`❌ ${envVar} 未配置`);
                allConfigured = false;
            }
        }
        
        // 检查微信支付配置（可选）
        const wechatEnvVars = ['WECHAT_APP_ID', 'WECHAT_MCH_ID', 'WECHAT_API_KEY'];
        console.log('\n微信支付配置（可选）:');
        
        for (const envVar of wechatEnvVars) {
            if (process.env[envVar]) {
                console.log(`✅ ${envVar} 已配置`);
            } else {
                console.log(`⚠️  ${envVar} 未配置（开发环境可使用模拟支付）`);
            }
        }
        
        return allConfigured;
    } catch (error) {
        console.log('❌ 环境变量检查失败');
        console.log('错误信息:', error.message);
        return false;
    }
}

/**
 * 生成诊断报告
 */
function generateDiagnosticReport(results) {
    console.log('\n' + '='.repeat(50));
    console.log('🔍 支付功能诊断报告');
    console.log('='.repeat(50));
    
    const { backend, database, frontend, environment } = results;
    
    console.log('\n📊 检查结果汇总:');
    console.log(`后端服务: ${backend ? '✅ 正常' : '❌ 异常'}`);
    console.log(`数据库: ${database ? '✅ 正常' : '❌ 异常'}`);
    console.log(`前端服务: ${frontend ? '✅ 正常' : '❌ 异常'}`);
    console.log(`环境配置: ${environment ? '✅ 正常' : '❌ 异常'}`);
    
    console.log('\n🔧 可能的问题和解决方案:');
    
    if (!backend) {
        console.log('❌ 后端服务问题:');
        console.log('   - 确保在 houduan 目录运行: npm run dev');
        console.log('   - 检查端口3000是否被占用');
        console.log('   - 查看后端控制台错误信息');
    }
    
    if (!database) {
        console.log('❌ 数据库问题:');
        console.log('   - 检查MySQL服务是否启动');
        console.log('   - 验证数据库连接配置');
        console.log('   - 运行数据库初始化脚本');
    }
    
    if (!frontend) {
        console.log('❌ 前端服务问题:');
        console.log('   - 确保在 qianduan 目录运行: npm run dev');
        console.log('   - 检查端口8080是否被占用');
        console.log('   - 查看前端控制台错误信息');
    }
    
    if (!environment) {
        console.log('❌ 环境配置问题:');
        console.log('   - 检查 houduan/.env 文件是否存在');
        console.log('   - 确保所有必需的环境变量都已配置');
    }
    
    console.log('\n💡 支付按钮无响应的常见原因:');
    console.log('1. 前后端服务未正常启动');
    console.log('2. API请求被CORS策略阻止');
    console.log('3. 用户未登录或Token过期');
    console.log('4. 网络请求超时或失败');
    console.log('5. JavaScript控制台有错误信息');
    console.log('6. 支付相关数据库表缺失');
    
    console.log('\n🛠️  调试建议:');
    console.log('1. 打开浏览器开发者工具');
    console.log('2. 查看Console标签页的错误信息');
    console.log('3. 查看Network标签页的网络请求');
    console.log('4. 检查请求是否发送成功');
    console.log('5. 查看响应状态码和错误信息');
    
    console.log('\n' + '='.repeat(50));
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始诊断支付功能问题...\n');
    
    const results = {
        backend: await checkBackendStatus(),
        database: await checkDatabase(),
        frontend: await checkFrontendStatus(),
        environment: await checkEnvironmentConfig()
    };
    
    await testPaymentAPI();
    
    generateDiagnosticReport(results);
}

// 运行诊断
if (require.main === module) {
    main().catch(error => {
        console.error('诊断过程中发生错误:', error);
        process.exit(1);
    });
}

module.exports = { main };