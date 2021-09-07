const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

const userScriptBanner = `
// ==UserScript==
// @name         ${packageJson.name}
// @namespace    xxx
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @license      ${packageJson.license}
// @match        https://atcoder.jp/contests/*/submissions*
// @match        https://atcoder.jp/contests/*/submissions/me*
// @grant        none
// ==/UserScript==`.trim();

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: userScriptBanner,
      raw: true
    })
  ],
  optimization: {
    minimize: false
  }
};