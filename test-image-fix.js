/**
 * 测试图片数据修复结果
 */

require('dotenv').config({ path: './houduan/.env' });
const { promisePool } = require('./houduan/config/database');

async function testImageFix() {
    try {
        console.log('🔍 测试图片数据修复结果...');
        
        // 获取资源数据
        const [resources] = await promisePool.execute('SELECT id, title, images FROM resources');
        console.log(`✅ 找到 ${resources.length} 个资源`);
        
        resources.forEach(resource => {
            console.log(`\n资源: ${resource.title}`);
            console.log(`原始数据:`, resource.images);
            console.log(`数据类型: ${typeof resource.images}`);
            
            // MySQL的JSON类型在Node.js中可能直接是数组对象
            if (Array.isArray(resource.images)) {
                console.log(`✅ 数据是数组:`, resource.images);
                console.log(`图片数量: ${resource.images.length}`);
                
                if (resource.images.length > 0) {
                    console.log(`第一张图片: ${resource.images[0]}`);
                }
            } else if (typeof resource.images === 'string') {
                try {
                    const imageArray = JSON.parse(resource.images);
                    console.log(`✅ JSON解析成功:`, imageArray);
                    console.log(`图片数量: ${imageArray.length}`);
                    
                    if (imageArray.length > 0) {
                        console.log(`第一张图片: ${imageArray[0]}`);
                    }
                } catch (e) {
                    console.log(`❌ JSON解析失败: ${e.message}`);
                }
            } else {
                console.log(`⚠️ 未知数据格式`);
            }
        });
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    } finally {
        process.exit(0);
    }
}

testImageFix();