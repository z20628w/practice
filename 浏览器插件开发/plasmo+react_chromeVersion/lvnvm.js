// 手动切换Node.js版本，使用nvm管理工具

/**
 * 使用方法：
 *        执行命令：【node lvnvm.js】或者【npm run lvnvm】
*/
const { execSync } = require('child_process');
// 需要执行的Node.js版本
const nodeVersion = "v23.5.0";
// 当前node.js版本(小写字母)
const currentNodeVersion = process.version.toLocaleLowerCase();

// 判断版本是否相同
if (nodeVersion != currentNodeVersion) {
  console.log('\x1b[32m%s\x1b[0m', `请将node版本切换到${nodeVersion}`);
  try {
    execSync(`nvm use ${nodeVersion}`, { stdio: 'inherit' });
    // 最新node版本
    let newNodeVersion = process.version.toLocaleLowerCase();
    // 判断node版本是否修改成功
    if (newNodeVersion == nodeVersion) {
      console.log('\x1b[32m%s\x1b[0m', `Node.js 版本切换成功 ${currentNodeVersion} ==> ${newNodeVersion}`);
    } else {
      throw new Error('Node.js版本切换失败');
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Node.js版本切换失败,当前版本${process.version}`);
    process.exit(1); // 非零值表示错误,阻止后面的命令执行
  }
} else {
  console.log('\x1b[32m%s\x1b[0m', `node版本相同，不用切换 ==> ${currentNodeVersion}`);
}

