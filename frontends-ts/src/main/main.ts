/*
 * main.tx
 *
 * Created by Ruibin.Chow on 2025/02/20.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import electronReload from 'electron-reload';
import env from './env';
import logger from './log';
import { preloadPath, deletePreload } from './preload';

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 768,
    webPreferences: {
      nodeIntegration: false, // 建议保持禁用以增强安全性
      contextIsolation: true, // 启用上下文隔离
      sandbox: true, // 是否使用沙盒
      webSecurity: true, // 启用同源策略
      allowRunningInsecureContent: false,
      webgl: true, // 按需启用
      preload: preloadPath, // 指定预加载脚本
    }
  });

  if (env.isDev()) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(appPath, 'dist/renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  logger.info('create window.');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

app.on('ready', () => {
    logger.info(`app ready.`);
    init();
  });

app.on('activate', () => {
  logger.info(`app activate, mainWindow: ${mainWindow}`);
  if (mainWindow) {
    // 如果窗口最小化，恢复窗口
    if (mainWindow.isMinimized()) mainWindow.restore()
    // 如果窗口隐藏，显示窗口
    if (!mainWindow.isVisible()) mainWindow.show()
    // 聚焦窗口
    mainWindow.focus()
  } else {
    // 兜底逻辑：重新创建窗口
    init();
  }
});

app.on('window-all-closed', () => {
  logger.info("app quit on window-all-closed.");
  if (process.platform !== 'darwin') {
    destory();
    app.quit();
  }
});

app.on('before-quit', (event) => {
  logger.info(`app before-quit.`);
});

app.on('quit', (event, exitCode) => {
  destory();
  logger.info(`app quit, exitCode(${exitCode})`);
});

function init() {
  logger.debug('init');
}

function destory() {
  logger.debug('destory');
  deletePreload();
}



