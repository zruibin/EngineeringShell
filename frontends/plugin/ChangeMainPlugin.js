/*
 * ChangeMainPlugin.js
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const fs = require('fs');
const path = require('path');

class ChangeMainPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync('ChangeMainPlugin', (stats, callback) => {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      const packageJson = require(packageJsonPath);

      // 修改main字段
      packageJson.main = this.options.newMain;

      // 写回package.json文件
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      callback();
    });
  }
}

module.exports = ChangeMainPlugin;