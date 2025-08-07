/**
 * 自定义Vite启动脚本 - 显示公网IP
 * 
 * 功能说明：
 * - 启动Vite开发服务器
 * - 自定义显示公网IP地址
 * - 监听所有网络接口
 * 
 * @author 开发团队
 * @version 1.0.0
 * @since 2024-08-05
 */

const { spawn } = require('child_process');

// Simple color functions to avoid chalk dependency
const colors = {
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 配置
const PUBLIC_IP = '116.62.44.24';
const PORT = 8080;

console.log(colors.cyan('🚀 启动前端开发服务器...'));
console.log(colors.gray('配置公网IP显示...'));

// 启动Vite
const vite = spawn('npx', ['vite', '--port', PORT, '--host', '0.0.0.0'], {
  stdio: 'pipe',
  shell: true
});

// 处理spawn错误
vite.on('error', (error) => {
  console.error(colors.yellow('❌ 启动Vite失败:'), error.message);
  console.log(colors.gray('请确保已安装依赖: npm install'));
  process.exit(1);
});

let serverStarted = false;

vite.stdout.on('data', (data) => {
  const output = data.toString();
  
  // 检测服务器启动完成
  if (output.includes('ready in') && !serverStarted) {
    serverStarted = true;
    
    // 自定义输出
    console.log('');
    // Extract version from output or use generic message
    const viteVersion = output.match(/VITE v([\d.]+)/)?.[1] || 'latest';
    console.log(colors.green(`  VITE v${viteVersion}`) + colors.gray('  ready in') + ' ' + (output.match(/ready in (\d+ms)/)?.[1] || ''));
    console.log('');
    console.log(colors.green('  ➜') + '  ' + colors.bold('Local:') + '   ' + colors.cyan(`http://localhost:${PORT}/`));
    console.log(colors.green('  ➜') + '  ' + colors.bold('Network:') + ' ' + colors.cyan(`http://${PUBLIC_IP}:${PORT}/`));
    console.log('');
    console.log(colors.gray('  press ') + colors.bold('h') + colors.gray(' to show help'));
    console.log('');
  } else if (!output.includes('ready in') && !output.includes('Local:') && !output.includes('Network:')) {
    // 显示其他输出（但过滤掉原始的地址信息）
    process.stdout.write(output);
  }
});

vite.stderr.on('data', (data) => {
  process.stderr.write(data);
});

vite.on('close', (code) => {
  console.log(colors.yellow(`\n服务器已停止 (退出码: ${code})`));
  process.exit(code);
});

// 处理Ctrl+C
process.on('SIGINT', () => {
  console.log(colors.yellow('\n正在停止服务器...'));
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  vite.kill('SIGTERM');
});