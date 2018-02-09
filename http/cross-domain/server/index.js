var express = require('express');
var app = express();

app.use('/', require('./routes'));

app.listen(3001, function () {
  console.log('cross domain server listening on port 3001!');
});