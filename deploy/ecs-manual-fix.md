# ECS手动修复支付功能

## 🎯 由于Git连接不稳定，直接在ECS上修改关键文件

### 步骤1：SSH连接到ECS
```bash
ssh root@116.62.44.24
```

### 步骤2：进入项目目录
```bash
cd /path/to/your/project
```

### 步骤3：备份原文件
```bash
cp qianduan/src/components/payment/WechatPay.vue qianduan/src/components/payment/WechatPay.vue.backup.$(date +%Y%m%d_%H%M%S)
```

### 步骤4：编辑支付组件文件
```bash
# 使用 nano 编辑器（推荐新手）
nano qianduan/src/components/payment/WechatPay.vue

# 或使用 vim 编辑器
# vim qianduan/src/components/payment/WechatPay.vue

# 或使用 vi 编辑器
# vi qianduan/src/components/payment/WechatPay.vue
```

### 步骤5：找到并修改这一行
**查找这个代码块：**
```javascript
// 在 createPayment 函数中找到这段代码
if (process.env.NODE_ENV === 'development') {
  console.warn('开发环境：模拟微信支付成功')
  setTimeout(() => resolve({ err_msg: 'get_brand_wcpay_request:ok' }), 2000)
  return
}
```

**替换为：**
```javascript
if (import.meta.env.DEV) {
  console.warn('开发环境：模拟微信支付成功')
  setTimeout(() => resolve({ err_msg: 'get_brand_wcpay_request:ok' }), 2000)
  return
}
```

### 步骤6：添加调试日志
在 `handlePay` 函数开始处添加：
```javascript
const handlePay = async () => {
  console.log('🔄 支付按钮被点击', { 
    paymentType: props.paymentType, 
    orderId: props.order?.id,
    paying: paying.value 
  });
  
  if (paying.value) {
    console.log('⚠️ 支付正在进行中，忽略重复点击');
    return;
  }
  // ... 其他代码
}
```

### 步骤7：保存并退出
```bash
# 在nano中：Ctrl+X, 然后Y, 然后Enter
```

### 步骤7：检查并重启前端服务
```bash
# 检查当前服务状态
pm2 status

# 重启前端服务
pm2 restart rental-frontend
# 或者重启所有服务
pm2 restart all

# 验证服务启动成功
pm2 status
pm2 logs rental-frontend --lines 10
```

### 步骤8：验证修复
1. 访问：http://116.62.44.24:8080
2. 进入支付页面
3. 打开浏览器F12开发者工具
4. 点击支付按钮
5. 查看Console应该显示：`🔄 支付按钮被点击`

## 🔧 故障排除

### 如果修复后仍然无效：

1. **检查文件是否正确保存**
```bash
grep -n "import.meta.env.DEV" qianduan/src/components/payment/WechatPay.vue
```

2. **检查服务是否正常重启**
```bash
pm2 logs rental-frontend --lines 20
```

3. **清除浏览器缓存**
- 按 Ctrl+F5 强制刷新页面
- 或在开发者工具中右键刷新按钮选择"清空缓存并硬性重新加载"

4. **如果需要恢复原文件**
```bash
cp qianduan/src/components/payment/WechatPay.vue.backup.* qianduan/src/components/payment/WechatPay.vue
pm2 restart rental-frontend
```

## 🔧 完整的修复内容

如果你想看完整的修复后的文件内容，我可以提供给你复制粘贴。