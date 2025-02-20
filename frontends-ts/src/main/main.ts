/*
 * main.tx
 *
 * Created by Ruibin.Chow on 2025/02/20.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import electronReload from 'electron-reload';
import logger from './log';

const appPath = app.getAppPath();

// 热重载配置
if (process.env.NODE_ENV === 'development') {
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
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
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


