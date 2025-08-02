/**
 * 网络连接问题修复脚本
 * 专门针对阿里云RDS实例: rm-bp1sva9582w011209
 * 修复租赁平台的所有网络连接相关问题
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './houduan/.env' });

console.log('🔧 租赁平台网络连接修复工具启动...');
console.log('🏷️  目标RDS实例: rm-bp1sva9582w011209\n');

// 数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'rm-bp1sva9582w011209.mysql.rds.aliyuncs.com',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rental_platform',
    charset: 'utf8mb4',
    connectTimeout: 60000,
    ssl: false,
    multipleStatements: false
};

// 修复步骤1: 检查并修复数据库连接
async function fixDatabaseConnection() {
    console.log('🔗 步骤1: 修复数据库连接...');
    
    try {
        // 测试基本连接
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            connectTimeout: 30000,
            ssl: false
        });
        
        console.log('✅ RDS连接成功');
        
        // 获取服务器信息
        const [serverInfo] = await connection.execute('SELECT VERSION() as version, NOW() as server_time');
        console.log(`   MySQL版本: ${serverInfo[0].version}`);
        console.log(`   服务器时间: ${serverInfo[0].server_time}`);
        
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ RDS连接失败:', error.message);
        console.error('   错误代码:', error.code);
        
        // 提供详细的修复建议
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 权限问题修复建议:');
            console.error('   1. 登录阿里云RDS控制台');
            console.error('   2. 检查白名单是否包含ECS内网IP');
            console.error('   3. 确认数据库账号密码正确');
            console.error('   4. 验证账号权限设置');
        }
        return false;
    }
}

// 修复步骤2: 创建缺失的数据库和表
async function fixDatabaseSchema() {
    console.log('\n🗄️ 步骤2: 修复数据库结构...');
    
    try {
        // 连接到数据库
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);
            console.log('✅ 连接到目标数据库');
        } catch (error) {
            if (error.code === 'ER_BAD_DB_ERROR') {
                console.log('   数据库不存在，正在创建...');
                const tempConnection = await mysql.createConnection({
                    host: dbConfig.host,
                    port: dbConfig.port,
                    user: dbConfig.user,
                    password: dbConfig.password
                });
                
                await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                console.log('✅ 数据库创建成功');
                await tempConnection.end();
                
                connection = await mysql.createConnection(dbConfig);
            } else {
                throw error;
            }
        }
        
        // 检查并创建favorites表
        const [tables] = await connection.execute("SHOW TABLES LIKE 'favorites'");
        
        if (tables.length === 0) {
            console.log('   正在创建favorites表...');
            
            const createFavoritesSQL = `
                CREATE TABLE IF NOT EXISTS favorites (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL COMMENT '用户ID',
                    resource_id INT NOT NULL COMMENT '资源ID',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                    UNIQUE KEY unique_favorite (user_id, resource_id),
                    INDEX idx_user (user_id),
                    INDEX idx_resource (resource_id),
                    INDEX idx_created_at (created_at)
                ) COMMENT '用户收藏表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            `;
            
            await connection.execute(createFavoritesSQL);
            console.log('✅ favorites表创建成功');
        } else {
            console.log('✅ favorites表已存在');
        }
        
        // 验证其他必需的表
        const requiredTables = ['users', 'resources', 'categories', 'orders', 'reviews'];
        const [allTables] = await connection.execute('SHOW TABLES');
        const existingTables = allTables.map(table => Object.values(table)[0]);
        
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        if (missingTables.length > 0) {
            console.log(`   ⚠️ 警告: 缺少表 ${missingTables.join(', ')}`);
            console.log('   💡 建议: 运行完整的数据库初始化脚本');
        } else {
            console.log('✅ 所有必需的表都存在');
        }
        
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ 数据库结构修复失败:', error.message);
        return false;
    }
}

// 修复步骤3: 创建上传目录结构
function fixUploadDirectories() {
    console.log('\n📁 步骤3: 修复上传目录结构...');
    
    const uploadsPath = path.join(__dirname, 'houduan', 'uploads');
    
    try {
        // 创建主uploads目录
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('✅ 创建uploads主目录');
        }
        
        // 创建子目录
        const subDirs = ['avatars', 'resources'];
        subDirs.forEach(dir => {
            const subPath = path.join(uploadsPath, dir);
            if (!fs.existsSync(subPath)) {
                fs.mkdirSync(subPath, { recursive: true });
                console.log(`✅ 创建${dir}目录`);
            } else {
                console.log(`✅ ${dir}目录已存在`);
            }
        });
        
        // 设置目录权限（Windows下可能不需要）
        try {
            if (process.platform !== 'win32') {
                const { execSync } = require('child_process');
                execSync(`chmod -R 755 ${uploadsPath}`);
                console.log('✅ 设置目录权限');
            }
        } catch (error) {
            console.log('   权限设置跳过（Windows系统）');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 上传目录修复失败:', error.message);
        return false;
    }
}

// 修复步骤4: 检查后端服务配置
function fixBackendConfiguration() {
    console.log('\n⚙️ 步骤4: 检查后端服务配置...');
    
    try {
        // 检查.env文件
        const envPath = path.join(__dirname, 'houduan', '.env');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env文件不存在');
            return false;
        }
        
        // 检查关键配置
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        const missingVars = [];
        
        requiredVars.forEach(varName => {
            if (!envContent.includes(`${varName}=`)) {
                missingVars.push(varName);
            }
        });
        
        if (missingVars.length > 0) {
            console.error(`❌ 缺少环境变量: ${missingVars.join(', ')}`);
            return false;
        }
        
        console.log('✅ 环境变量配置完整');
        
        // 检查package.json依赖
        const packagePath = path.join(__dirname, 'houduan', 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const requiredDeps = ['mysql2', 'express', 'cors', 'dotenv'];
            const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
            
            if (missingDeps.length > 0) {
                console.error(`❌ 缺少依赖: ${missingDeps.join(', ')}`);
                return false;
            }
            
            console.log('✅ 后端依赖完整');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 后端配置检查失败:', error.message);
        return false;
    }
}

// 修复步骤5: 生成服务重启脚本
function generateRestartScript() {
    console.log('\n🔄 步骤5: 生成服务重启脚本...');
    
    try {
        const restartScript = `@echo off
echo 正在重启租赁平台服务...

echo 停止现有服务...
taskkill /f /im node.exe 2>nul

echo 等待服务完全停止...
timeout /t 3 /nobreak >nul

echo 启动后端服务...
cd houduan
start "后端服务" cmd /k "npm start"

echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo 启动前端服务...
cd ../qianduan
start "前端服务" cmd /k "npm run dev"

echo 服务重启完成！
echo 前端地址: http://localhost:8080
echo 后端地址: http://localhost:3000
echo 健康检查: http://localhost:3000/api/health

pause
`;
        
        fs.writeFileSync('restart-services.bat', restartScript);
        console.log('✅ 生成重启脚本: restart-services.bat');
        
        return true;
    } catch (error) {
        console.error('❌ 生成重启脚本失败:', error.message);
        return false;
    }
}

// 运行完整修复流程
async function runCompleteRepair() {
    console.log('🚀 开始完整修复流程...\n');
    
    const results = {
        database: false,
        schema: false,
        uploads: false,
        config: false,
        script: false
    };
    
    try {
        // 执行所有修复步骤
        results.database = await fixDatabaseConnection();
        if (results.database) {
            results.schema = await fixDatabaseSchema();
        }
        results.uploads = fixUploadDirectories();
        results.config = fixBackendConfiguration();
        results.script = generateRestartScript();
        
        // 输出修复结果
        console.log('\n📋 修复结果总结:');
        console.log(`   数据库连接: ${results.database ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   数据库结构: ${results.schema ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   上传目录: ${results.uploads ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   后端配置: ${results.config ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   重启脚本: ${results.script ? '✅ 成功' : '❌ 失败'}`);
        
        const successCount = Object.values(results).filter(Boolean).length;
        const totalCount = Object.keys(results).length;
        
        if (successCount === totalCount) {
            console.log('\n🎉 所有问题修复完成！');
            console.log('\n💡 下一步操作:');
            console.log('   1. 运行 restart-services.bat 重启服务');
            console.log('   2. 访问 http://localhost:8080 测试前端');
            console.log('   3. 访问 http://localhost:3000/api/health 检查后端');
            console.log('   4. 测试用户注册、登录、收藏等功能');
        } else {
            console.log(`\n⚠️ 部分问题修复失败 (${successCount}/${totalCount})`);
            console.log('💡 请根据上述错误信息手动修复剩余问题');
        }
        
    } catch (error) {
        console.error('\n💥 修复过程出现异常:', error.message);
        console.error('🔍 详细错误:', error.stack);
    }
}

// 启动修复
runCompleteRepair();