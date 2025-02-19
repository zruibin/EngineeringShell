/*
 * WindowManager.js
 *
 * Created by Ruibin.Chow on 2025/02/19.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { BrowserWindow, dialog, app } = require('electron');
// const url = require('url');
const env = require('../env');
const logger = require('../log');
const { preloadPath } = require('../preload');

const windowIdMap = {};

addWindowId = (key, value) => {
    windowIdMap[key] = value;
    logger.debug(`addWindowId, key(${key}), value(${value})`);
}

removeWindowId = (key) => {
    delete windowIdMap[key];
    logger.debug(`removeWindowId, key(${key})`);
}


function createWindow(params) {
  const { name, width, height, loadFileUrl } = params;
  const window = new BrowserWindow({
    name,
    width,
    height,
    show: false,
    webPreferences: {
      nodeIntegration: false, // 建议保持禁用以增强安全性
      contextIsolation: true, // 启用上下文隔离
      sandbox: true, // 是否使用沙盒
      preload: preloadPath, // 指定预加载脚本
    },
  });

  window.webContents.on('did-finish-load', () => {
    logger.debug(`window.webContents did-finish-load`);
    addWindowId(name, window.webContents.id);
  });

  window.webContents.on('destroyed', () => {
    logger.debug(`window.webContents destroyed`);
    if (params.didDestroy) {
      params.didDestroy();
    }
    removeWindowId(name);
  });

  window.once('ready-to-show', () => {
    logger.debug(`window ready-to-show.`);
    if (env.isDev()) {
      window.webContents.openDevTools();
    }
    if (params.willShow) {
      params.willShow();
    }
    window.show();
  });

  window.on('close', (event) => {
    logger.debug(`window close, event(${JSON.stringify(event)})`);
    showExitAlert(event, window);
  });

  window.on('closed', (event) => {
    logger.debug(`window closed, event(${JSON.stringify(event)})`);
    // window = null;
  });

  window.webContents.on('render-process-gone', (event, details) => {
    logger.error('渲染进程崩溃:', details);
    // 可在此处重启窗口或提示用户
  });

  window.loadURL(loadFileUrl); // 不能用loadFile, 因为loadFileUrl已经经过url.format转换了
  logger.info(`window loadFileUrl: ${loadFileUrl}`);

  return window;
}

function showExitAlert(event, window) {
  // 阻止默认退出行为
  event.preventDefault();

  // 弹出同步确认对话框
  const result = dialog.showMessageBoxSync(window, {
    type: 'question',
    buttons: ['取消', '确认退出'],
    title: '确认退出',
    message: '您确定要退出应用吗？',
  });

  // 如果用户点击确认退出（按钮索引为1）
  if (result === 1) {
    // 移除事件监听，避免循环触发
    app.removeAllListeners('before-quit');
    // 强制退出应用
    app.exit();
  } else {
    window.hide();
  }
}


module.exports = {
  createWindow,
  addWindowId,
  removeWindowId
}



