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
  OAuth = require('oauth'),
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

// post to twitter

// var twitter = new twitterAPI({
//   consumerKey: process.env.TWITTER_KEY,
//   consumerSecret: process.env.TWITTER_SECRET,
//   callback: 'http://127.0.0.1:3000/auth/twitter/callback'
// });

// twitter.statuses("update", { status: "Hello world!" },
//   // accessToken,
//   // accessTokenSecret,
//   function(error, data, response) {
//     if (error) {
//         // something went wrong
//     } else {
//         // data contains the data sent by twitter
//     }
//   }
// );
// sign-in/log-in to twitter

passport.use(new twitterStrategy ({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
},
function(accessToken, tokenSecret, profile, done) {

  db.user.findOrCreate({username: profile.username,
    twitterid: profile.id, accesstoken: accessToken, 
    tokensecret: tokenSecret}).success(function(user, created) {
      console.log("user", user);
      console.log("created", created);
      done(null, user);
  })

return 
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

// get passport started

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

app.get('/', function(req, res) {
  res.render("index", {isAuthenticated: req.isAuthenticated()});
})

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

app.get('/search', function(req, res) {
  var searchURL ="https://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&text=" + req.query.searchTerm + "&api_key=" + process.env.FLICKR_KEY + "&nojsoncallback=1&media=photos&extras=url_m";
  console.log(req.query.searchTerm)
  request(searchURL, function(error, response, body) {
    if(!error) {
      console.log(searchURL)
      var bodyData = JSON.parse(body);
      var data = bodyData.photos.photo;
      console.log(data)
      var foundPhoto = data[getRandomInt(0, data.length-1)]
      console.log(foundPhoto)
      res.render("search", {isAuthenticated: req.isAuthenticated(),
      foundPhoto: foundPhoto})
    }
  })
})

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
  res.render("error");
})

app.listen(3000, function() {
  console.log("Running");
})

