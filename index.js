var express = require('express');
var app = express();
var passport = require('passport');
var config = require('./config.js');
var requestHttp = require('request');
var Intercom = require('intercom-client');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');



app.use(cookieParser())
app.use(session({secret: '1234%asd'}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


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
  // if(request.query.token!=null){
  //    request.session.token= request.query.token;
     response.render('pages/index');
  // }else
  // {
  //   response.redirect("/registerAuth");
  // }
  // set hardcoded token for test purpose
  // if(request.session.token!=null){
  //   request.session.token = 'dG9rOjZkMzhlNTJjX2QzMjFfNDZmNV9hMGY0XzllYTgzYjQ2OGY1ZjoxOjA=';  
  // }
 
});

app.get('/preview', function(request, response) {
   // request.session.token= request.query.token;
     response.render('pages/preview');
});

app.post('/saveUser',function(request,response){

      requestHttp.post('https://secret-waters-92571.herokuapp.com/user',
      {
       json: { 
              accessToken: request.session.token ,
              fullName:request.body.fullName,
              email:request.body.email
              } 
            },
      function (error, resp, body) {
          //console.log("sentData");
          //console.log(resp);
          response.json('ok');
        });
});

app.get('/intercomUserData',function(request,response){
   var client = new Intercom.Client({ token: request.session.token});
   client.admins.me(function(usr){

     // var user={email: usr.responseJSON().data.body.email, name:data.responseJSON().data.body.name};
      response.json({ data: usr}); 
    });
});

app.get('/register', function(request, response) {
  response.render('pages/register');
});

app.get('/terms', function(request, response) {
  response.render('pages/terms');
});

app.get('/privacy', function(request, response) {
  response.render('pages/privacy');
});

app.get('/terms', function(request, response) {
  response.render('pages/terms');
});


app.get('/auth/intercom',  passport.authenticate('intercom'));
app.get('/auth',  passport.authenticate('intercom'));

app.get('/auth/intercom/callback',
  passport.authenticate('intercom', { failureRedirect: '/register' }),
  function(req, res) {
  	//console.log('res' + res);
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/.well-known/acme-challenge/IB3GKPDkvKxPmvLNoqVzQmpFkb96UHMHMxnjzKkNYew', function(req, res) {
  res.send('IB3GKPDkvKxPmvLNoqVzQmpFkb96UHMHMxnjzKkNYew.IjznKEFKwS_Bz_KYZRESjsS8334NuC4-irjfzhY5CWQ')
})

app.get('/auth/redirect',  function(request, response) {
    requestHttp.post(
      'https://api.intercom.io/auth/eagle/token',
      { json: { code:request.query.code,
       client_id:config.intercom.clientID,
       client_secret:config.intercom.clientSecret
       } },
      function (error, resp, body) {
          if (!error && resp.statusCode == 200) {
            request.session.token = body.token;

            var client = new Intercom.Client({ token: request.session.token});

            client.admins.me(function(err,admin){

              var adminData = admin.body;
              console.log(adminData);
             
              requestHttp.post('https://secret-waters-92571.herokuapp.com/user',
              {
                json:
                { 
                  accessToken: request.session.token ,
                  fullName: adminData.name,
                  email: adminData.email
                } 
              },
                function (error, resp, body) {
                  response.redirect('/preview?token=' + body.token);
                });  
            });       
         }
      }
  );

});

app.get('/counts',function(request,response){
  var client = new Intercom.Client({ token: request.session.token});
 client.admins.me(function(usr){
               });
  
  client.users.listBy({"created_since":21},function(err, res21){

    var usersCreated21 = res21.toJSON().body.total_count;
    client.users.listBy({"created_since":14},function(err, res14){
      var usersCreated14 = res14.toJSON().body.total_count;
      client.users.listBy({"created_since":7},function(err, res7){
        var usersCreated7 = res7.toJSON().body.total_count;
        var usersCreatedlast7Days= usersCreated14-usersCreated7;
        var usersCreatedLast14Days= usersCreated21-usersCreated14;
        var differenceBetweekWeeks= usersCreatedlast7Days-usersCreatedLast14Days;
        var percent= differenceBetweekWeeks*100/usersCreated14;

       client.counts.appCounts(function(responseData){
         // console.log(responseData.toJSON().body);
          var data={ counts:responseData.toJSON().body, usersCreated: usersCreated7, percentUsers: percent};
          response.json({ data: data});
        });
      });
    });
  });
 
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

