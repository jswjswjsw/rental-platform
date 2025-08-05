/**
 * 文件上传中间件模块
 * 
 * 功能说明：
 * - 使用Multer处理多媒体文件上传
 * - 支持单文件和多文件上传
 * - 自动创建上传目录结构
 * - 文件类型和大小验证
 * - 生成唯一文件名防止冲突
 * 
 * 上传配置：
 * - 支持的文件类型：JPEG, PNG, GIF, WebP
 * - 单文件最大大小：5MB
 * - 最大文件数量：10个
 * - 存储路径：./uploads/resources 和 ./uploads/avatars
 * 
 * 安全特性：
 * - 文件类型白名单验证
 * - 文件大小限制
 * - 唯一文件名生成
 * - 错误处理和清理
 * 
 * 目录结构：
 * - uploads/resources/ - 资源图片
 * - uploads/avatars/ - 用户头像
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_PATH || './uploads';
const resourcesDir = path.join(uploadDir, 'resources');
const avatarsDir = path.join(uploadDir, 'avatars');

// 创建上传目录
[uploadDir, resourcesDir, avatarsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 创建上传目录: ${dir}`);
    }
});

// 存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 根据上传类型选择目录
        let uploadPath = resourcesDir;
        if (req.route.path.includes('avatar')) {
            uploadPath = avatarsDir;
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳_随机数.扩展名
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的图片类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)'), false);
    }
};

// 创建multer实例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        files: 10 // 最多10个文件
    },
    fileFilter: fileFilter
});

/**
 * 单个文件上传中间件
 */
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            status: 'error',
                            message: '文件大小不能超过5MB'
                        });
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({
                            status: 'error',
                            message: '文件数量超出限制'
                        });
                    }
                }
                return res.status(400).json({
                    status: 'error',
                    message: err.message || '文件上传失败'
                });
            }
            next();
        });
    };
};

/**
 * 多个文件上传中间件
 */
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            status: 'error',
                            message: '文件大小不能超过5MB'
                        });
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({
                            status: 'error',
                            message: `最多只能上传${maxCount}个文件`
                        });
                    }
                }
                return res.status(400).json({
                    status: 'error',
                    message: err.message || '文件上传失败'
                });
            }
            next();
        });
    };
};

/**
 * 删除文件工具函数
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ 删除文件: ${filePath}`);
        }
    } catch (error) {
        console.error('删除文件失败:', error);
    }
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    deleteFile
};