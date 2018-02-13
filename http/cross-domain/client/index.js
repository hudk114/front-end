const express = require('express');
const path = require('path');
const app = express();

app.get('/app.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/app.js'));
});

app.use('/cors', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/cors.html'));
});

app.use('/jsonp', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/jsonp.html'));
});

app.use('/iframe-name', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/iframe-name.html'));
});

app.use('/post-message', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/post-message.html'));
});

app.listen(3002);
