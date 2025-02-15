const webpack = require('webpack')
const path = require('path')
const TerserPlugin = require("terser-webpack-plugin");
const ChangeMainPlugin = require('./plugin/ChangeMainPlugin');

const pluginsDev = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  })
];

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  new ChangeMainPlugin({
    newMain: 'dist/main/main.js' // 指定新的main字段值
  })
];

module.exports = (mode) => {
  const isProduction = !(mode.WEBPACK_SERVE == true);
  console.log('Env: '+ (isProduction ? 'production' : 'development'));
  return {
    target: 'electron-main',
    devtool: 'none',
    entry: "./src/main" + '/main',
    output: {
      path:path.join(__dirname,'./dist/main/'),
      filename:'[name].js',
      clean: true,
    },
    plugins: isProduction ? plugins : pluginsDev,
    devtool: isProduction ? 'source-map':'inline-source-map',
  
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
