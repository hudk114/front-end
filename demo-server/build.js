const getTree = require('./tree');
const path = require('path');

module.exports = getTree(path.resolve(__dirname, '../'), {
  exclude: [
    'node_modules',
    'demo-server',
    'package-lock.json',
    'package.json',
    'prettier.config.js'
  ]
});
