/**
 * 测试注册功能
 */

const axios = require('axios');

async function testRegister() {
    try {
        console.log('🔍 测试注册功能...');
        
        // 测试数据
        const testData = {
            username: 'testuser' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: '123456',
            phone: '13800138000',
            real_name: '测试用户'
        };
        
        console.log('📋 测试数据:', testData);
        
        // 发送注册请求
        const response = await axios.post('http://localhost:3000/api/auth/register', testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ 注册成功');
        console.log('📄 响应数据:', response.data);
        
    } catch (error) {
        console.error('❌ 注册失败');
        
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('错误信息:', error.response.data);
        } else if (error.request) {
            console.error('网络错误:', error.message);
        } else {
            console.error('其他错误:', error.message);
        }
    }
}

testRegister();