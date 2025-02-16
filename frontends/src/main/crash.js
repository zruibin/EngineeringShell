/*
 * crash.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { app, crashReporter } = require('electron');
const path = require('path');
const logger = require('./log');

function getCrashesDir() {
  const userData = app.getPath('userData');
  switch (process.platform) {
    case 'win32':
      return path.join(userData, 'Crashpad');
    case 'darwin':
      return path.join(userData, 'Crashpad');
    case 'linux':
      return path.join(userData, 'Crashpad');
    default:
      return path.join(userData, 'Crashes');
  }
}

// 获取崩溃文件存储路径
const crashDumpsDir = app.getPath('crashDumps'); // 直接获取崩溃目录
logger.info(`崩溃文件目录: ${crashDumpsDir}, getCrashesDir: ${getCrashesDir()}`);

function registerCrashReport(window) {
  crashReporter.start({
    submitURL: '', // 留空则不自动上传
    uploadToServer: false,
    extra: { version: app.getVersion() },
    ignoreSystemCrashHandler: true // 禁用系统默认崩溃处理
  });

  window.webContents.on('render-process-gone', (event, details) => {
    logger.error('渲染进程崩溃:', details);
    // 可在此处重启窗口或提示用户
  });

  // GPU进程崩溃
  app.on('gpu-process-crashed', function(){
    logger.error('GPU进程崩溃，程序退出');
    app.exit(0);
  });

  app.on("child-process-gone", (event, details) => {
    logger.warn("app:child-process-gone", event, details);
  });

  process.on("uncaughtException", (error) => {
    logger.error("主进程 - 未捕获的异常:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("主进程 - 未处理的Promise拒绝:", reason);
  });

  // setTimeout(() => {
  //   logger.debug('手动触发崩溃');
  //   // 手动触发崩溃（测试用）
  //   window.webContents.executeJavaScript('process.crash()');
  //   // process.crash();
  // }, 10000);
  // const allCrashReport = crashReporter.getUploadedReports();
  // logger.info(`崩溃: ${JSON.stringify(allCrashReport)}`);
}


module.exports = registerCrashReport;
