const express = require('express');
const app = express();
const path = require('path');

function dateDecorator (str) {
  const fix = n => (n < 10 ? `0${n}` : n);

  const d = new Date();
  return `${[d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map(fix)
    .join('-')} ${[d.getHours(), d.getMinutes() + 1, d.getSeconds()]
    .map(fix)
    .join(':')} ${str}`;
}

// node的require会缓存，因此需要将缓存清除
// 当然，也可采用fs动态读入文件，我懒 :-o
function removeCache (p) {
  if (require.cache[p]) {
  } else if (require.cache[`${p}.js`]) {
    p += '.js';
  } else if (require.cache[`${p}.json`]) {
    p += '.json';
  }

  delete require.cache[p];
}

app.use((req, res, next) => {
  console.log(dateDecorator(`[REQUEST] ${req.method} request for ${req.headers.host}${req.path}`));
  next();
});

/* 如果需要添加自己的mock，在这填写 */

// 放在对应的data文件夹下
app.get('/*', (req, res) => {
  res.send(JSON.stringify(require(`./data${req.path}`)));
  let p = path.resolve(__dirname, `./data${req.path}`);
  removeCache(p);
});

app.listen(8081, _ => {
  console.log(dateDecorator('[SYSTEM] mock server is running at localhost:8081'));
});
