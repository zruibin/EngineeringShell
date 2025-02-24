const webpack = require('webpack')
const path = require('path')
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
// const ChangeMainPlugin = require('./plugin/ChangeMainPlugin');

const pluginsDev = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  })
];

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  // new ChangeMainPlugin({
  //   newMain: 'dist/main/index.js' // 指定新的main字段值
  // })
];

module.exports = (mode) => {
  const isProduction = !(mode.WEBPACK_SERVE == true);
  console.log('Env: '+ (isProduction ? 'production' : 'development'));
  return {
    target: 'electron-main',
    devtool: 'none',
    entry: './src/main/index.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist/main')
    },
    resolve: {
      modules: [
        path.resolve(__dirname, '../frontends-common/script'),
        'node_modules',
      ],
    },
    externals: [nodeExternals()],
    plugins: isProduction ? plugins : pluginsDev,
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    stats: isProduction ? {
      colors: true,
      children: false,
      chunks: false
    } : {},
    optimization: isProduction ? {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // 去除注释
          },
        },
        extractComments: "all"
      })],
    } : {}
  }
}
