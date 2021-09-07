import packageJson from "./package.json";

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
    format: 'iife'
  }
};