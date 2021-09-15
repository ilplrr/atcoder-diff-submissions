const packageJson = require('../package.json');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

const dependencies = packageJson.dependencies;
const targetModules = Object.keys(dependencies);
const modulesLicenses = [];
targetModules.forEach(module_name => {
    const p = path.resolve(__dirname, '../node_modules', module_name);
    const jsonPath = path.resolve(p, 'package.json');
    const json = require(jsonPath);

    const licenseFile = path.resolve(p, 'LICENSE*');
    let licenseText = "";

    const files = glob.sync(licenseFile);
    files.forEach(file => {
        const text = fs.readFileSync(file, 'utf8').toString();
        licenseText += text + '\n';
    })

    modulesLicenses.push({
        name: json.name,
        version: json.version,
        license: json.license,
        licenseText: licenseText
    });
});

const applyLinePrefix = (str) => {
    const prefix = ' *'
    return str.split(/\n/).map(line =>
        [prefix, line].join(' ').trimEnd()
    ).join('\n');
};
let bannerText = '/*! Dependent modules License\n';
bannerText += applyLinePrefix(modulesLicenses.map(e => Object.values(e).join('\n')).join('\n\n').trim());
bannerText += '\n *\n */\n';
fs.writeFileSync(path.join(__dirname, '../dist/licenses-banner.txt'), bannerText);
