/**
 * 微信支付配置模块
 * WeChat Pay Configuration Module
 * 
 * 功能说明：
 * - 微信支付API配置和初始化
 * - 支付参数验证和签名生成
 * - 支付回调处理
 * 
 * 环境变量依赖：
 * - WECHAT_APP_ID: 微信应用ID
 * - WECHAT_MCH_ID: 微信商户号
 * - WECHAT_API_KEY: 微信支付密钥
 * - WECHAT_CERT_PATH: 微信支付证书路径
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-01-01
 */

// Note: wechatpay-axios-plugin may not be installed yet
// Run install-wechat-pay.bat first
let Wechatpay;
try {
    ({ Wechatpay } = require('wechatpay-axios-plugin'));
} catch (error) {
    console.warn('⚠️ wechatpay-axios-plugin not installed. Run install-wechat-pay.bat first.');
}
const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config();

/**
 * 微信支付配置验证
 * @returns {boolean} 配置是否完整
 */
function validateWechatPayConfig() {
    const requiredVars = ['WECHAT_APP_ID', 'WECHAT_MCH_ID', 'WECHAT_API_KEY'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ 缺少微信支付环境变量:', missingVars.join(', '));
        return false;
    }
    
    return true;
}

/**
 * 初始化微信支付客户端
 * @returns {Object|null} 微信支付客户端实例
 */
function initWechatPay() {
    if (!Wechatpay) {
        console.warn('⚠️ wechatpay-axios-plugin 未安装，跳过微信支付初始化');
        return null;
    }

    if (!validateWechatPayConfig()) {
        console.warn('⚠️ 微信支付配置不完整，跳过初始化');
        return null;
    }

    try {
        // 读取微信支付证书（如果存在）
        let cert = null;
        const certPath = process.env.WECHAT_CERT_PATH;
        if (certPath && fs.existsSync(certPath)) {
            cert = fs.readFileSync(certPath);
        }

        const wechatpay = new Wechatpay({
            appid: process.env.WECHAT_APP_ID,
            mchid: process.env.WECHAT_MCH_ID,
            apikey: process.env.WECHAT_API_KEY,
            cert: cert,
            // 其他配置选项
            timeout: 30000,
            baseURL: 'https://api.mch.weixin.qq.com'
        });

        console.log('✅ 微信支付客户端初始化成功');
        return wechatpay;
    } catch (error) {
        console.error('❌ 微信支付客户端初始化失败:', error.message);
        return null;
    }
}

// 导出配置和客户端
module.exports = {
    validateWechatPayConfig,
    initWechatPay,
    wechatPayClient: initWechatPay()
};