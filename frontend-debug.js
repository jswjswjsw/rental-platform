
// 在浏览器控制台中运行以下代码来调试支付功能

// 1. 检查Vue应用是否正常加载
console.log('Vue app:', window.__VUE_DEVTOOLS_GLOBAL_HOOK__);

// 2. 检查支付组件是否存在
const paymentButtons = document.querySelectorAll('[class*="pay-button"], [class*="payment"], button');
console.log('找到的按钮元素:', paymentButtons);

// 3. 手动触发支付按钮点击
paymentButtons.forEach((btn, index) => {
    console.log('按钮 ' + index + ':', btn);
    console.log('  - 文本内容:', btn.textContent);
    console.log('  - 是否禁用:', btn.disabled);
    console.log('  - 事件监听器:', typeof getEventListeners !== 'undefined' ? getEventListeners(btn) : '需要Chrome DevTools');
});

// 4. 检查网络请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🌐 发起网络请求:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            console.log('📥 收到响应:', response.status, response.url);
            return response;
        })
        .catch(error => {
            console.error('❌ 请求失败:', error);
            throw error;
        });
};

// 5. 检查用户认证状态
const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
console.log('🔐 用户Token:', token ? '已设置' : '未设置');

// 6. 检查订单数据
console.log('📋 当前页面URL:', window.location.href);
const urlParams = new URLSearchParams(window.location.search);
console.log('📋 URL参数:', Object.fromEntries(urlParams));

// 7. 模拟支付按钮点击
function simulatePaymentClick() {
    const payBtn = document.querySelector('.pay-button, [class*="pay"], button[type="primary"]');
    if (payBtn) {
        console.log('🖱️ 模拟点击支付按钮');
        payBtn.click();
    } else {
        console.log('❌ 未找到支付按钮');
    }
}

// 运行模拟点击
setTimeout(simulatePaymentClick, 1000);

console.log('🔧 调试代码已加载，请查看上方输出信息');
