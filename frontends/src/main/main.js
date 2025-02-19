const { app } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const logger = require('./log');
const env = require('./env');
const windowManager = require('./manager/WindowManager');
const channel = require('./channel/channel');
const runSubPrograms = require('./subPrograms');
const registerCrashReport = require('./crash');
const { deletePreload } = require('./preload');
const ipcManager = require('./manager/IPCManager');

let mainWindow = null;

function createMainPath() {
  let mainPath;
  if (env.isDev()) {
    mainPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    const appPath = app.getAppPath();
    const filePath = path.join(appPath, 'dist/renderer/', 'index.html');
    mainPath = url.format({
      protocol: 'file:',
      pathname: filePath,
      slashes: true
    });
  }
  logger.debug(`mainPath: ${mainPath}`);
  return mainPath;
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
    // showExitAlert(event);
  });

  app.on('quit', (event, exitCode) => {
    destory();
    logger.info(`app quit, exitCode(${exitCode})`);
  });
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
  logger.debug("app init.");
  registerCrashReport();
  runSubPrograms();
  ipcManager.registerAll();

  const loadFileUrl = createMainPath();
  mainWindow = windowManager.createWindow({
    name: "main",
    width: 1024,
    height: 768,
    loadFileUrl,
    willShow: () => {
      initChannel();
    }
  });
}

function destory() {
  logger.debug("app destory.");
  ipcManager.unRegisterAll();
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



