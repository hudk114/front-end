const express = require('express');
const path = require('path');
const app = express();

app.get('/app.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/app.js'));
});

app.use('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
});

app.listen(3002);
