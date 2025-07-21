/**
 * 测试完整的认证流程
 */

const axios = require('axios');

async function testAuthFlow() {
    try {
        console.log('🔍 测试完整认证流程...');
        
        // 1. 登录获取token
        console.log('\n1️⃣ 测试登录...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'testlogin',
            password: '123456'
        });
        
        if (loginResponse.data.status === 'success') {
            console.log('✅ 登录成功');
            const token = loginResponse.data.data.token;
            const user = loginResponse.data.data.user;
            console.log('👤 用户信息:', user);
            console.log('🔑 Token:', token.substring(0, 50) + '...');
            
            // 2. 测试获取用户信息
            console.log('\n2️⃣ 测试获取用户信息...');
            const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (meResponse.data.status === 'success') {
                console.log('✅ 获取用户信息成功');
                console.log('👤 用户详情:', meResponse.data.data.user);
            } else {
                console.log('❌ 获取用户信息失败:', meResponse.data.message);
            }
            
            // 3. 测试获取订单列表
            console.log('\n3️⃣ 测试获取订单列表...');
            const ordersResponse = await axios.get('http://localhost:3000/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (ordersResponse.data.status === 'success') {
                console.log('✅ 获取订单列表成功');
                console.log('📋 订单数量:', ordersResponse.data.data.orders.length);
                console.log('📄 订单列表:', ordersResponse.data.data.orders);
            } else {
                console.log('❌ 获取订单列表失败:', ordersResponse.data.message);
            }
            
        } else {
            console.log('❌ 登录失败:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ 测试失败');
        
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('错误信息:', error.response.data);
        } else {
            console.error('网络错误:', error.message);
        }
    }
}

testAuthFlow();