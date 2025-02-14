// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const logger = require('./log');
let tag = "[main]";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

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
    const dirname = __dirname.replace("/src/main", "");
    let filePath = path.join(dirname, 'dist', 'index.html');
    indexPath = url.format({
      protocol: 'file:',
      pathname: filePath,
      slashes: true
    });
  }

  loadSubProgram();

  mainWindow.loadURL(indexPath);
  logger.info(tag, "main.js loaded.", "indexPath:", indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
  })
}


const gotTheLock = app.requestSingleInstanceLock();
 
if (!gotTheLock) {
  logger.error(tag, "It was not single instance then app quit.");
  app.quit();
} else {
  app.on('ready', () => {
    createWindow();
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  })
}

function loadSubProgram() {
  const appPath = app.getAppPath();
  logger.debug(tag, `appPath: ${appPath}`);
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

  logger.info(tag, `subprogramPath: ${subprogramExecutable}`);

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

