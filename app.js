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

var oauth = new OAuth.OAuth(
  "req.user.accesstoken",
  "req.user.tokensecret",
  process.env.TWITTER_KEY,
  process.env.TWITTER_SECRET,
  '1.0A',
  null,
  'HMAC-SHA1'
);

passport.use(new twitterStrategy ({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
},
function(accessToken, tokenSecret, profile, done) {

  db.user.findOrCreate({username: profile.username,
  twitterid: profile.id, accesstoken: accessToken, 
  tokensecret: tokenSecret}).success(function(user, created) {

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

app.get('/', function(req, res) {
  res.render("index", {isAuthenticated: req.isAuthenticated()});
})

// function for Math.rand which will assist in returning a
// single, randomized photo from a search query.
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function imageRequest(dataInput, imageValue)

      var bodyData = JSON.parse(body);
      var data = bodyData.dataInput;
      console.log(bodyData)

      // from an array of objects, randomly select one
      var foundPhoto = data[getRandomInt(0, data.length-1)].imageValue;
      res.render("result", {isAuthenticated: req.isAuthenticated(),
      foundPhoto: foundPhoto})
    }
  })
}


app.get('/result', function(req, res) {
  if (req.query.searchpic === 'stock') {
    var searchURL ="https://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&tags=" 
    + req.query.searchTerm + "&api_key=" + process.env.FLICKR_KEY 
    + "&nojsoncallback=1&media=photos&extras=url_m&page=1&per_page=500&tag_mode=all";

    console.log(req.query.searchTerm)
    request(searchURL, function(error, response, body) {
      if(!error) {
        imageRequest(photos.photo, url_m)
        
      }
    })
  } else {
    var memeURL = "http://version1.api.memegenerator.net/Generators_Search/?q=" + req.query.searchTerm + "&pageSize=24";
    console.log(req.query.searchTerm)
    console.log(req.query.searchpic)
    request(memeURL, function(error, response, body) {
      if(!error) {

        console.log(memeURL)
        var bodyData = JSON.parse(body);
        var data = bodyData.result;

        // from an array of objects, randomly select one
        var foundPhoto = data[getRandomInt(0, data.length-1)].imageUrl;
        console.log(foundPhoto)
        res.render("result", {isAuthenticated: req.isAuthenticated(),
        foundPhoto: foundPhoto})
      }
    })
  }
})

// var searchURL ="https://api.twitter.com/1.1/search/tweets.json?q=coffee&result_type=recent&lang=en";

// oauth.get(searchURL, null, null, function(e, data, res) {
//   // console.log(e);
//   var tweets = JSON.parse(data).statuses
//   var tweetText = _.pluck(tweets, "text")
//   console.log(tweetText);
//   // console.log(res);
// })

app.get('/search', function(req, res) {
  res.render("search", {isAuthenticated: req.isAuthenticated()});
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
  res.render("error", { isAuthenticated: req.isAuthenticated()});
})

app.listen(3000, function() {
  console.log("Running");
})



