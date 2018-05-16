const fs = require('fs');

function filter (files, { exclude = [] } = {}) {
  return files.filter(file => {
    if (exclude.includes(file)) return false;
    if (/^\..*/.test(file)) {
      return false;
    }
    return true;
  });
}

function getTree (root, options) {
  let obj;
  if (fs.lstatSync(root).isDirectory()) {
    // 文件夹
    obj = {};
    let files = fs.readdirSync(root);
    files = filter(files, options);
    files.forEach(file => {
      obj[file] = getTree(`${root}/${file}`, options, obj);
    });
  } else {
    // 文件
    obj = root.slice(root.lastIndexOf('/') + 1);
  }

  return obj;
};

/**
 * 获取文件夹下的树结构
 * @param {String} root 根路径
 * @param {Object} options 获取
 */
module.exports = getTree;
