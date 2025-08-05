/**
 * 阿里云函数计算入口文件
 * 适配阿里云FC的HTTP触发器
 */

const app = require('./app');

// 阿里云函数计算HTTP触发器处理函数
exports.handler = (req, resp, context) => {
    console.log('收到请求:', req.method, req.url);
    
    // 设置请求对象
    req.headers = req.headers || {};
    req.body = req.body || '';
    
    // 如果body是base64编码的，需要解码
    if (req.isBase64Encoded && req.body) {
        req.body = Buffer.from(req.body, 'base64').toString();
    }
    
    // 创建响应对象
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
        body: ''
    };
    
    // 使用Express应用处理请求
    const mockReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.queries || {},
        params: req.pathParameters || {}
    };
    
    const mockRes = {
        statusCode: 200,
        headers: {},
        body: '',
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.headers['Content-Type'] = 'application/json';
            this.body = JSON.stringify(data);
            return this;
        },
        send: function(data) {
            this.body = typeof data === 'string' ? data : JSON.stringify(data);
            return this;
        },
        set: function(key, value) {
            this.headers[key] = value;
            return this;
        }
    };
    
    try {
        // 处理OPTIONS预检请求
        if (req.method === 'OPTIONS') {
            response.statusCode = 200;
            resp.send(JSON.stringify(response));
            return;
        }
        
        // 使用Express应用处理请求
        app(mockReq, mockRes);
        
        // 设置响应
        response.statusCode = mockRes.statusCode;
        response.headers = { ...response.headers, ...mockRes.headers };
        response.body = mockRes.body;
        
        resp.send(JSON.stringify(response));
        
    } catch (error) {
        console.error('函数执行错误:', error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            status: 'error',
            message: '服务器内部错误',
            error: error.message
        });
        resp.send(JSON.stringify(response));
    }
};