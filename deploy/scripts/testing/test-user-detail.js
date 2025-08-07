/**
 * 测试用户详情接口
 */

const axios = require('axios');

async function testUserDetail() {
    try {
        console.log('🔍 测试用户详情接口...');
        
        // 1. 登录获取token
        console.log('1️⃣ 登录获取token...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'testlogin',
            password: '123456'
        });
        
        if (loginResponse.data.status === 'success') {
            const token = loginResponse.data.data.token;
            const currentUser = loginResponse.data.data.user;
            console.log('✅ 登录成功');
            console.log('👤 当前用户:', currentUser);
            
            // 2. 测试获取自己的用户详情
            console.log('2️⃣ 测试获取自己的用户详情...');
            try {
                const selfResponse = await axios.get(`http://localhost:3000/api/users/${currentUser.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (selfResponse.data.status === 'success') {
                    console.log('✅ 获取自己的用户详情成功');
                    console.log('📄 用户详情:', selfResponse.data.data.user);
                } else {
                    console.log('❌ 获取自己的用户详情失败:', selfResponse.data.message);
                }
            } catch (error) {
                console.log('❌ 获取自己的用户详情失败:', error.response?.data?.message || error.message);
            }
            
            // 3. 测试获取其他用户的详情
            console.log('3️⃣ 测试获取其他用户的详情...');
            const otherUserId = currentUser.id === 3 ? 6 : 3; // 测试另一个用户ID
            
            try {
                const otherResponse = await axios.get(`http://localhost:3000/api/users/${otherUserId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (otherResponse.data.status === 'success') {
                    console.log('✅ 获取其他用户详情成功');
                    console.log('📄 其他用户详情:', otherResponse.data.data.user);
                } else {
                    console.log('❌ 获取其他用户详情失败:', otherResponse.data.message);
                }
            } catch (error) {
                console.log('❌ 获取其他用户详情失败:', error.response?.data?.message || error.message);
                console.log('状态码:', error.response?.status);
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

testUserDetail();