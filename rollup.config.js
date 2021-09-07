import packageJson from "./package.json";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const userScriptBanner = `
// ==UserScript==
// @name         ${packageJson.name}
// @namespace    xxx
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @license      ${packageJson.license}
// @match        https://atcoder.jp/contests/*/submissions
// @match        https://atcoder.jp/contests/*/submissions/me
// @grant        none
// ==/UserScript==`.trim();

export default {
  input: 'src/main.js',
  output: {
    banner: userScriptBanner,
    file: 'bundle.js',
    format: 'iife',
  },
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs({
      dynamicRequireTargets: [
        // include using a glob pattern (either a string or an array of strings)
        'node_modules/diff2html/**'
      ]
    }),
  ]
};