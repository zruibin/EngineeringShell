/*
 * subPrograms.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { app } = require('electron');
const path = require('path');
const logger = require('./log');
const env = require('./env');

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
      break;
    case 'linux':
      subprogramExecutable = path.join(subprogramsPath, `${name}-linux`);
      break;
    default:
      console.error('Unsupported platform.');
      return;
  }

  logger.info(`subprogramPath: ${subprogramExecutable}`);
  const { execFile } = require('child_process');
  execFile(subprogramExecutable, ['arg1', 'arg2'], (error, stdout, stderr) => {
    if (error) {
      logger.error(`执行子程序出错: ${error.message}`);
      return;
    }
    if (stderr) {
      logger.error(`子程序输出错误: ${stderr}`);
      return;
    }
    logger.debug(`子程序输出: ${stdout}`);
  });
}

module.exports = runSubPrograms;
