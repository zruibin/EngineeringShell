
import log from 'electron-log/renderer';

const logger = log;
const tag = '[TS][F][App]';

export default {
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
