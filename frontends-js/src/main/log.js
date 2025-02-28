/*
 * log.js
 *
 * Created by Ruibin.Chow on 2023/05/02.
 * Copyright (c) 2023年 Ruibin.Chow All rights reserved.
 */

const { app, ipcMain } = require('electron');
const path = require('path');
const logger = require('electron-log')
 
logger.transports.file.resolvePath = (variables) => {
  // 自定义路径：例如，将日志保存到用户数据目录下的 logs 文件夹
  return path.join(app.getPath('userData'), 'logs', variables.fileName);
};

logger.transports.file.level = 'debug';
logger.transports.file.maxSize = 1002430; // 最大不超过10M
logger.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms}{scope}{text}'; // 设置文件内容格式
let date = new Date();
date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
logger.transports.file.fileName = date + '.log'; // 创建文件名格式为 '时间.log' (2023-02-01.log)

logger.info("-------------------------------------------------------------------------------");

/*
Linux: ~/.config/<app name>/log.log
mac: ~/Library/Logs/<app name>/log.log
windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
*/
 
 // 可以将文件放置到指定文件夹中，例如放到安装包文件夹中
//  const path = require('path')
//  const exePath = path.dirname("/Users/ruibin.chow/Desktop/") // 获取到安装目录的文件夹名称
// 指定日志文件夹位置
//  logger.transports.file.resolvePath = () => exePath+date+'.log'
logger.debug(`log path: ${ logger.transports.file?.getFile()?.path ?? '' }`)

const tag = "[F][Main]";

// 有六个日志级别error, warn, info, verbose, debug, silly。默认是silly
module.exports = {
  info() {
    logger.info(`${tag}[I]`, ...arguments);
  },                   
  warn() {
    logger.warn(`${tag}[W]`, ...arguments);
  },
  error() {
    logger.error(`${tag}[E]`, ...arguments);
  },
  debug() {
    logger.debug(`${tag}[D]`, ...arguments);
  },
  verbose() {
    logger.verbose(`${tag}[V]`, ...arguments);
  },
  silly() {
    logger.silly(`${tag}[S]`, ...arguments);
  },

  filePath() {
    return logger.transports.file?.getFile()?.path ?? '';
  },

  i() {
    logger.info(...arguments);
  },                   
  w() {
    logger.warn(...arguments);
  },
  e() {
    logger.error(...arguments);
  },
  d() {
    logger.debug(...arguments);
  },
  v() {
    logger.verbose(...arguments);
  },
  s() {
    logger.silly(...arguments);
  },
};


