
import fs from 'fs';
import path from 'path';
import { ipcMain, app } from 'electron';
import logger from '@:/main/log';
import cryption from '../../../../frontends-common/script/cryption';

// 原始方法备份
const originalHandle = ipcMain.handle;
const originalOn = ipcMain.on;

// 注册表维护
const ipcRegistry = {
  handlers: new Map(), // handle 注册表
  listeners: new Map() // on 注册表
};

// 封装 ipcMain.handle
ipcMain.handle = function(channel, handler) {
  logger.debug(`registerHandler: ${channel}`);
  ipcRegistry.handlers.set(channel, {
    handler,
    callCount: 0,
    lastCalled: Date.now()
  });
  return originalHandle.call(ipcMain, channel, async (event, ...args) => {
    try {
      // 前置通用逻辑
      validateChannel(channel);
      // logCall('handle', channel, args);
      
      // 执行原始处理器
      return await handler(event, ...args);
    } catch (error) {
      handleError(error, event, channel);
      return {msg: error || '', code: -1};
    }
  });
};

// 封装 ipcMain.on
ipcMain.on = function(channel, listener) {
  logger.debug(`registerListener: ${channel}`);
  ipcRegistry.listeners.set(channel, {
    listener,
    callCount: 0,
    lastCalled: Date.now()
  });
  return originalOn.call(ipcMain, channel, (event, ...args) => {
    try {
      // 前置通用逻辑
      validateChannel(channel);
      // logCall('on', channel, args);
      
      // 执行原始监听器
      return listener(event, ...args);
    } catch (error) {
      handleError(error, event, channel);
      return error;
    }
  });
};

function validateChannel(channel: string) {
  // const allowedChannels = ['app:quit', 'file:read']
  // if (!allowedChannels.includes(channel)) {
  //   throw new Error(`非法 IPC 通道: ${channel}`)
  // }
}

function logCall(type: any, channel: string, arg: []) {
  logger.info(`[IPC] ${type.toUpperCase()} ${channel}`);
}

function handleError(error: any, event: any, channel: string) {
  logger.error(`[IPC Error] ${channel}:`, error);
}

/******************************************************************************/

function registerListener(channel: string, listener: any) {
  if (!ipcRegistry.listeners.has(channel)) {
    ipcMain.on(channel, listener);
  }
}

function unRegisterListener(channel: string) {
  if (ipcRegistry.listeners.has(channel)) {
    const listener = ipcRegistry.listeners.get(channel).listener;
    logger.debug(`removeListener: ${channel}`);
    ipcMain.removeListener(channel, listener);
    ipcRegistry.listeners.delete(channel);
  }
}

function registerHandler(channel: string, handler: any) {
  if (!ipcRegistry.handlers.has(channel)) {
    ipcMain.handle(channel, handler);
  }
}

function unRegisterHandler(channel: string) {
  if (ipcRegistry.handlers.has(channel)) {
    ipcMain.removeHandler(channel);
    ipcRegistry.handlers.delete(channel);
  }
}


export function registerAll() {
  registerListener('get-app-version', (event: any) => {
    event.returnValue = app.getVersion();
  });

  registerListener('readAppFileSync', (event: any, filePath: string) => {
    const distPath = path.join(app.getAppPath(), filePath);
    logger.info(`readAppFileSync filePath: ${distPath}`);
    let data = '';
    try {
      data = fs.readFileSync(distPath, 'utf8');
    } catch (error) {
      logger.error(`readAppFileSync error: ${error}`);
    }
    event.returnValue = data;
  });

  registerListener('cryption.encrypt', (event: any, content: string) => {
    let encrypted = '';
    try {
      encrypted = cryption.encrypt(content);
    } catch (error) {
      logger.error(`cryption.encrypt error: ${error}`);
    }
    event.returnValue = encrypted;
  });

  registerListener('cryption.decrypt', (event: any, content: string) => {
    let decrypted = '';
    try {
      decrypted = cryption.decrypt(content);
    } catch (error) {
      logger.error(`cryption.decrypt error: ${error}`);
    }
    event.returnValue = decrypted;
  });

  registerHandler('invoke.test', async (event: any, content: string) => {
    logger.debug(`receive handler: ${content}`);
    return Promise.reject(new Error('API请求失败')); // ⚡️ 触发 catch
    // return content;
  });
}

export function unRegisterAll() {
  for(const [key, _] of ipcRegistry.listeners) {
    unRegisterListener(key);
  }
  for(const [key, _] of ipcRegistry.handlers) {
    unRegisterHandler(key);
  }
}
