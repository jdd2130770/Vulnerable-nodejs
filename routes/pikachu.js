var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

router.get('/pikachu', function(req, res) {
  res.render('pikachu', { title: 'Hey' });
});

router.get('/pikachu/search', function(req, res) {
  var name = req.query.name || '';
  var db = req.db;
  var collection = db.get('userlist');
  collection.find({ name: name }, {}, function(err, results) {
    if (err) {
      return res.status(500).send('query failed');
    }
    res.json(results);
  });
});

router.get('/pikachu/file', function(req, res) {
  var file = req.query.path;
  var baseDir = path.join(__dirname, '..', 'public');

  if (typeof file !== 'string' || file.indexOf('\0') !== -1) {
    return res.status(400).send('invalid path');
  }

  var requestedPath = path.resolve(baseDir, file);
  if (requestedPath !== baseDir && requestedPath.indexOf(baseDir + path.sep) !== 0) {
    return res.status(400).send('invalid path');
  }

  fs.readFile(requestedPath, 'utf8', function(err, contents) {
    if (err) {
      return res.status(404).send('file not found');
    }
    res.type('text/plain').send(contents);
  });
});

router.post('/pikachu/login', function(req, res) {
  var user = req.body.username;
  var pass = req.body.password;
  var adminUser = process.env.PIKACHU_ADMIN_USER;
  var adminPass = process.env.PIKACHU_ADMIN_PASS;

  if (!adminUser || !adminPass) {
    return res.status(503).send('login unavailable');
  }

  if (user === adminUser && pass === adminPass) {
    req.session.user = user;
    req.session.role = 'admin';
    return res.redirect('/admin');
  }

  res.status(401).send('unauthorized');
});

router.get('/pikachu/run', function(req, res) {
  res.status(403).send('disabled');
});

router.get('/pikachu/greet', function(req, res) {
  var name = req.query.name || '';
  res.send('<h1>Hello ' + escapeHtml(name) + '</h1>');
});

router.get('/pikachu/redirect', function(req, res) {
  var url = req.query.url;

  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
    return res.status(400).send('invalid redirect url');
  }

  res.redirect(url);
});

router.get('/pikachu/config', function(req, res) {
  if (!req.session || req.session.role !== 'admin') {
    return res.status(403).send('forbidden');
  }

  res.json({ ok: true });
});

module.exports = router;
