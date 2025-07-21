/**
 * 闲置资源租赁平台后端主应用文件
 * 
 * 功能说明：
 * - 使用Express框架构建RESTful API
 * - 集成安全中间件（Helmet、CORS、限流）
 * - 配置静态文件服务和文件上传
 * - 统一错误处理和API路由管理
 * - 提供健康检查接口
 * 
 * 技术栈：
 * - Express.js - Web应用框架
 * - Helmet - 安全头设置
 * - CORS - 跨域资源共享
 * - express-rate-limit - API限流
 * - dotenv - 环境变量管理
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 加载环境变量配置
require('dotenv').config();

const app = express();

// 导入路由模块
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const resourceRoutes = require('./routes/resources');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');

// 安全中间件
app.use(helmet());

// 跨域配置
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['http://localhost:8080'] // 生产环境允许的域名
        : true, // 开发环境允许所有域名
    credentials: true
}));

// 请求限制中间件
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: {
        error: '请求过于频繁，请稍后再试'
    }
});
app.use('/api/', limiter);

// 解析JSON和URL编码的请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);

// 数据库初始化路由（临时）
const initRoutes = require('./routes/init');
app.use('/api/init', initRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: '接口不存在'
    });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    
    // 数据库错误
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            status: 'error',
            message: '数据已存在'
        });
    }
    
    // JWT错误
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: '无效的token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'token已过期'
        });
    }
    
    // 文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            status: 'error',
            message: '文件大小超出限制'
        });
    }
    
    // 默认服务器错误
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? '服务器内部错误' 
            : err.message
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📱 API地址: http://localhost:${PORT}/api`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;