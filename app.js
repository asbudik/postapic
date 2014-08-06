var express = require("express"),
  bodyParser = require("body-parser"),
  request = require("request"),
  twitterAPI = require('node-twitter-api'),
  passport = require("passport"),
  twitterStrategy = require('passport-twitter').Strategy,
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  cookieSession = require("cookie-session"),
  db = require("./models/index.js"),
  flash = require('connect-flash'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
  _ = require('lodash'),
  oauth = require('oauth'),
  Formdata = require('form-data'),
  utf8 = require('utf8'),
  fs = require('fs'),
  app = express();

// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}) ); 
app.use(methodOverride("_method"));

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

app.use(cookieSession( {
  secret: process.env.COOKIE_SECRET,
  name: process.env.COOKIE_NAME,
  // this is in milliseconds
  maxage: 36000000
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


status = utf8.encode(status);

var form = new FormData();
form.append('status', status)
form.append('media[]', fs.createReadStream(file));

// Twitter OAuth
form.getLength(function(err, length){
  if (err) {
    return requestCallback(err);
  }
  var oauth = { 
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    token: access_token,
    token_secret: access_token_secret
  };
  var r = request.post({url:"https://api.twitter.com/1.1/statuses/update_with_media.json", oauth:oauth, host: "api.twitter.com", protocol: "https:"}, requestCallback);
  r._form = form;
  r.setHeader('content-length', length);
});

function requestCallback(err, res, body) {
  if(err) {
      throw err;
  } else {
      console.log("Tweet and Image uploaded successfully!");
  }
}

// Post with Twitter
var twitter = new twitterAPI({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callback: 'http://127.0.0.1:3000/auth/twitter/callback'
});

// Login with Twitter
passport.use(new twitterStrategy ({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
},
function(accessToken, tokenSecret, profile, done) {

  db.user.findOrCreate({username: profile.username,
  twitterid: profile.id, icon: profile.photos[0].value, accesstoken: accessToken, 
  tokensecret: tokenSecret }).success(function(user, created) {
    console.log(profile.photos[0].value)
    done(null, user);
  })
}))


// authenticate twitter credentials
app.get('/auth/twitter',
passport.authenticate('twitter'),
function(req, res){
});

app.get('/auth/twitter/callback',
passport.authenticate('twitter', { failureRedirect: '/users' }),
function(req, res) {
  res.redirect('/search');
});
// prepare our serialize functions
passport.serializeUser(function(user, done){
  console.log("SERIALIZED");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("DESERIALIZED");
  db.user.find({
    where: {
      id: id
    }
  }).done(function(error, user) {
    done(error, user)
  })
})


// *********************
// ***END BOILERPLATE***
// *********************


function getRandomInt(min, max) {
  // function for Math.rand which will assist in returning a
  // single, randomized photo from a search query.
  return Math.floor(Math.random() * (max - min)) + min;
}

// grab photo id for unique downloads


app.get('/result', function(req, res) {
  if (req.query.searchpic === 'stock') {
    var searchURL ="https://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&tags=" 
    + req.query.searchTerm + "&api_key=" + process.env.FLICKR_KEY 
    + "&nojsoncallback=1&media=photos&extras=url_m&page=1&per_page=500&tag_mode=all";

    request(searchURL, function(error, response, body) {
      if(!error) {
        var bodyData = JSON.parse(body);
        var data = bodyData.photos.photo;
        var foundPhoto = data[getRandomInt(0, data.length-1)];
        var photoId = foundPhoto.id;
        res.render("result", {isAuthenticated: req.isAuthenticated(),
        foundPhoto: foundPhoto.url_m})
      }
    })
  } else {
    var memeURL = "http://version1.api.memegenerator.net/Generators_Search/?q=" + req.query.searchTerm + "&pageSize=24";
    request(memeURL, function(error, response, body) {
      if(!error) {

        var bodyData = JSON.parse(body);
        var data = bodyData.result;
        var foundPhoto = data[getRandomInt(0, data.length-1)];
        var photoId = foundPhoto.generatorID;
        res.render("result", {isAuthenticated: req.isAuthenticated(),
        foundPhoto: foundPhoto.imageUrl})
      }
    })
  }
})


app.get('/', function(req, res) {
  res.render("index", {isAuthenticated: req.isAuthenticated()});
});

app.get('/search', function(req, res) {
  res.render("search", {isAuthenticated: req.isAuthenticated()});
});

app.get('/users', function(req, res) {
  db.user.findAll({order: [['createdAt', 'DESC']]}).success(function(allUsers) {
    res.render('users', { isAuthenticated: req.isAuthenticated(),
    users: allUsers});
  });
});

app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

app.get('*', function(req, res) {
  res.render("error", { isAuthenticated: req.isAuthenticated()});
});

app.listen(3000, function() {
  console.log("Running");
});



