// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const logger = require('./log');
const channel = require("./channel/channel");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

// Keep a reference for dev mode
let dev = false;

// Broken:
// if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
//   dev = true
// }

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    const appPath = app.getAppPath();
    let filePath = path.join(appPath, 'dist/renderer/', 'index.html');
    indexPath = url.format({
      protocol: 'file:',
      pathname: filePath,
      slashes: true
    });
  }

  mainWindow.loadURL(indexPath);
  logger.info("main.js loaded.", "indexPath:", indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }

    channel.onReceive(msg => {
      logger.debug('收到服务器消息:', msg);
    });
    channel.asyncRun().then(code => {
        logger.info(`asyncRun, code(${code})`);
        channel.send(logger.filePath());
    }).catch(error => {
        logger.error('连接错误:', error);
    });
  })

  mainWindow.on('close', (event) => {
    logger.debug(`mainWindow close, event(${JSON.stringify(event)})`);
    showExitAlert(event);
  });

  mainWindow.on('closed', (event) => {
    logger.debug(`mainWindow closed, event(${JSON.stringify(event)})`);
    mainWindow = null;
  });
}

function runSubProgram() {
  logger.debug(`log path: ${ logger.filePath() }`)
  const appPath = app.getAppPath();
  logger.debug(`appPath: ${appPath}`);
  let subprogramsPath;
  if (app.isPackaged) {
    subprogramsPath = path.join(appPath, '..', 'subprograms');
  } else {
    subprogramsPath = path.join(appPath, 'subprograms');
  }

  // 确定子程序的可执行文件路径
  const platform = process.platform;
  let subprogramExecutable;
  const name = "Backends";

  switch (platform) {
    case 'darwin':
      subprogramExecutable = path.join(subprogramsPath, name); // macOS 可执行文件通常无扩展名
      break;
    case 'win32':
      subprogramExecutable = path.join(subprogramsPath, `${name}.ext`);
      break;
    case 'linux':
      subprogramExecutable = path.join(subprogramsPath, `${name}-linux`);
      break;
    default:
      console.error('Unsupported platform.');
      return;
  }

  logger.info(`subprogramPath: ${subprogramExecutable}`);

  const { execFile } = require('child_process');
  execFile(subprogramExecutable, ['arg1', 'arg2'], (error, stdout, stderr) => {
    if (error) {
      logger.error(`执行子程序出错: ${error.message}`);
      return;
    }
    if (stderr) {
      logger.error(`子程序输出错误: ${stderr}`);
      return;
    }
    logger.info(`子程序输出: ${stdout}`);
  });
}

function init() {
  runSubProgram();
  createWindow();
}

function destory() {
  channel.close();
}


const gotTheLock = app.requestSingleInstanceLock();
 
if (!gotTheLock) {
  logger.error("It was not single instance then app quit.");
  app.quit();
} else {
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



