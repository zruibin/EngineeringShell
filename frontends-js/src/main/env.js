/*
 * env.js
 *
 * Created by Ruibin.Chow on 2025/02/19.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

let dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development'
    && process.argv.indexOf('--noDevServer') === -1) {
  dev = true;
}

function isDev() {
  return dev;
}

module.exports = {
  isDev
}
