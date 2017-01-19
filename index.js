var express = require('express');
var app = express();
var passport = require('passport');
var config = require('./config.js');
var requestHttp = require('request');


var IntercomStrategy = require('passport-intercom').Strategy;

passport.use(new IntercomStrategy({
    clientID: config.intercom.clientID,
    clientSecret: config.intercom.clientSecret,
    callbackURL: config.intercom.callbackURL
    
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
app.get('/auth',  passport.authenticate('intercom'));

app.get('/auth/intercom/callback',
  passport.authenticate('intercom', { failureRedirect: '/register' }),
  function(req, res) {
  	console.log('res' + res);
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/redirect', function(request, response) {
  console.log("response"+response);
  
    console.log(request.query.code);
 
   var myJSONObject = { 
    code:request.query.code,
    client_id:config.intercom.clientID,
    client_secret:config.intercom.clientSecret
   };

  requestHttp({
      url: "https://api.intercom.io/auth/eagle/token",
      method: "POST",
      json: true,   // <--Very important!!!
      body: myJSONObject
  }, function (error, response, body){
      console.log(response);
       console.log(body);
  });

});



  // passport.authenticate('intercom', { failureRedirect: '/register' }),
  // function(req, res) {
  //   console.log('res' + res);
  //   // Successful authentication, redirect home.
  //   res.redirect('/');
  // });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

