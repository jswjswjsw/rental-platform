/**
 * 用户认证路由模块
 * 
 * 功能说明：
 * - 处理用户注册、登录、密码重置等认证相关功能
 * - 使用JWT进行用户身份验证和授权
 * - 密码加密存储和验证
 * - 完整的数据验证和错误处理
 * 
 * 主要接口：
 * - POST /register - 用户注册
 * - POST /login - 用户登录
 * - GET /me - 获取当前用户信息
 * - PUT /password - 修改密码
 * 
 * 安全特性：
 * - bcrypt密码加密（10轮加盐）
 * - JWT Token生成和验证
 * - 输入数据验证（Joi）
 * - 用户状态检查
 * - 防止重复注册
 * 
 * 数据验证：
 * - 用户名：3-30位字母数字
 * - 邮箱：标准邮箱格式
 * - 密码：最少6位字符
 * - 手机号：中国大陆手机号格式
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { promisePool } = require('../config/database-config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            username: Joi.string().alphanum().min(3).max(30).required()
                .messages({
                    'string.alphanum': '用户名只能包含字母和数字',
                    'string.min': '用户名至少3个字符',
                    'string.max': '用户名最多30个字符',
                    'any.required': '用户名不能为空'
                }),
            email: Joi.string().email().required()
                .messages({
                    'string.email': '邮箱格式不正确',
                    'any.required': '邮箱不能为空'
                }),
            password: Joi.string().min(6).required()
                .messages({
                    'string.min': '密码至少6个字符',
                    'any.required': '密码不能为空'
                }),
            phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
                .messages({
                    'string.pattern.base': '手机号格式不正确'
                }),
            real_name: Joi.string().max(50).optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { username, email, password, phone, real_name } = value;

        // 检查用户名和邮箱是否已存在
        const [existingUsers] = await promisePool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: '用户名或邮箱已存在'
            });
        }

        // 加密密码
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 插入新用户
        const [result] = await promisePool.execute(
            'INSERT INTO users (username, email, password, phone, real_name) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, phone || null, real_name || null]
        );

        // 生成JWT token
        const token = jwt.sign(
            { userId: result.insertId, username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'success',
            message: '注册成功',
            data: {
                token,
                user: {
                    id: result.insertId,
                    username,
                    email,
                    phone: phone || null,
                    real_name: real_name || null
                }
            }
        });

    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            username: Joi.string().required()
                .messages({
                    'any.required': '用户名不能为空'
                }),
            password: Joi.string().required()
                .messages({
                    'any.required': '密码不能为空'
                })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { username, password } = value;

        // 查询用户（支持用户名或邮箱登录）
        const [users] = await promisePool.execute(
            'SELECT id, username, email, password, phone, real_name, avatar, status FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: '用户名或密码错误'
            });
        }

        const user = users[0];

        // 检查用户状态
        if (user.status !== 'active') {
            return res.status(401).json({
                status: 'error',
                message: '账号已被禁用，请联系管理员'
            });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: '用户名或密码错误'
            });
        }

        // 生成JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = user;

        res.json({
            status: 'success',
            message: '登录成功',
            data: {
                token,
                user: userInfo
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await promisePool.execute(
            'SELECT id, username, email, phone, real_name, avatar, status, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: users[0]
            }
        });

    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

/**
 * 修改密码
 * PUT /api/auth/password
 */
router.put('/password', authenticateToken, async (req, res) => {
    try {
        // 数据验证
        const schema = Joi.object({
            oldPassword: Joi.string().required()
                .messages({
                    'any.required': '原密码不能为空'
                }),
            newPassword: Joi.string().min(6).required()
                .messages({
                    'string.min': '新密码至少6个字符',
                    'any.required': '新密码不能为空'
                })
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message
            });
        }

        const { oldPassword, newPassword } = value;

        // 获取用户当前密码
        const [users] = await promisePool.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: '用户不存在'
            });
        }

        // 验证原密码
        const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].password);
        if (!isOldPasswordValid) {
            return res.status(400).json({
                status: 'error',
                message: '原密码错误'
            });
        }

        // 加密新密码
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // 更新密码
        await promisePool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, req.user.id]
        );

        res.json({
            status: 'success',
            message: '密码修改成功'
        });

    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({
            status: 'error',
            message: '服务器内部错误'
        });
    }
});

module.exports = router;