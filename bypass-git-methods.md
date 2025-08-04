# 绕过Git连接不稳定的部署方法

## 🚀 方法1：本地打包上传（最稳定，推荐）

### 步骤1：在本地创建部署包
```bash
# 运行打包脚本
create-deploy-package.bat
```
这会创建一个包含所有必要文件的zip包。

### 步骤2：上传到ECS
```bash
# 方式A：使用SCP上传（如果有SSH）
upload-to-ecs.bat

# 方式B：使用FTP/SFTP工具
# 推荐工具：WinSCP, FileZilla, Xftp
# 上传到ECS的/tmp目录

# 方式C：使用阿里云控制台上传
# 通过阿里云ECS控制台的文件管理功能上传
```

### 步骤3：在ECS上部署
```bash
ssh root@116.62.44.24
cd /tmp
unzip rental-platform-*.zip
cd rental-platform
chmod +x deploy-on-ecs.sh
./deploy-on-ecs.sh
```

## 🚀 方法2：使用国内Git镜像

### 配置Gitee镜像（推荐）
```bash
# 在ECS上配置Gitee镜像
ssh root@116.62.44.24

# 添加Gitee远程仓库
git remote add gitee https://gitee.com/your-username/rental-platform.git

# 从Gitee拉取代码
git pull gitee main
```

### 配置GitHub加速
```bash
# 方法A：使用GitHub镜像站
git clone https://github.com.cnpmjs.org/jswjswjsw/rental-platform.git

# 方法B：使用FastGit镜像
git clone https://hub.fastgit.xyz/jswjswjsw/rental-platform.git

# 方法C：使用GitHub代理
git config --global http.proxy http://127.0.0.1:1080
git config --global https.proxy https://127.0.0.1:1080
```

## 🚀 方法3：直接下载文件（最简单）

### 使用wget下载ZIP
```bash
ssh root@116.62.44.24

# 下载主分支ZIP
wget https://github.com/jswjswjsw/rental-platform/archive/refs/heads/main.zip

# 如果GitHub不稳定，使用代理下载
wget --no-check-certificate https://ghproxy.com/https://github.com/jswjswjsw/rental-platform/archive/refs/heads/main.zip

# 解压
unzip main.zip
mv rental-platform-main rental-platform
```

### 使用curl下载特定文件
```bash
# 只下载修改的文件
curl -o WechatPay.vue https://raw.githubusercontent.com/jswjswjsw/rental-platform/main/qianduan/src/components/payment/WechatPay.vue

# 使用代理下载
curl -o WechatPay.vue https://ghproxy.com/https://raw.githubusercontent.com/jswjswjsw/rental-platform/main/qianduan/src/components/payment/WechatPay.vue
```

## 🚀 方法4：使用阿里云OSS中转

### 步骤1：上传到OSS
```bash
# 在本地上传文件到阿里云OSS
# 使用阿里云控制台或ossutil工具
```

### 步骤2：从OSS下载
```bash
ssh root@116.62.44.24

# 从OSS下载（速度快，稳定）
wget https://your-bucket.oss-cn-hangzhou.aliyuncs.com/rental-platform.zip
```

## 🚀 方法5：使用rsync同步

### 从本地同步到ECS
```bash
# 在本地运行（需要配置SSH密钥）
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@116.62.44.24:/path/to/project/

# 或者使用密码认证
rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@116.62.44.24:/path/to/project/ --rsh="sshpass -p 'your-password' ssh"
```

## 🚀 方法6：手动复制关键文件

如果只是修复支付功能，只需要更新这几个文件：

### 关键文件列表
```
qianduan/src/components/payment/WechatPay.vue  # 主要修复文件
houduan/.env.backup                            # 环境配置备份
```

### 手动更新步骤
```bash
# 1. 在本地复制WechatPay.vue的内容
# 2. 在ECS上编辑文件
ssh root@116.62.44.24
nano /path/to/project/qianduan/src/components/payment/WechatPay.vue

# 3. 粘贴新内容并保存
# 4. 重启服务
pm2 restart rental-frontend
```

## 📋 推荐方案对比

| 方法 | 稳定性 | 速度 | 难度 | 推荐度 |
|------|--------|------|------|--------|
| 本地打包上传 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 国内Git镜像 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 直接下载ZIP | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| OSS中转 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| rsync同步 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 手动复制 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |

## 🎯 最佳实践建议

1. **首选方案**：本地打包上传（最稳定）
2. **备选方案**：直接下载ZIP文件
3. **应急方案**：手动复制关键文件

选择适合你网络环境的方法即可！