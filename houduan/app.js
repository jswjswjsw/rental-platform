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

// 验证关键环境变量
function validateEnvironment() {
    const requiredVars = ['JWT_SECRET'];
    const missingVars = [];
    
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }
    
    if (missingVars.length > 0) {
        console.error('❌ 缺少必需的环境变量:', missingVars.join(', '));
        console.error('💡 请检查 .env 文件配置');
        process.exit(1);
    }
    
    // 验证JWT_SECRET强度
    if (process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  JWT_SECRET长度不足32位，建议使用更强的密钥');
    }
    
    console.log('✅ 环境变量验证通过');
}

// 执行环境变量验证
validateEnvironment();

const app = express();

// 导入路由模块
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const resourceRoutes = require('./routes/resources');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');

// 安全中间件
app.use(helmet());

// 跨域配置
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'http://localhost:8080', 
            'http://116.62.44.24:8080', 
            'http://116.62.44.24',
            'capacitor://localhost',  // Capacitor iOS
            'https://localhost',      // Capacitor Android
            'ionic://localhost',      // Ionic/Capacitor fallback
            'http://localhost',       // Additional fallback
            'https://localhost:8080', // HTTPS development
            'file://',               // Capacitor file protocol
            'capacitor-electron://',  // Capacitor Electron
            'tauri://'               // Tauri framework
          ]
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
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

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
    
    // 数据库连接错误
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            status: 'error',
            message: '数据库连接失败，请稍后重试',
            code: 'DATABASE_CONNECTION_FAILED'
        });
    }
    
    // 数据库权限错误
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(503).json({
            status: 'error',
            message: '数据库访问权限不足',
            code: 'DATABASE_ACCESS_DENIED'
        });
    }
    
    // 数据库表不存在错误
    if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(503).json({
            status: 'error',
            message: '数据表不存在，请联系管理员',
            code: 'DATABASE_TABLE_MISSING'
        });
    }
    
    // 数据库超时错误
    if (err.code === 'ETIMEDOUT') {
        return res.status(503).json({
            status: 'error',
            message: '数据库连接超时，请稍后重试',
            code: 'DATABASE_TIMEOUT'
        });
    }
    
    // 数据库重复条目错误
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            status: 'error',
            message: '数据已存在',
            code: 'DUPLICATE_ENTRY'
        });
    }
    
    // JWT错误
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: '无效的token',
            code: 'INVALID_TOKEN'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'token已过期',
            code: 'TOKEN_EXPIRED'
        });
    }
    
    // 文件上传错误
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            status: 'error',
            message: '文件大小超出限制',
            code: 'FILE_TOO_LARGE'
        });
    }
    
    // 文件类型错误
    if (err.message && err.message.includes('只允许上传图片文件')) {
        return res.status(400).json({
            status: 'error',
            message: '只允许上传图片文件',
            code: 'INVALID_FILE_TYPE'
        });
    }
    
    // 默认服务器错误
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? '服务器内部错误' 
            : err.message,
        code: 'INTERNAL_SERVER_ERROR'
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('==========================================');
    console.log('🚀 闲置租赁平台 - 后端API服务启动成功');
    console.log('==========================================');
    console.log(`📍 服务端口: ${PORT}`);
    console.log(`🌐 本地访问: http://localhost:${PORT}/api`);
    console.log(`🌐 公网访问: http://116.62.44.24:${PORT}/api`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
    console.log(`🔧 环境模式: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log('==========================================');
});

module.exports = app;