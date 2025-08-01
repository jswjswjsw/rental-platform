@echo off
echo 正在初始化数据库...

REM 安装Node.js依赖
echo 安装依赖包...
npm install mysql2 dotenv

REM 运行数据库初始化脚本
echo 连接数据库并初始化...
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');

async function init() {
    try {
        console.log('连接数据库...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        
        console.log('执行初始化脚本...');
        const sql = fs.readFileSync('complete-init.sql', 'utf8');
        await connection.execute(sql);
        
        console.log('✅ 数据库初始化完成！');
        await connection.end();
    } catch (error) {
        console.error('❌ 初始化失败:', error.message);
    }
}

init();
"

echo 数据库初始化完成！
pause