
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

  // 日志文件轮转配置
  log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
  log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms}{scope}{text}'; // 设置文件内容格式
  const date = new Date();
  const dataStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  log.transports.file.fileName = dataStr + '.log'; // 创建文件名格式为 '时间.log' (2023-02-01.log)
  
  return log;
};

const logger = configureLogger();
logger.debug(`log path: ${ logger.transports.file?.getFile()?.path ?? '' }`);

const tag = '[TS][F][Main]';

export default  {
  info: (...args: any[]) => {
    logger.info(`${tag}[I]`, ...args);
  },                   
  warn: (...args: any[]) => {
    logger.warn(`${tag}[W]`, ...args);
  },
  error: (...args: any[]) => {
    logger.error(`${tag}[E]`, ...args);
  },
  debug: (...args: any[]) => {
    logger.debug(`${tag}[D]`, ...args);
  },
  verbose: (...args: any[]) => {
    logger.verbose(`${tag}[V]`, ...args);
  },
  silly: (...args: any[]) => {
    logger.silly(`${tag}[S]`, ...args);
  }
};

