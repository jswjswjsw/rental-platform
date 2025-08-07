/**
 * 简单的静态文件服务器
 * 用于直接访问test.html等静态文件
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 提供静态文件服务
app.use(express.static(__dirname));

// API代理到后端
app.use('/api', (req, res) => {
    res.redirect(`http://localhost:3000${req.originalUrl}`);
});

app.listen(PORT, () => {
    console.log(`🌐 静态文件服务器运行在: http://localhost:${PORT}`);
    console.log(`📄 测试页面: http://localhost:${PORT}/test.html`);
    console.log(`🔧 请确保后端服务运行在端口3000`);
});