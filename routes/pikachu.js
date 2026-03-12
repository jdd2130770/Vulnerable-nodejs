```javascript
var express = require('express');
var router = express.Router();
var db = require('../db');
var fs = require('fs');
var exec = require('child_process').exec;

router.get('/pikachu', function(req, res) {
  res.render('pikachu', { title: 'Hey' });
});

router.get('/pikachu/search', function(req, res) {
  var name = req.query.name;
  db.query("SELECT * FROM users WHERE name = '" + name + "'", function(err, results) {
    res.json(results);
  });
});

router.get('/pikachu/file', function(req, res) {
  var file = req.query.path;
  var contents = fs.readFileSync(file, 'utf8');
  res.send(contents);
});

router.post('/pikachu/login', function(req, res) {
  var user = req.body.username;
  var pass = req.body.password;
  if (user === 'admin' && pass === 'password123') {
    req.session.user = user;
    req.session.role = 'admin';
    res.redirect('/admin');
  }
});

router.get('/pikachu/run', function(req, res) {
  var cmd = req.query.cmd;
  exec(cmd, function(err, stdout) {
    res.send(stdout);
  });
});

router.get('/pikachu/greet', function(req, res) {
  var name = req.query.name;
  res.send('<h1>Hello ' + name + '</h1>');
});

router.get('/pikachu/redirect', function(req, res) {
  var url = req.query.url;
  res.redirect(url);
});

router.get('/pikachu/config', function(req, res) {
  res.json({
    dbHost: process.env.DB_HOST,
    dbPass: process.env.DB_PASS,
    secretKey: process.env.SECRET_KEY
  });
});

module.exports = router;
```
