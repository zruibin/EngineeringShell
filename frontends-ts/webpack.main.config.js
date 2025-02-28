/*
 * webpack.main.js
 *
 * Created by Ruibin.Chow on 2025/02/20.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const LogTransformer = require('./plugin/LogTransformer.js');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  target: 'electron-main',
  entry: './src/main/index.ts',
  externals: [nodeExternals()],
  devtool: isProd ? 'source-map' : 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'babel-loader' }, 
          { 
            loader: 'ts-loader', 
            options: { 
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [LogTransformer] // 在编译阶段应用转换器
              })
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    alias: {
      '@:': path.resolve(__dirname, 'src') // 路径指向 src 目录
    }
  },
  plugins: isProd ? [] : [
    // 仅在初始构建完成后启动 Electron（避免 watch 模式重复启动）
    new WebpackShellPluginNext({
      onBuildStart: false,
      onBuildEnd: {
        scripts: ['electron .'], 
        blocking: false, // 非阻塞模式（允许与渲染进程并行）
        parallel: true,
        // 添加安全校验：确保 index.js 存在
        env: { 
          CHECK_FILE: path.resolve(__dirname, 'dist/main/index.js')
        }
      },
    }),
  ],
  watch: !isProd, // 保持监听模式
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/main')
  }
};

