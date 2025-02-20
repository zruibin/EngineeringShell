/*
 * compile.js
 *
 * Created by Ruibin.Chow on 2025/02/16.
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
const cryption = require(path.join(process.cwd(), '../frontends-common/script/cryption'));

const isUsingCryption = true;

const distPath = 'dist/renderer/';
const fileName = 'main.js';
const encryptFileName = 'main.ejs';
const inputPath = path.join(distPath, fileName);
const outputPath = path.join(distPath, encryptFileName);

function encryptFile() {
  try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const encryptData = cryption.encrypt(data);
    fs.writeFileSync(outputPath, encryptData);
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
    packageJson = await fs.readJson(packageJsonPath);
  } catch (error) {
    console.error("读取 package.json 失败:", error);
  }

  // 创建dist/main/boot.js
  const mainEntry = "dist/main/boot.js";
  const bootPath = path.join(projectDir, mainEntry);
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
      eval(code);`;

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
  // 纯前端隔离方法无法使用jsc
  // window.bridge.loadByteFile('./main.jsc');
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
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  } catch (error) {
    console.error("更新 package.json 失败:", error);
  }
}

complieFunction();


