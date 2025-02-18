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
  registerHandler(channel, handler);
  return originalHandle.call(ipcMain, channel, async (event, ...args) => {
    try {
      // 前置通用逻辑
      validateChannel(channel);
      logCall('handle', channel, args);
      
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
  registerListener(channel, listener);
  return originalOn.call(ipcMain, channel, (event, ...args) => {
    try {
      // 前置通用逻辑
      validateChannel(channel);
      logCall('on', channel, args);
      
      // 执行原始监听器
      return listener(event, ...args);
    } catch (error) {
      handleError(error, event, channel);
      return error;
    }
  });
}

// ========== 工具函数 ==========
function registerHandler(channel, handler) {
  ipcRegistry.handlers.set(channel, {
    handler,
    callCount: 0,
    lastCalled: Date.now()
  })
}

function registerListener(channel, listener) {
  ipcRegistry.listeners.set(channel, {
    listener,
    callCount: 0,
    lastCalled: Date.now()
  })
}

function validateChannel(channel) {
  // const allowedChannels = ['app:quit', 'file:read']
  // if (!allowedChannels.includes(channel)) {
  //   throw new Error(`非法 IPC 通道: ${channel}`)
  // }
}

function logCall(type, channel, args) {
  logger.info(`[IPC] ${type.toUpperCase()} ${channel}`, args)
}

function handleError(error, event, channel) {
  logger.error(`[IPC Error] ${channel}:`, error);
  // event.sender.send('ipc-error', {
  //   channel,
  //   message: error.message
  // })
}

/******************************************************************************/

function registerChannel(channel, callback) {
  ipcMain.on(channel, callback);
}

function unRegisterChannel(channel) {
  if (ipcRegistry.listeners.has(channel)) {
    ipcRegistry.listeners.delete(channel);
  }
}

// function registerHandler(channel, callback) {
//   ipcMain.handle(channel, callback);
// }

// function unRegisterHandler(channel) {
//   if (ipcRegistry.handlers.has(channel)) {
//     ipcMain.removeHandler(channel);
//     ipcRegistry.handlers.delete(channel);
//   }
// }

function registerAllChannel() {
  registerChannel('get-app-version', (event) => {
    event.returnValue = app.getVersion();
  });

  registerChannel('readAppFileSync', (event, filePath) => {
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

  registerChannel('cryption.encrypt', (event, content) => {
    let encrypted = '';
    try {
      encrypted = cryption.encrypt(content);
    } catch (error) {
      logger.error(`cryption.encrypt error: ${error}`);
    }
    event.returnValue = encrypted;
  });

  registerChannel('cryption.decrypt', (event, content) => {
    let decrypted = '';
    try {
      decrypted = cryption.decrypt(content);
    } catch (error) {
      logger.error(`cryption.decrypt error: ${error}`);
    }
    event.returnValue = decrypted;
  });

  ipcMain.handle('invoke.test', async (event, content) => {
    logger.debug(`receive handler: ${content}`);
    return Promise.reject(new Error('API请求失败')); // ⚡️ 触发 catch
    // return content;
  });

  // 通配符监听器（必须最后注册）???
  // ipcMain.on('*', (event, channel, ...args) => {
  //   logger.debug(`处理channel: ${channel}`);
  //   if (!ipcRegistry.has(channel)) {
  //     event.reply('error', `未注册的IPC通道: ${channel}`)
  //     event.preventDefault() // 阻止默认处理
  //   }
  // });
}

function unRegisterAllChannel() {
  for(const [key, _] of ipcRegistry.listeners) {
    unRegisterChannel(key);
  }
}

module.exports = {
  registerChannel,
  unRegisterChannel,
  registerAllChannel,
  unRegisterAllChannel,
};




