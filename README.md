
# EngineeringShell

## 前端使用Typescript开发的工程

* https://github.com/electron-react-boilerplate/electron-react-boilerplate

## package.json中使用node执行ts脚本

```
# 安装 esbuild-register 和 Node.js 类型定义
npm install --save-dev esbuild esbuild-register @types/node
node --require esbuild-register ../frontends-common/script/check.ts
```

## 使用 esbuild 将ts编译为js

```
npm install esbuild --save-dev
# 创建编译脚本 build.mjs 如 frontend-js/build.mjs
执行 node build.mjs即可
引入时最好把.js带上，否则有可能搜索的是.ts的
```