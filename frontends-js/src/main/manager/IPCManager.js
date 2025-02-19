/*
 * IPCManager.js
 *
 * Created by Ruibin.Chow on 2025/02/18.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { ipcMain, app } = require('electron')
const fs = require('fs');
const path = require('path');
const logger = require('../log');
const cryption = require('../../../script/cryption');

// 原始方法备份
const originalHandle = ipcMain.handle;
const originalOn = ipcMain.on;

// 注册表维护
const ipcRegistry = {
  handlers: new Map(), // handle 注册表
  listeners: new Map() // on 注册表
}

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
      return {msg: error.message, code: -1};
    }
  });
}

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
}

function validateChannel(channel) {
  // const allowedChannels = ['app:quit', 'file:read']
  // if (!allowedChannels.includes(channel)) {
  //   throw new Error(`非法 IPC 通道: ${channel}`)
  // }
}

function logCall(type, channel, args) {
  logger.info(`[IPC] ${type.toUpperCase()} ${channel}`);
}

function handleError(error, event, channel) {
  logger.error(`[IPC Error] ${channel}:`, error);
  // event.sender.send('ipc-error', {
  //   channel,
  //   message: error.message
  // })
}

/******************************************************************************/

function registerListener(channel, listener) {
  if (!ipcRegistry.listeners.has(channel)) {
    ipcMain.on(channel, listener);
  }
}

function unRegisterListener(channel) {
  if (ipcRegistry.listeners.has(channel)) {
    const listener = ipcRegistry.listeners.get(channel).listener;
    logger.debug(`removeListener: ${channel}`);
    ipcMain.removeListener(channel, listener);
    ipcRegistry.listeners.delete(channel);
  }
}

function registerHandler(channel, handler) {
  if (!ipcRegistry.handlers.has(channel)) {
    ipcMain.handle(channel, handler);
  }
}

function unRegisterHandler(channel) {
  if (ipcRegistry.handlers.has(channel)) {
    ipcMain.removeHandler(channel);
    ipcRegistry.handlers.delete(channel);
  }
}


function registerAll() {
  registerListener('get-app-version', (event) => {
    event.returnValue = app.getVersion();
  });

  registerListener('readAppFileSync', (event, filePath) => {
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

  registerListener("logger.info", (event, message) => {
    logger.i(message);
  });

  registerListener("logger.warn", (event, message) => {
    logger.w(message);
  });

  registerListener("logger.error", (event, message) => {
    logger.e(message);
  });

  registerListener("logger.debug", (event, message) => {
    logger.d(message);
  });

  registerListener("logger.verbose", (event, message) => {
    logger.v(message);
  });

  registerListener('cryption.encrypt', (event, content) => {
    let encrypted = '';
    try {
      encrypted = cryption.encrypt(content);
    } catch (error) {
      logger.error(`cryption.encrypt error: ${error}`);
    }
    event.returnValue = encrypted;
  });

  registerListener('cryption.decrypt', (event, content) => {
    let decrypted = '';
    try {
      decrypted = cryption.decrypt(content);
    } catch (error) {
      logger.error(`cryption.decrypt error: ${error}`);
    }
    event.returnValue = decrypted;
  });

  registerHandler('invoke.test', async (event, content) => {
    logger.debug(`receive handler: ${content}`);
    return Promise.reject(new Error('API请求失败')); // ⚡️ 触发 catch
    // return content;
  });
}

function unRegisterAll() {
  for(const [key, _] of ipcRegistry.listeners) {
    unRegisterListener(key);
  }
  for(const [key, _] of ipcRegistry.handlers) {
    unRegisterHandler(key);
  }
}

module.exports = {
  registerListener,
  unRegisterListener,
  registerHandler,
  unRegisterHandler,
  registerAll,
  unRegisterAll,
};




