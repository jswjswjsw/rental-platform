/**
 * 自定义开发服务器启动脚本
 * 显示公网IP地址
 */

const { createServer } = require('vite');
const chalk = require('chalk');

const PUBLIC_IP = '116.62.44.24';
const PORT = 8080;

async function startServer() {
  try {
    const server = await createServer({
      server: {
        port: PORT,
        host: '0.0.0.0'
      }
    });

    await server.listen();

    // 自定义输出
    console.log('');
    console.log(chalk.green('  VITE v4.5.14') + chalk.gray('  ready'));
    console.log('');
    console.log(chalk.green('  ➜') + '  ' + chalk.bold('Local:') + '   ' + chalk.cyan(`http://localhost:${PORT}/`));
    console.log(chalk.green('  ➜') + '  ' + chalk.bold('Network:') + ' ' + chalk.cyan(`http://${PUBLIC_IP}:${PORT}/`));
    console.log('');
    console.log(chalk.gray('  press ') + chalk.bold('h') + chalk.gray(' to show help'));
    console.log('');

  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

startServer();