const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const logger = require('./log');
const channel = require('./channel/channel');
const runSubPrograms = require('./subPrograms');
const registerCrashReport = require('./crash');
const { preloadPath, deletePreload } = require('./preload');

const appPath = app.getAppPath();
let mainWindow = null;

let dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

function createIndexPath() {
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    const filePath = path.join(appPath, 'dist/renderer/', 'index.html');
    indexPath = url.format({
      protocol: 'file:',
      pathname: filePath,
      slashes: true
    });
  }
  return indexPath;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: false, // 建议保持禁用以增强安全性
      contextIsolation: true, // 启用上下文隔离
      sandbox: true, // 是否使用沙盒
      preload: preloadPath, // 指定预加载脚本
    }
  });
  registerMainWindowEvent();

  const indexPath = createIndexPath();
  mainWindow.loadURL(indexPath);
  logger.info("main.js loaded.", "indexPath:", indexPath);
}

function registerMainWindowEvent() {
   mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }

    initChannel();
  });

  mainWindow.on('close', (event) => {
    logger.debug(`mainWindow close, event(${JSON.stringify(event)})`);
    showExitAlert(event);
  });

  mainWindow.on('closed', (event) => {
    logger.debug(`mainWindow closed, event(${JSON.stringify(event)})`);
    mainWindow = null;
  });
}

function registerAppEvent() {
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
    showExitAlert(event);
  });

  app.on('quit', (event, exitCode) => {
    destory();
    logger.info(`app quit, exitCode(${exitCode})`);
  });
}

function showExitAlert(event) {
  // 阻止默认退出行为
  event.preventDefault();

  // 弹出同步确认对话框
  const result = dialog.showMessageBoxSync(mainWindow, {
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
    mainWindow.hide();
  }
}

function initChannel() {
  channel.onReceive(msg => {
    logger.debug('收到服务器消息:', msg);
  });
  channel.asyncRun().then(code => {
      logger.info(`asyncRun, code(${code})`);
      channel.send(logger.filePath());
  }).catch(error => {
      logger.error('连接错误:', error);
  });
}

function init() {
  logger.debug("init.");
  createWindow();
  registerCrashReport(mainWindow);
  runSubPrograms();
}

function destory() {
  logger.debug("destory.");
  channel.close();
  deletePreload();
}


const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.error("It was not single instance then app quit.");
  app.quit();
} else {
  registerAppEvent();
}

ipcMain.on('get-app-version', (event) => {
  event.returnValue = app.getVersion();
});


