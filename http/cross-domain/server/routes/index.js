const express = require('express');
const router = express.Router();
const path = require('path');

/* GET js files. */
router.get('/cors', (req, res, next) => {
  // just demo, did not judge content-type
  if (!req.headers['content-type']) {
    res.send('cors-get');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', `${req.headers.origin}`);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.json({
      id: 'cors-get'
    });
  }
});

router.options('/cors', (req, res, next) => {
  console.log('options get here!');
  // if set to '*', can't add cookie
  res.setHeader('Access-Control-Allow-Origin', `${req.headers.origin}`);
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // if not set, can't add cookie
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.send();
});

router.post('/cors', (req, res, next) => {
  // if set to '*', can't add cookie
  res.setHeader('Access-Control-Allow-Origin', `${req.headers.origin}`);
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // if not set, can't add cookie
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.send('cors-post');
});

router.get('/jsonp', (req, res, next) => {
  const query = req.query && req.query.callback;
  if (!query) {
    res.send('error');
  } else {
    res.send(`${query}('this is the data from jsonp')`);
  }
});

router.get('/iframe-name', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, '../public/iframe-name.html'));
});

router.get('/post-message', (req, res, next) => {
  res.sendFile(path.resolve(__dirname, '../public/post-message.html'));
});

// 404
router.use('/*', (req, res) => {
  res.send('not found');
});

module.exports = router;