const webpack = require('webpack')
const path = require('path')
const { spawn } = require('child_process')
const TerserPlugin = require("terser-webpack-plugin");

const appPath = "./src/main"
const defaultInclude = path.resolve(__dirname, appPath)

const pluginsDev = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  })
];

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
];

module.exports = (mode) => {
  const isProduction = !(mode.WEBPACK_SERVE == true);
  console.log('Env: '+ (isProduction ? 'production' : 'development'));
  return {
    target: 'electron-main',
    entry: appPath + '/main',
    output: {
      path:path.join(__dirname,'./dist/main/'),
      filename:'[name].js',
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
