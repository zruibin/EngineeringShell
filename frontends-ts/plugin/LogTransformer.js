/*
 * LogTransformer.js
 *
 * Created by Ruibin.Chow on 2025/02/28.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const path = require('path');
const ts = require('typescript');

function LogTransformer(ctx) {
  return (sourceFile) => {
    const visitor = (node) => {
      const fileName = path.relative(process.cwd(), sourceFile.fileName);
      const funcNames = [
        'info',
        'debug'
      ];
      if (ts.isCallExpression(node) && !fileName.includes('log.ts') && fileName.includes('src')) {
        if (
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'logger' &&
          funcNames.includes(node.expression.name.text)
        ) {
          // 获取文件名和行号
          // const fileName = path.relative(process.cwd(), sourceFile.fileName);
          const fileName = path.basename(sourceFile.fileName);
          const lineNumber = ts.getLineAndCharacterOfPosition(
            sourceFile,
            node.getStart()
          ).line + 1;

          // console.log(`fileName: ${fileName}, lineNumber: ${lineNumber}`);
          const insertArg = `[${fileName}:${lineNumber}]`;

          // 创建新参数节点
          const newArgs = [
            ts.factory.createStringLiteral(insertArg),
            // ts.factory.createNumericLiteral(lineNumber.toString()),
            ...node.arguments
          ];

          // 替换原调用表达式
          return ts.factory.updateCallExpression(
            node,
            node.expression,
            node.typeArguments,
            newArgs
          );
        }
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return ts.visitNode(sourceFile, visitor);
  };
}

module.exports = LogTransformer;

