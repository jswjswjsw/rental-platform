/**
 * 测试RDS公网连接
 */

const mysql = require('mysql2/promise');
const net = require('net');

// 如果RDS有公网地址，替换这里的地址
const PUBLIC_HOST = 'rm-bp1f62b28m6dxaqhf1219.mysql.rds.aliyuncs.com'; // 替换为公网地址
const PORT = 3306;

async function testPublicConnection() {
    console.log('🔍 测试公网连接...');
    console.log(`主机: ${PUBLIC_HOST}`);
    console.log(`端口: ${PORT}`);
    
    try {
        await testNetworkConnection(PUBLIC_HOST, PORT);
        console.log('✅ 公网连接成功');
    } catch (error) {
        console.error('❌ 公网连接失败:', error.message);
    }
}

function testNetworkConnection(host, port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        
        const timeout = setTimeout(() => {
            socket.destroy();
            reject(new Error('连接超时'));
        }, 10000);
        
        socket.connect(port, host, () => {
            clearTimeout(timeout);
            socket.destroy();
            resolve();
        });
        
        socket.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

testPublicConnection();