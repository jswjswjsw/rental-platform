# 本地数据库设置说明

## 问题描述
支付按钮无响应的主要原因是阿里云RDS连接超时，导致数据库操作失败。

## 解决方案
使用本地MySQL数据库进行开发测试。

## 设置步骤

### 1. 安装MySQL
如果还没有安装MySQL，请先安装：
- 下载地址：https://dev.mysql.com/downloads/mysql/
- 或使用XAMPP：https://www.apachefriends.org/

### 2. 创建数据库
```sql
mysql -u root -p < init-local-database.sql
```

### 3. 使用本地配置
将 .env.local 重命名为 .env：
```bash
cd houduan
copy .env.local .env
```

### 4. 重启后端服务
```bash
cd houduan
npm run dev
```

## 配置说明
- 数据库：rental_platform_local
- 用户名：root
- 密码：123456（请根据实际情况修改）
- 端口：3306

## 恢复阿里云配置
如需恢复阿里云RDS配置：
```bash
cd houduan
copy .env.backup .env
```

## 测试支付功能
1. 访问 http://localhost:8080
2. 注册/登录用户
3. 创建订单
4. 点击支付按钮
5. 查看浏览器控制台和网络请求

## 常见问题
1. MySQL连接失败：检查MySQL服务是否启动
2. 数据库不存在：运行初始化SQL脚本
3. 权限问题：确保MySQL用户有足够权限
