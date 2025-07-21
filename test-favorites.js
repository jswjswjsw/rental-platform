/**
 * 测试收藏功能
 */

const axios = require('axios');

async function testFavorites() {
    try {
        console.log('🔍 测试收藏功能...');
        
        // 1. 登录获取token
        console.log('1️⃣ 登录获取token...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'testlogin',
            password: '123456'
        });
        
        if (loginResponse.data.status === 'success') {
            const token = loginResponse.data.data.token;
            console.log('✅ 登录成功');
            
            // 2. 测试添加收藏
            console.log('2️⃣ 测试添加收藏...');
            try {
                const addResponse = await axios.post('http://localhost:3000/api/favorites', {
                    resource_id: 1
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (addResponse.data.status === 'success') {
                    console.log('✅ 添加收藏成功');
                } else {
                    console.log('❌ 添加收藏失败:', addResponse.data.message);
                }
            } catch (error) {
                console.log('❌ 添加收藏失败:', error.response?.data?.message || error.message);
            }
            
            // 3. 测试检查收藏状态
            console.log('3️⃣ 测试检查收藏状态...');
            try {
                const checkResponse = await axios.get('http://localhost:3000/api/favorites/check/1', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (checkResponse.data.status === 'success') {
                    console.log('✅ 检查收藏状态成功');
                    console.log('📄 收藏状态:', checkResponse.data.data.isFavorited);
                } else {
                    console.log('❌ 检查收藏状态失败:', checkResponse.data.message);
                }
            } catch (error) {
                console.log('❌ 检查收藏状态失败:', error.response?.data?.message || error.message);
            }
            
            // 4. 测试获取收藏列表
            console.log('4️⃣ 测试获取收藏列表...');
            try {
                const listResponse = await axios.get('http://localhost:3000/api/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (listResponse.data.status === 'success') {
                    console.log('✅ 获取收藏列表成功');
                    console.log('📋 收藏数量:', listResponse.data.data.favorites.length);
                    listResponse.data.data.favorites.forEach(fav => {
                        console.log(`   - ${fav.title} (ID: ${fav.resource_id})`);
                    });
                } else {
                    console.log('❌ 获取收藏列表失败:', listResponse.data.message);
                }
            } catch (error) {
                console.log('❌ 获取收藏列表失败:', error.response?.data?.message || error.message);
            }
            
            // 5. 测试取消收藏
            console.log('5️⃣ 测试取消收藏...');
            try {
                const removeResponse = await axios.delete('http://localhost:3000/api/favorites/1', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (removeResponse.data.status === 'success') {
                    console.log('✅ 取消收藏成功');
                } else {
                    console.log('❌ 取消收藏失败:', removeResponse.data.message);
                }
            } catch (error) {
                console.log('❌ 取消收藏失败:', error.response?.data?.message || error.message);
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

testFavorites();