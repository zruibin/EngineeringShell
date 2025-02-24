/*
 * compile.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */
import path  from 'path';
import fs from 'fs';
import cryption from './cryption';

const isUsingCryption = true;

const distPath = 'dist/renderer/';
const fileName = 'index.js';
const encryptFileName = 'index.ejs';
const inputPath = path.join(distPath, fileName);
const outputPath = path.join(distPath, encryptFileName);

function encryptFile() {
  try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const encryptData = cryption.encrypt(data);
    fs.writeFileSync(outputPath, encryptData);
    console.error("encryptFile:", outputPath);
  } catch (error) {
    console.error("encryptFile error:", error);
  }
}

async function complieFunction() {
  const packageJsonName = "package.json";
  const projectDir = process.cwd();
  const packageJsonPath = path.join(projectDir, packageJsonName);
  console.log(`packageJsonPath: ${packageJsonPath}`);

  let packageJson = null;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));;
  } catch (error) {
    console.error("读取 package.json 失败:", error);
  }

  // 创建dist/main/boot.js
  const mainEntry = "dist/main/boot.js";
  const bootPath = path.join(projectDir, mainEntry);
  const bootContent = `
require('bytenode');
require('./index.jsc');
`;
  fs.writeFile(bootPath, bootContent, (error) => {
    if (error) {
      console.log(`生成boot.js失败, error: ${error}`);
    } else {
      console.log("生成boot.js成功！");
    }
  });

  if (isUsingCryption) {
    encryptFile();
  }

  // 修改dist/renderer/index.html
  const indexEntry = "dist/renderer/index.html";
  const indexPath = path.join(projectDir, indexEntry);

  const originCode = `<script defer="defer" src="./${fileName}" />`;
  const encryptCode = `
  const encryptCode = window.bridge.sendSync("readAppFileSync", "${outputPath}");
  const code = window.bridge.sendSync("cryption.decrypt", encryptCode);
  eval(code);
  `;

  const indexContent = `
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${packageJson?.productName}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    ${ isUsingCryption ? '' : originCode }
</head>
<body>
<script>
  ${ isUsingCryption ? encryptCode : '' }
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
    let wirte = false;
    if (packageJson.main !== newMainEntry) {
      wirte = true;
      packageJson.main = newMainEntry;
      console.log(`package.json已更新，main字段设置为: ${newMainEntry}`);
    }

    const excludeFile = `!${inputPath}`;
    if (isUsingCryption && packageJson.build?.files && 
        !packageJson.build.files.includes(excludeFile)) {
      wirte = true;
      packageJson.build.files.push(path.join(excludeFile));
      console.log(`package.json已更新，build.files字段设置为: ${JSON.stringify(packageJson.build.files)}`);
    }
    if (wirte) {
      const data = JSON.stringify(packageJson, null, 2);
      fs.writeFileSync(packageJsonPath, data);
    }
  } catch (error) {
    console.error("更新 package.json 失败:", error);
  }
}

complieFunction();


