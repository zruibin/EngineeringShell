/*
 * webpack.renderer.js
 *
 * Created by Ruibin.Chow on 2025/02/20.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  target: 'web',
  entry: './src/renderer/index.tsx',
  devtool: isProd ? 'source-map' : 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              ['@babel/preset-react', {
                runtime: 'automatic' // 启用新JSX转换
              }]
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    alias: {
      '@:': path.resolve(__dirname, 'src') // 路径指向 src 目录
    }
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/renderer')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html'
    })
  ],
  devServer: isProd ? {} : {
    port: 3000,
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist/renderer')
    }
  }
};

