const express = require('express');
const path = require('path');
const opn = require('opn');
const app = express();

app.use(express.static(path.resolve(__dirname, '../')));

app.get('/', (req, res) => {
  res.redirect('/demo-server/index.html');
});

app.get('/f.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.resolve(__dirname, '../demo-server/f.js'));
});

app.get('/data', (req, res) => {
  res.send(JSON.stringify(require('./build')));
});

app.listen(8082, _ => {
  console.log('listen to localhost:8082');
  opn('http://localhost:8082');
});
