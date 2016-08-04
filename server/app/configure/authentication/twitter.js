var express = require('express');
var Flutter = require('flutter');

var flutter = new Flutter({
  consumerKey: 'QxauZaB9yvfIFNAvSHe47Otwh',
  consumerSecret: 'iXidgcn3bLlOKD0vIVJQWAqZ9O80CdXBmVgsak8N0ve9WeOdIf',
  loginCallback: 'http://my-host/twitter/callback', //add login callbcack

  authCallback: function(req, res, next) {
    if (req.error) {
      return console.log("authCallback error", req.error);
    }

    var accessToken = req.session.oauthAccessToken;
    var secret = req.session.oauthAccessTokenSecret;

    // Store away oauth credentials here

    // Redirect user back to your app
    res.redirect('/back/to/app'); //set redirect path
  }
});

var app = express();

app.get('/twitter/connect', flutter.connect);

// URL used in loginCallback above
app.get('/twitter/callback', flutter.auth);

