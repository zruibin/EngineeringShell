/*
 * WindowManager.ts
 *
 * Created by Ruibin.Chow on 2025/02/21.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import { 
  app, 
  dialog, 
  BrowserWindow, 
  Event, 
  RenderProcessGoneDetails 
} from 'electron';
import env from '../env';
import logger from '../log';
import { preloadPath } from '../preload';

const windowsMap: Map<string, number> = new Map();

export function addWindowId(name: string, id: number): void {
  if (windowsMap.has(name)) {
    logger.error(`addWindowId, name(${name}) already exist.`); 
  } else {
    windowsMap.set(name, id);
    logger.debug(`addWindowId, key(${name}), id(${id})`); 
  }
}

export function removeWindowId(name: string): void {
  if (windowsMap.has(name)) {
    windowsMap.delete(name);
    logger.debug(`removeWindowId, name(${name})`);
  }
}

export function getWindowIdByName(name: string): number {
  return windowsMap.get(name) ?? 0;
}

export function getWindowNameById(id: number): string {
  let name = '';
  windowsMap.forEach((value , key) =>{
    if (value === id) {
      name = key;
    }
  });
  return name;
}

export function createWindow(params: any): BrowserWindow {
  const { name, width, height, loadFileUrl } = params;
  const window = new BrowserWindow({
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

  window.on('close', (event: Event) => {
    logger.debug(`window close, event(${JSON.stringify(event)})`);
    showExitAlert(event, window);
  });

  window.on('closed', (event: Event) => {
    logger.debug(`window closed, event(${JSON.stringify(event)})`);
  });

  window.webContents.on('render-process-gone', (event: Event, details: RenderProcessGoneDetails) => {
    logger.error('渲染进程崩溃:', details);
    // 可在此处重启窗口或提示用户
  });

  window.loadURL(loadFileUrl); // 不能用loadFile, 因为loadFileUrl已经经过url.format转换了
  logger.info(`window loadFileUrl: ${loadFileUrl}`);

  return window;
}

function showExitAlert(event: Event, window: BrowserWindow) {
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
