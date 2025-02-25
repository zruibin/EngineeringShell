/*
 * compile.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */
import path  from 'path';
import fs from 'fs';
import cryption from './cryption';

// async function importFsExtra() {
//   [
//     process.cwd()
//   ].forEach(p => {
//     module.paths.push(p);
//     module.paths.push(path.join(p, 'node_modules'));
//   });
//   const fsExtra = await import(`${require.resolve('fs-extra')}`);
//   return fsExtra;
// }

const isUsingCryption = true;
const distDir = './dist';

let excludeFiles: string[] = [];

function encryptFile(dir: string, productName: string) {
  const indexName = 'index.html';
  const fileName = 'index.js';
  const encryptFileName = 'index.ejs';
  const inputFile = path.join(dir, fileName);
  const outputFile = path.join(dir, encryptFileName);
  const indexFile = path.join(dir, indexName);

  try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const encryptData = cryption.encrypt(data);
    fs.writeFileSync(outputFile, encryptData);
    console.log("encryptFile:", outputFile);
    excludeFiles.push(`!${inputFile}`);
  } catch (error) {
    console.error("encryptFile error:", error);
  }

  const originCode = `<script defer="defer" src="./${fileName}" />`;
  const encryptCode = `
    const encryptCode = window.bridge.sendSync("readAppFileSync", "${outputFile}");
    const code = window.bridge.sendSync("cryption.decrypt", encryptCode);
    eval(code);
    `;

    const indexContent = `
  <!doctype html>
  <html>
  <head>
      <meta charset="utf-8">
      <title>${productName}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      ${ isUsingCryption ? '' : originCode }
  </head>
  <body>
  <script>
    ${ isUsingCryption ? encryptCode : '' }
  </script>
  </body></html>
  `;

  fs.writeFile(indexFile, indexContent, (error) => {
    if (error) {
      console.error(`修改index.html失败, error: ${error}`);
    } else {
      console.log("修改index.html成功！");
    }
  });
}

function isArrayIncluded(arr1, arr2) {
  return arr2.every(item => arr1.includes(item));
}

function getDirectoriesSync(dirPath) {
  return fs.readdirSync(dirPath)
    .filter(item => {
      const fullPath = path.join(dirPath, item);
      return fs.statSync(fullPath).isDirectory() && !['main'].includes(item);
    });
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
  const mainEntry = path.join(distDir, 'main/boot.js');
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
    const encryptDirs = getDirectoriesSync(distDir);
    console.log(`encryptDirs: ${JSON.stringify(encryptDirs)}`);
    encryptDirs.forEach(value => {
      encryptFile(path.join(distDir, value), packageJson?.productName ?? '');
    });
  }

  // 修改package.json中main入口
  try {
    let wirte = false;
    if (packageJson?.main !== mainEntry) {
      wirte = true;
      packageJson.main = mainEntry;
      console.log(`package.json已更新，main字段设置为: ${mainEntry}`);
    }

    if (isUsingCryption && packageJson?.build?.files && 
        !isArrayIncluded(packageJson?.build.files, excludeFiles)) {
      wirte = true;
      packageJson?.build.files.push(...excludeFiles);
      console.log(`package.json已更新，build.files字段设置为: ${JSON.stringify(packageJson?.build.files)}`);
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


