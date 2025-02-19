/*
 * check.js
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const fs = require('fs-extra');
const path = require('path');

async function updateMainField() {
  try {
    const packageJsonName = 'package.json';
    const parentDir = path.dirname(__dirname);
    const packageJsonPath = path.join(parentDir, packageJsonName);
    console.log(`packageJsonPath: ${packageJsonPath}`);

    const mainEntry = "src/main/main.js";
    const packageJson = await fs.readJson(packageJsonPath);

    if (packageJson.main !== mainEntry) {
      packageJson.main = mainEntry;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log(`package.json 已更新，main 字段设置为: ${mainEntry}`);
    }
  } catch (error) {
    console.error('更新 package.json 失败:', error);
  }
}

updateMainField();