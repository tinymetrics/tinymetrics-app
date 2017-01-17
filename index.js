var express = require('express');
var app = express();
var passport = require('passport');

var IntercomStrategy = require('passport-intercom').Strategy;

passport.use(new IntercomStrategy({
    clientID: 'e3d7ab13-742a-4a05-baf1-f246a38bd182',
    clientSecret: '2aae64b4-3af2-44e8-8366-32f865fdae77',
    callbackURL: "https://tinymetricsdev.herokuapp.com/auth/redirect"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("accessToken "+accessToken+" profile "+profile);
  }
));


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/register', function(request, response) {
  response.render('pages/register');
});

app.get('/registerAuth', function(request, response) {
  response.render('pages/registerAuth');
});

app.get('/auth/intercom',  passport.authenticate('intercom'));

app.get('/auth/intercom/callback',
  passport.authenticate('intercom', { failureRedirect: '/register' }),
  function(req, res) {
  	console.log('res' + res);
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/redirect',
  passport.authenticate('intercom', { failureRedirect: '/register' }),
  function(req, res) {
    console.log('res' + res);
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

