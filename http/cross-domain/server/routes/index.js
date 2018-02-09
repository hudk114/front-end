const express = require('express');
const router = express.Router();

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

// 404
router.use('/*', (req, res) => {
  res.send('not found');
});

module.exports = router;