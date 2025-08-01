/**
 * 测试用户资源接口
 */

const axios = require('axios');

async function testUserResources() {
    try {
        console.log('🔍 测试用户资源接口...');
        
        // 1. 先登录获取token
        console.log('1️⃣ 登录获取token...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'testlogin',
            password: '123456'
        });
        
        if (loginResponse.data.status === 'success') {
            const token = loginResponse.data.data.token;
            console.log('✅ 登录成功');
            
            // 2. 先测试/auth/me接口
            console.log('2️⃣ 测试/auth/me接口...');
            const meResponse = await axios.get('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (meResponse.data.status === 'success') {
                console.log('✅ /auth/me接口正常');
                console.log('👤 用户信息:', meResponse.data.data.user);
            } else {
                console.log('❌ /auth/me接口失败:', meResponse.data.message);
                return;
            }
            
            // 3. 测试获取用户资源
            console.log('3️⃣ 测试获取用户资源...');
            const resourcesResponse = await axios.get('http://localhost:3000/api/users/resources', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (resourcesResponse.data.status === 'success') {
                console.log('✅ 获取用户资源成功');
                console.log('📋 资源数量:', resourcesResponse.data.data.resources.length);
                console.log('📄 资源列表:', resourcesResponse.data.data.resources);
            } else {
                console.log('❌ 获取用户资源失败:', resourcesResponse.data.message);
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

testUserResources();