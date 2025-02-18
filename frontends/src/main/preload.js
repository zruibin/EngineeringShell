/*
 * preload.js
 *
 * Created by Ruibin.Chow on 2025/02/17.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const { app } = require('electron');
const fs = require('fs');
const fsExtra = require("fs-extra");
const path = require('path');
const logger = require('./log');

const appPath = app.getAppPath();

function getPreloadPath() {
  let dev = false;
  if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
    dev = true;
  }

  let preloadPath = null;
  if (dev) {
    preloadPath = path.join(__dirname, 'dynamic_preload.js');
  } else {
    const userData = app.getPath('userData');
    preloadPath = path.join(userData, 'dynamic_preload.js');
  }
  return preloadPath;
}

// 动态生成 preload 脚本内容
const preloadContent = `
const { contextBridge, ipcRenderer } = require('electron');

// bytenode注入问题未解决，纯前端无法使用jsc方式!!!
// const bytenodePath = path.join("${appPath}", 'node_modules/bytenode/lib');
// console.log("bytenode路径:", bytenodePath);
// require(bytenodePath);

contextBridge.exposeInMainWorld('bridge', {
  hello: () => console.log('Hello from preload!'),
  // loadByteFile: (path) => require('bytenode').loadFile(path),

  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),
  getAppPath: () => { return "${appPath}"; },

  sendSync: (channel, data) => ipcRenderer.sendSync(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
`;

// 将内容写入临时文件
const preloadPath = getPreloadPath();
logger.debug(`preloadPath: ${preloadPath}`);
fs.writeFileSync(preloadPath, preloadContent);

function deletePreload() {
  if (fs.existsSync(preloadPath)) {
    logger.debug(`removeSync: ${preloadPath}`);
    fsExtra.removeSync(preloadPath)
  }
}

module.exports = {
  preloadPath,
  deletePreload
};


