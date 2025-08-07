/**
 * 文件上传路由模块
 * 
 * 功能说明：
 * - 处理部署文件上传
 * - 支持ZIP文件上传到服务器
 * - 提供文件上传进度反馈
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// 创建部署文件上传目录
const deploymentDir = path.join(__dirname, '..', 'uploads', 'deployment');
if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
}

// 部署文件存储配置
const deploymentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, deploymentDir);
    },
    filename: function (req, file, cb) {
        // 保持原文件名，添加时间戳避免冲突
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}_${timestamp}${ext}`);
    }
});

// 部署文件过滤器
const deploymentFileFilter = (req, file, cb) => {
    // 允许的文件类型 - 更严格的验证
    const allowedTypes = [
        'application/zip',
        'application/x-zip-compressed'
    ];

    const allowedExtensions = ['.zip'];
    const ext = path.extname(file.originalname).toLowerCase();

    // 必须同时满足MIME类型和文件扩展名检查
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传ZIP文件'), false);
    }
};

// 创建部署文件上传实例
const deploymentUpload = multer({
    storage: deploymentStorage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 1
    },
    fileFilter: deploymentFileFilter
});

/**
 * POST /api/upload/deployment
 * 上传部署文件
 */
router.post('/deployment', (req, res) => {
    deploymentUpload.single('file')(req, res, (err) => {
        if (err) {
            console.error('部署文件上传失败:', err);

            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: 'error',
                        message: '文件大小不能超过100MB'
                    });
                }
            }

            return res.status(400).json({
                status: 'error',
                message: err.message || '文件上传失败'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: '请选择要上传的文件'
            });
        }

        res.json({
            status: 'success',
            message: '文件上传成功',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                path: req.file.path
            }
        });
    });
});

/**
 * GET /api/upload/deployment
 * 获取已上传的部署文件列表
 */
router.get('/deployment', (req, res) => {
    try {
        const files = fs.readdirSync(deploymentDir);
        const fileList = files.map(filename => {
            const filePath = path.join(deploymentDir, filename);
            const stats = fs.statSync(filePath);

            return {
                filename,
                size: stats.size,
                uploadTime: stats.mtime,
                path: `/uploads/deployment/${filename}`
            };
        });

        res.json({
            status: 'success',
            data: fileList
        });
    } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({
            status: 'error',
            message: '获取文件列表失败'
        });
    }
});

/**
 * DELETE /api/upload/deployment/:filename
 * 删除部署文件
 */
router.delete('/deployment/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(deploymentDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: 'error',
                message: '文件不存在'
            });
        }

        fs.unlinkSync(filePath);

        res.json({
            status: 'success',
            message: '文件删除成功'
        });
    } catch (error) {
        console.error('删除文件失败:', error);
        res.status(500).json({
            status: 'error',
            message: '删除文件失败'
        });
    }
});

module.exports = router;