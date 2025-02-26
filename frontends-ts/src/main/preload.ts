
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import fsExtra from 'fs-extra';
import env from './env';
import logger from './log';


function getPreloadPath(): string {
  let preloadPath = null;
  if (env.isDev()) {
    preloadPath = path.join(__dirname, 'dynamic_preload.js');
  } else {
    const userData = app.getPath('userData');
    preloadPath = path.join(userData, 'dynamic_preload.js');
  }
  return preloadPath;
}

const appPath = app.getAppPath();

// 动态生成 preload 脚本内容
const preloadContent = `
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bridge', {
  hello: () => console.log('Hello from preload!'),

  getAppVersion: () => ipcRenderer.sendSync('get-app-version'),
  getAppPath: () => { return "${appPath}"; },

  sendSync: (channel, data) => ipcRenderer.sendSync(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  invoke: (channel, ...args) => { return ipcRenderer.invoke(channel, ...args) },
});
`;

// 将内容写入临时文件
export const preloadPath = getPreloadPath();
logger.debug(`preloadPath: ${preloadPath}`);
fs.writeFileSync(preloadPath, preloadContent);

export function deletePreload() {
  if (fs.existsSync(preloadPath)) {
    logger.debug(`removeSync: ${preloadPath}`);
    fsExtra.removeSync(preloadPath);
  }
}

