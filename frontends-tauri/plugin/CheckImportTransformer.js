/*
 * CheckImportTransformer.js
 *
 * Created by Ruibin.Chow on 2025/03/21.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const ts = require('typescript');

// 禁止导入的库列表
const BANNED_LIBS = ['@tauri-apps/api'];

// 豁免检查的文件路径正则
const WHITE_LIST = [
  /src\/bridge.ts/
];

function isInWhiteList(filePath) {
  return WHITE_LIST.some(pattern => pattern.test(filePath));
}


function CheckImportTransformer(ctx) {
  return (sourceFile) => {
    const visitor = (node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText(sourceFile);
        const isBanned = BANNED_LIBS.some(lib => 
          moduleSpecifier.includes(lib)
        );

        if (isBanned && !isInWhiteList(sourceFile.fileName)) {
          throw new Error(
            `[TS-Loader拦截] 禁止导入 ${moduleSpecifier}，请移除该依赖, 在bridge.ts中统一封装！\n` +
            `文件路径：${sourceFile.fileName}`
          );
        }
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return ts.visitNode(sourceFile, visitor);
  };
}

module.exports = CheckImportTransformer;

