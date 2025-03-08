/*
 * subPrograms.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { app } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const logger = require('./log');
const env = require('./env');


function spawnAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    // 后台模式配置（脱离父进程控制）
    const finalOptions = {
      detached: true, // 允许子进程独立运行
      stdio: 'ignore', // 忽略输入输出（后台静默运行）
      ...options
    };

    const child = spawn(command, args, finalOptions);
    let stdout = '';
    let stderr = '';

    // 监听标准输出（若需捕获日志则启用）
    if (finalOptions.stdio !== 'ignore') {
      child.stdout?.on('data', (data) => stdout += data.toString());
      child.stderr?.on('data', (data) => stderr += data.toString());
    }

    // 错误捕获：进程启动失败（如命令不存在）
    child.on('error', (err) => {
      reject(new Error(`启动失败: ${err.message}`));
    });

    // 进程退出事件
    child.on('close', (code, signal) => {
      // 自定义成功条件：退出码为 0 或特定信号
      if (code === 0) {
        resolve({ code, signal, stdout, stderr });
      } else {
        reject(new Error(`进程异常退出: 代码 ${code}, 信号 ${signal}\n错误日志: ${stderr}`));
      }
    });

    // 解除进程引用，允许父进程退出后子进程继续运行
    child.unref();
  });
}

function runSubPrograms() {
  const appPath = app.getAppPath();
  let subprogramsPath;
  if (app.isPackaged) {
    subprogramsPath = path.join(appPath, '..', 'subprograms');
  } else {
    subprogramsPath = path.join(appPath, 'subprograms');
  }

  if (env.isDev()) {
    subprogramsPath = path.join(appPath, '..', 'backends/install/bin');
  }

  // 确定子程序的可执行文件路径
  const platform = process.platform;
  let subprogramExecutable;
  const name = "Backends";

  switch (platform) {
    case 'darwin':
      subprogramExecutable = path.join(subprogramsPath, name); // macOS 可执行文件通常无扩展名
      break;
    case 'win32':
      subprogramExecutable = path.join(subprogramsPath, `${name}.exe`);
      subprogramExecutable = subprogramExecutable.replace(/\\/g, '\\\\');
      break;
    case 'linux':
      subprogramExecutable = path.join(subprogramsPath, `${name}-linux`);
      break;
    default:
      console.error('Unsupported platform.');
      return;
  }

  logger.info(`subprogramPath: ${subprogramExecutable}`);
  spawnAsync(subprogramExecutable, [], {
    // shell: true, // 启用 Shell（Windows 默认用 cmd.exe）
    windowsHide: true, // 隐藏子进程窗口
    // stdio: ['ignore', 'pipe', 'pipe'] // 忽略输入，捕获输出/错误
  }).then(({ stdout }) =>  logger.debug('输出:', stdout))
  .catch((err) => logger.error('错误:', err.message));
}

module.exports = runSubPrograms;
