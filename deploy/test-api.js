/**
 * API测试脚本
 * 用于测试后端API是否正常工作
 */

// 检查依赖是否安装
let axios;
try {
    axios = require('axios');
} catch (error) {
    console.error('❌ axios 模块未安装，请运行: npm install axios');
    process.exit(1);
}

// 加载环境变量
try {
    require('dotenv').config({ path: './houduan/.env' });
} catch (error) {
    console.warn('⚠️ dotenv 模块未安装，使用默认配置');
}

async function testAPI() {
    console.log('🧪 开始测试API接口...\n');
    
    // 使用环境变量或默认值
    const port = process.env.PORT || 3000;
    const baseURL = `http://localhost:${port}/api`;
    
    const tests = [
        {
            name: '健康检查',
            url: `${baseURL}/health`,
            method: 'GET'
        },
        {
            name: '获取资源列表',
            url: `${baseURL}/resources`,
            method: 'GET'
        },
        {
            name: '获取分类列表',
            url: `${baseURL}/categories`,
            method: 'GET'
        },
        {
            name: '测试不存在的接口',
            url: `${baseURL}/nonexistent`,
            method: 'GET',
            expectError: true
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📋 测试: ${test.name}`);
            console.log(`🔗 URL: ${test.url}`);
            
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 5000
            });
            
            console.log(`✅ 状态码: ${response.status}`);
            console.log(`📊 响应: ${JSON.stringify(response.data).substring(0, 100)}...`);
            console.log('');
            
        } catch (error) {
            if (test.expectError) {
                console.log(`✅ 预期错误: ${error.message}`);
            } else {
                console.log(`❌ 失败: ${error.message}`);
            }
            if (error.response) {
                console.log(`   状态码: ${error.response.status}`);
                console.log(`   响应: ${JSON.stringify(error.response.data)}`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log('   💡 提示: 请确保后端服务已启动 (cd houduan && npm start)');
            }
            console.log('');
        }
    }
    
    console.log('🎯 测试完成！');
}

testAPI();