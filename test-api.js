/**
 * API测试脚本
 * 用于测试后端API是否正常工作
 */

const axios = require('axios');

async function testAPI() {
    console.log('🧪 开始测试API接口...\n');
    
    const baseURL = 'http://localhost:3000/api';
    
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
            console.log(`❌ 失败: ${error.message}`);
            if (error.response) {
                console.log(`   状态码: ${error.response.status}`);
                console.log(`   响应: ${JSON.stringify(error.response.data)}`);
            }
            console.log('');
        }
    }
    
    console.log('🎯 测试完成！');
}

testAPI();