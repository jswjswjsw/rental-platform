@echo off
echo 阿里云函数计算部署准备脚本

echo 1. 安装阿里云CLI工具
echo 请访问: https://help.aliyun.com/document_detail/139508.html
echo 下载并安装 Alibaba Cloud CLI

echo.
echo 2. 安装Serverless Devs工具
npm install -g @serverless-devs/s

echo.
echo 3. 配置阿里云账号
echo 运行: s config add
echo 需要输入:
echo - AccountID: 你的阿里云账号ID
echo - AccessKeyID: 访问密钥ID  
echo - AccessKeySecret: 访问密钥Secret
echo - DefaultRegion: cn-hangzhou

echo.
echo 4. 初始化函数计算项目
s init fc-http-nodejs14 -d fc-rental-api

echo.
echo 部署准备完成！
echo 接下来需要配置函数代码和环境变量
pause