/*
 * subPrograms.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { app } = require('electron');
const path = require('path');
const logger = require('./log');

function runSubPrograms() {
  logger.debug(`log path: ${ logger.filePath() }`)
  const appPath = app.getAppPath();
  logger.debug(`appPath: ${appPath}`);
  let subprogramsPath;
  if (app.isPackaged) {
    subprogramsPath = path.join(appPath, '..', 'subprograms');
  } else {
    subprogramsPath = path.join(appPath, 'subprograms');
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
      subprogramExecutable = path.join(subprogramsPath, `${name}.ext`);
      break;
    case 'linux':
      subprogramExecutable = path.join(subprogramsPath, `${name}-linux`);
      break;
    default:
      console.error('Unsupported platform.');
      return;
  }
}

module.exports = runSubPrograms;
