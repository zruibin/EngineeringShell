/*
 * crash.ts
 *
 * Created by Ruibin.Chow on 2025/02/21.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import { app, crashReporter, Event, Details, RenderProcessGoneDetails } from 'electron';
import path from 'path';
import logger from './log';

function getCrashesDir(): string {
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

export function registerCrashReport(): void {
  crashReporter.start({
    submitURL: '', // 留空则不自动上传
    uploadToServer: false,
    extra: { version: app.getVersion() },
    ignoreSystemCrashHandler: true // 禁用系统默认崩溃处理
  });

  app.on("child-process-gone", (event: Event, details: Details) => {
    if (details.type === 'GPU') {
      logger.error('GPU进程崩溃:', details.reason);
    } else {
      logger.warn("app:child-process-gone", event, details);
    }
  });

  app.on('render-process-gone', (event: Event, webContents, details: RenderProcessGoneDetails) => {
    console.error(`渲染进程崩溃：${details.reason}`, details.exitCode);
    // if (details.reason === 'crashed') {
    //   app.relaunch({ args: process.argv.slice(1) });
    //   app.exit();
    // }
  });

  process.on("uncaughtException", (error) => {
    logger.error("主进程 - 未捕获的异常:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("主进程 - 未处理的Promise拒绝:", reason, promise);
  });
}

