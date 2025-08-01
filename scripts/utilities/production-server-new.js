/**
 * 生产环境服务器配置 - 重新部署版本
 * 用于ECS部署，同时提供前端静态文件和后端API服务
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// 静态文件服务 - 提供前端构建后的文件
app.use(express.static(path.join(__dirname, 'qianduan/dist')));

// API代理到后端服务
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('API代理错误:', err.message);
        res.status(500).json({
            error: '后端服务不可用',
            message: '请检查后端服务是否正常运行'
        });
    }
}));

// 上传文件代理
app.use('/uploads', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true
}));

// SPA路由处理 - 所有非API请求都返回index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'qianduan/dist/index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'production' ? '请稍后重试' : err.message
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 生产服务器运行在端口 ${PORT}`);
    console.log(`🌐 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 公网访问: http://116.62.44.24:${PORT}`);
    console.log(`📱 API代理: http://localhost:${PORT}/api -> http://localhost:3000/api`);
    console.log(`📁 静态文件: ${path.join(__dirname, 'qianduan/dist')}`);
});

module.exports = app;