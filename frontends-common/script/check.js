/*
 * check.js
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const path = require('path');
// 添加自定义搜索路径
[
  process.cwd()
].forEach(p => {
  module.paths.push(p);
  module.paths.push(path.join(p, 'node_modules'));
});

const fs = require('fs-extra');

async function updateMainField() {
  try {
    const packageJsonName = 'package.json';
    const tsconfigJsonName = 'tsconfig.json';
    const projectDir = process.cwd();
    const packageJsonPath = path.join(projectDir, packageJsonName);
    const tsconfigPath = path.join(projectDir, tsconfigJsonName);
    console.log(`packageJsonPath: ${packageJsonPath}`);

    const mainEntry = fs.existsSync(tsconfigPath) ? "dist/main/main.js" : "src/main/main.js";
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