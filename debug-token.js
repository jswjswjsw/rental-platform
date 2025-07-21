/**
 * 调试Token问题
 */

// 模拟浏览器localStorage
const localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    }
};

// 模拟前端的token管理
const TOKEN_KEY = 'rental_token';

const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

// 测试JWT解析
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

async function debugToken() {
    console.log('🔍 调试Token问题...');
    
    // 检查localStorage中的token
    const token = getToken();
    console.log('📋 当前Token:', token ? '存在' : '不存在');
    
    if (token) {
        console.log('🔑 Token内容:', token.substring(0, 50) + '...');
        
        // 解析JWT
        const payload = parseJWT(token);
        if (payload) {
            console.log('📄 Token载荷:', payload);
            console.log('👤 用户ID:', payload.userId);
            console.log('👤 用户名:', payload.username);
            console.log('⏰ 签发时间:', new Date(payload.iat * 1000));
            console.log('⏰ 过期时间:', new Date(payload.exp * 1000));
            console.log('⏰ 当前时间:', new Date());
            
            const isExpired = payload.exp * 1000 < Date.now();
            console.log('⚠️  Token状态:', isExpired ? '已过期' : '有效');
        } else {
            console.log('❌ Token格式无效');
        }
        
        // 测试API调用
        const axios = require('axios');
        try {
            console.log('\n🌐 测试API调用...');
            const response = await axios.get('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ API调用成功');
            console.log('📄 用户信息:', response.data.data.user);
        } catch (error) {
            console.log('❌ API调用失败');
            if (error.response) {
                console.log('状态码:', error.response.status);
                console.log('错误信息:', error.response.data);
            } else {
                console.log('网络错误:', error.message);
            }
        }
    } else {
        console.log('💡 建议：请先登录获取Token');
    }
}

debugToken();