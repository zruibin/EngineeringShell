
import path from 'path';
import { app } from 'electron';
import log from 'electron-log/main';

log.initialize();

// 通用日志配置
const configureLogger = () => {
  log.transports.file.level = 'debug';
  log.transports.console.level = 'debug';
  
  log.transports.file.resolvePathFn = (variables: any) => {
    return path.join(app.getPath('userData'), 'logs', variables.fileName);
  };

  const format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} {text}';
  log.transports.console.format = format;

  // 日志文件轮转配置
  log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
  log.transports.file.format = format; // 设置文件内容格式
  const date = new Date();
  const dataStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  log.transports.file.fileName = dataStr + '.log'; // 创建文件名格式为 '时间.log' (2023-02-01.log)
  
  return log;
};

const logger = configureLogger();
logger.debug(`log path: ${ logger.transports.file?.getFile()?.path ?? '' }`);

export default logger;
