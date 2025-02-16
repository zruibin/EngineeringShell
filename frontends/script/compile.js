/*
 * compile.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const fs = require('fs-extra');
const path = require("path");

async function complieFunction() {
  const packageJsonName = "package.json";
  const parentDir = path.dirname(__dirname);
  const packageJsonPath = path.join(parentDir, packageJsonName);
  console.log(`packageJsonPath: ${packageJsonPath}`);

  let packageJson = null;
  try {
    packageJson = await fs.readJson(packageJsonPath);
  } catch (error) {
    console.error("读取 package.json 失败:", error);
  }

  // 创建dist/main/boot.js
  const mainEntry = "dist/main/boot.js";
  const bootPath = path.join(parentDir, mainEntry);
  const bootContent = `
require('bytenode');
require('./main.jsc');
`;
  fs.writeFile(bootPath, bootContent, (error) => {
    if (error) {
      console.log(`生成boot.js失败, error: ${error}`);
    } else {
      console.log("生成boot.js成功！");
    }
  });

  // 修改dist/renderer/index.html
  const indexEntry = "dist/renderer/index.html";
  const indexPath = path.join(parentDir, indexEntry);
  const indexContent = `
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${packageJson?.productName}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>
<script>
    require('bytenode');
    require('./main.jsc');
</script>
</body></html>
`;

  fs.writeFile(indexPath, indexContent, (error) => {
    if (error) {
      console.log(`修改index.html失败, error: ${error}`);
    } else {
      console.log("修改index.html成功！");
    }
  });

  // 修改package.json中main入口
  const newMainEntry = "dist/main/boot.js";
  try {
    if (packageJson.main !== newMainEntry) {
      packageJson.main = newMainEntry;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log(`package.json 已更新，main 字段设置为: ${newMainEntry}`);
    }
  } catch (error) {
    console.error("更新 package.json 失败:", error);
  }
}

complieFunction();


