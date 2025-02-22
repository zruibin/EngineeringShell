/*
 * check.ts
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

import path  from 'path';
import fs from 'fs';

async function updateMainField() {
  try {
    const packageJsonName = 'package.json';
    const tsconfigJsonName = 'tsconfig.json';
    const projectDir = process.cwd();
    const packageJsonPath = path.join(projectDir, packageJsonName);
    const tsconfigPath = path.join(projectDir, tsconfigJsonName);
    console.log(`packageJsonPath: ${packageJsonPath}`);

    const mainEntry = fs.existsSync(tsconfigPath) ? "dist/main/main.js" : "src/main/main.js";
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.main !== mainEntry) {
      packageJson.main = mainEntry;
      const data = JSON.stringify(packageJson, null, 2);
      fs.writeFileSync(packageJsonPath, data);
      console.log(`package.json 已更新，main 字段设置为: ${mainEntry}`);
    }
  } catch (error) {
    console.error('更新 package.json 失败:', error);
  }
}

updateMainField();
