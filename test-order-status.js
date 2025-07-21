/**
 * 测试订单状态更新功能
 */

const axios = require('axios');

async function testOrderStatus() {
    try {
        console.log('🔍 测试订单状态更新功能...');
        
        // 1. 登录获取token
        console.log('1️⃣ 登录获取token...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'testlogin',
            password: '123456'
        });
        
        if (loginResponse.data.status === 'success') {
            const token = loginResponse.data.data.token;
            console.log('✅ 登录成功');
            
            // 2. 获取订单列表
            console.log('2️⃣ 获取订单列表...');
            const ordersResponse = await axios.get('http://localhost:3000/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (ordersResponse.data.status === 'success') {
                const orders = ordersResponse.data.data.orders;
                console.log('✅ 获取订单列表成功');
                console.log('📋 订单数量:', orders.length);
                
                if (orders.length > 0) {
                    const order = orders[0];
                    console.log('📄 第一个订单:', {
                        id: order.id,
                        status: order.status,
                        renter_id: order.renter_id,
                        owner_id: order.owner_id
                    });
                    
                    // 3. 测试状态更新（如果有待确认的订单）
                    if (order.status === 'pending') {
                        console.log('3️⃣ 测试确认订单...');
                        try {
                            const updateResponse = await axios.put(`http://localhost:3000/api/orders/${order.id}/status`, {
                                status: 'confirmed'
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            
                            if (updateResponse.data.status === 'success') {
                                console.log('✅ 订单确认成功');
                            } else {
                                console.log('❌ 订单确认失败:', updateResponse.data.message);
                            }
                        } catch (error) {
                            console.log('❌ 订单确认失败:', error.response?.data?.message || error.message);
                        }
                    } else {
                        console.log('ℹ️  没有待确认的订单，当前状态:', order.status);
                    }
                } else {
                    console.log('ℹ️  没有订单数据');
                }
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

testOrderStatus();