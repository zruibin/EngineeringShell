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


// 事件注册表（维护所有已注册的合法事件）
const ipcRegistry = new Map();

// 中间件核心逻辑
const ipcMiddleware = (channel, handler) => {
  // 注册合法事件
  ipcRegistry.set(channel, true);
  
  // 返回包装后的处理器
  return async (event, ...args) => {
    try {
      // 前置钩子（权限校验）
      // if (!validateSender(event.sender)) {
      //   return event.reply('error', '非法来源');
      // }

      // 执行原始处理器
      const result = await handler(event, ...args);
      
      // 后置钩子（日志记录）
      logger.info(`IPC成功: ${channel}`);
      
      return result;
    } catch (error) {
      // 错误处理
      event.reply('error', error.message);
      logger.error(error);
    }
  }
}

function registerChannel(channel, callback) {
  if (!channel || `${channel}`.length == 0) {
    
  }
  ipcMain.on(channel, ipcMiddleware(channel, callback));
}

function unRegisterChannel(channel) {
  if (ipcRegistry.has(channel)) {
    ipcMain.removeAllListeners(channel);
    ipcRegistry.delete(channel);
  }
}

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
  for(const [key, _] of ipcRegistry) {
    unRegisterChannel(key);
  }
}

module.exports = {
  registerChannel,
  unRegisterChannel,
  registerAllChannel,
  unRegisterAllChannel,
};




