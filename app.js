var express = require('express');
var nunjucks = require('nunjucks');
var port = process.env.PORT || 3000;
var querystring = require('querystring');
var path = require('path');
var axios = require('axios');
var app = express();

var ACCESS_TOKEN = '';
var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URI = 'http://localhost:3000/auth/done';
var headerConfig = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

app.get('/', function (req, res) {
  var signedIn = false;

  if (ACCESS_TOKEN) {
    signedIn = true;
  }

  res.render('index', { authenticated: signedIn });
});

app.get('/auth', function (req, res) {
  var qs = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
  };
  var query = querystring.stringify(qs);
  const url = `https://api.instagram.com/oauth/authorize/?${query}`;

  res.redirect(url);
});

app.get('/auth/done', function (req, res) {
  var data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code: req.query.code,
  };

  axios.post('https://api.instagram.com/oauth/access_token', querystring.stringify(data), headerConfig).then(function (response) {
    ACCESS_TOKEN = response.data.access_token;
    res.redirect('/feed');
  }).catch(function (err) {
    console.log(err);
  });
});

app.get('/feed', function (req, res) {
  var url = `https://api.instagram.com/v1/users/self/media/recent/?access_token=${ACCESS_TOKEN}`;

  axios.get(url, headerConfig).then(function (response) {
    res.render('feed', {
      authenticated: true,
      feed: response.data.data,
    });
  }).catch(function (err) {
    console.log(err);
  });
});

app.listen(port, function () {
  console.log(`Getting jiggy on port: ${port}`);
});
