/**
 * 修复数据库中的图片数据格式
 */

require('dotenv').config({ path: './houduan/.env' });
const { promisePool } = require('./houduan/config/database');

async function fixImageData() {
    try {
        console.log('🔧 开始修复图片数据格式...');
        
        // 获取所有资源
        const [resources] = await promisePool.execute('SELECT id, title, images FROM resources');
        console.log(`找到 ${resources.length} 个资源`);
        
        for (const resource of resources) {
            console.log(`\n处理资源: ${resource.title}`);
            console.log(`当前图片数据: ${resource.images}`);
            
            let fixedImages;
            
            try {
                // 尝试解析为JSON
                const parsed = JSON.parse(resource.images);
                console.log('✅ 图片数据格式正确，无需修复');
                continue;
            } catch (e) {
                // 如果解析失败，说明是字符串格式，需要转换为数组
                const imageStr = resource.images.toString(); // 转换为字符串
                console.log(`转换为字符串: ${imageStr}`);
                
                if (imageStr && imageStr.startsWith('/uploads/')) {
                    fixedImages = JSON.stringify([imageStr]);
                    console.log(`🔧 修复为: ${fixedImages}`);
                    
                    // 更新数据库
                    await promisePool.execute(
                        'UPDATE resources SET images = ? WHERE id = ?',
                        [fixedImages, resource.id]
                    );
                    
                    console.log('✅ 修复完成');
                } else {
                    console.log('⚠️ 图片数据格式异常，跳过');
                }
            }
        }
        
        console.log('\n🎉 图片数据格式修复完成！');
        
    } catch (error) {
        console.error('❌ 修复失败:', error);
    } finally {
        process.exit(0);
    }
}

fixImageData();