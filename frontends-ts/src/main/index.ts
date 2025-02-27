/*
 * main.tx
 *
 * Created by Ruibin.Chow on 2025/02/20.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import path from 'path';
import url from 'url';
import { app, BrowserWindow, Event, WebContentsView } from 'electron';
import electronReload from 'electron-reload';
import { registerCrashReport } from '@:/main/crash';
import env from '@:/main/env';
import logger from '@:/main/log';
import * as ipcManager from '@:/main/manager/IPCManager';
import * as windowManager from '@:/main/manager/WindowManager';
import { deletePreload } from '@:/main/preload';

const appPath = app.getAppPath();

// 热重载配置
if (env.isDev()) {
  // 注释掉electronReload即可以关闭主进程刷新
  /*
  electronReload(path.join(appPath, 'dist'), {
    electron: path.join(appPath, 'node_modules/.bin/electron'),
    // 核心延时配置
    awaitWriteFinish: {
      stabilityThreshold: 2000, // 文件稳定时间
      pollInterval: 500         // 检查间隔
    }
  });
  //*/
}

let mainWindow: BrowserWindow | null;

function createMainPath(): string {
  let mainPath;
  if (env.isDev()) {
    mainPath = url.format({
      protocol: 'http:',
      host: 'localhost:3000',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    const filePath = path.join(appPath, 'dist/renderer/', 'index.html');
    mainPath = url.format({
      protocol: 'file:',
      pathname: filePath,
      slashes: true
    });
  }
  logger.debug(`mainPath: ${mainPath}`);
  return mainPath;
}

function registerAppEvent(): void {
  app.on('ready', () => {
    logger.info('app ready.');
    init();
  });

  app.on('activate', () => {
    logger.info(`app activate, mainWindow: ${mainWindow}`);
    if (mainWindow) {
      // 如果窗口最小化，恢复窗口
      if (mainWindow.isMinimized()) mainWindow.restore();
      // 如果窗口隐藏，显示窗口
      if (!mainWindow.isVisible()) mainWindow.show();
      // 聚焦窗口
      mainWindow.focus();
    } else {
      // 兜底逻辑：重新创建窗口
      init();
    }
  });

  app.on('window-all-closed', () => {
    logger.info('app quit on window-all-closed.');
    if (process.platform !== 'darwin') {
      destory();
      app.quit();
    }
  });

  app.on('before-quit', (event) => {
    logger.info('app before-quit.');
    // showExitAlert(event);
  });

  app.on('quit', (event: Event, exitCode: number) => {
    destory();
    logger.info(`app quit, exitCode(${exitCode})`);
  });
}

function init() {
  logger.debug('app init.');
  registerCrashReport();
  ipcManager.registerAll();

  const loadFileUrl = createMainPath();
  mainWindow = windowManager.createWindow({
    name: 'main',
    width: 1280,
    height: 720,
    loadFileUrl,
    willShow: () => {
      // logger.info(`MemoryInfo: ${process.getSystemMemoryInfo()}`);

      // const view1 = new WebContentsView();
      // mainWindow?.contentView.addChildView(view1);
      // view1.webContents.loadURL('https://electronjs.org');
      // view1.setBounds({ x: 0, y: 50, width: 400, height: 400 });

      // const view2 = new WebContentsView();
      // mainWindow?.contentView.addChildView(view2);
      // view2.webContents.loadURL('https://github.com/electron/electron');
      // view2.setBounds({ x: 400, y: 50, width: 400, height: 400 });
    }
  });
}

function destory() {
  logger.debug('app destory.');
  ipcManager.unRegisterAll();
  deletePreload();
}


const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.error('It was not single instance then app quit.');
  app.quit();
} else {
  registerAppEvent();
}

