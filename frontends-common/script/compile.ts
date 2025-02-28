/*
 * compile.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */
import path  from 'path';
import fs from 'fs';
import * as cryption from './cryption';

[
  process.cwd()
].forEach(p => {
  module.paths.push(p);
  module.paths.push(path.join(p, 'node_modules'));
});

const distDir = './dist';

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
  } catch (error) {
    console.error("encryptFile error:", error);
  }

  const encryptCode = `
    const encryptCode = window.bridge.sendSync("readAppFileSync", "${outputFile}");
    const code = window.bridge.sendSync("cryption.decrypt", encryptCode);
    try {
      const codeFunc = new Function(code);
      codeFunc();
    } catch (err) {
      console.error('执行失败:', err);
    }
    `;

    const indexContent = `
  <!doctype html>
  <html>
  <head>
      <meta charset="utf-8">
      <title>${productName}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body>
  <script>
    ${ encryptCode }
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

async function complieFunction(isRecover: Boolean = false) {
  const isUsingCryption = cryption.enableCryption();
  console.log(`isUsingCryption: ${isUsingCryption}, enable: ${cryption.enableCryption()}`);
  if (!isUsingCryption) {
    return;
  }
  const projectDir = process.cwd();
  const packageJsonName = "package.json";
  const packageJsonBakName = "package.json.bak";
  const packageJsonPath = path.join(projectDir, packageJsonName);
  const packageJsonBakPath = path.join(projectDir, packageJsonBakName);
  console.log(`packageJsonPath: ${packageJsonPath}`);

  if (isRecover) {
    try {
      fs.rmSync(packageJsonPath);
      fs.renameSync(packageJsonBakPath, packageJsonPath);
    } catch (err) {
      console.error(`${packageJsonName}文件复原失败: ${err}`);
    }
    return;
  }

  const bytenode = await import(`${require.resolve('bytenode')}`);
  // console.log('bytenode', bytenode);
  bytenode.default.compileFile({
    filename: path.join(projectDir, distDir, 'main/index.js'),
    electron: true
  }).then(() => {
    console.log('bytenode successful.');
  }).catch(err => {
    console.error('bytenode failed:', err);
  });;

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
delete require.cache[require.resolve('./index.jsc')];
require('./index.jsc');
`;
  fs.writeFile(bootPath, bootContent, (error) => {
    if (error) {
      console.log(`生成boot.js失败, error: ${error}`);
    } else {
      console.log("生成boot.js成功！");
    }
  });


  const encryptDirs = getDirectoriesSync(distDir);
  console.log(`encryptDirs: ${JSON.stringify(encryptDirs)}`);
  encryptDirs.forEach(value => {
    encryptFile(path.join(distDir, value), packageJson?.productName ?? '');
  });

  // 修改package.json中main入口
  try {
    let wirte = false;
    if (packageJson?.main !== mainEntry) {
      wirte = true;
      packageJson.main = mainEntry;
      console.log(`package.json已更新，main字段设置为: ${mainEntry}`);
    }

    if (packageJson?.build?.files) {
      wirte = true;
      packageJson?.build?.files.splice(0, packageJson?.build?.files.length);
      packageJson?.build?.files.push(...[
        "dist/main/boot.js",
        "dist/main/index.jsc",
        "dist/**/*.{html,htm,jsc,ejs}",
        "!dist/**/*.{map,txt}",
        "node_modules/**/*",
        "!node_modules/**/*/{README,readme,LICENSE,license}",
        "!node_modules/**/*/*.{md,map,txt}"
      ]);
      console.log(`package.json已更新，build.files字段设置为: ${JSON.stringify(packageJson?.build.files)}`);
    }
    if (wirte) {
      const data = JSON.stringify(packageJson, null, 2);
      fs.renameSync(packageJsonPath, packageJsonBakPath);
      fs.writeFileSync(packageJsonPath, data);
    }
  } catch (error) {
    console.error("更新 package.json 失败:", error);
  }
}

const args = process.argv.slice(2);
if (args?.length > 0 && args[0] === '--recover') {
  complieFunction(true);
} else {
  complieFunction();
}


