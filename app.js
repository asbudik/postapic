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
  fs = require('fs'),
  app = express();

// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); 
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

// Get embed tweets with Twitter

var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_KEY,
  process.env.TWITTER_SECRET,
  '1.0A',
  null,
  'HMAC-SHA1'
);

// Login with Twitter
passport.use(new twitterStrategy ({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
},
function(accessToken, tokenSecret, profile, done) {

  db.user.findOrCreate({username: profile.username,
  twitterid: profile.id, accesstoken: accessToken, 
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
passport.authenticate('twitter', { failureRedirect: '/' }),
function(req, res) {
  res.redirect('/');
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

// I am calling from two potential APIs here and I wasn't 
// sure how to refactor this get request. Each request has
// properties specific to one another, and I couldn't pass
// those properties through a generic function.

app.get('/result', function(req, res) {
  if (req.query.searchpic === 'stock') {
    var searchURL ="https://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&tags=" 
    + req.query.searchTerm + "&api_key=" + process.env.FLICKR_KEY 
    + "&nojsoncallback=1&media=photos&extras=url_m&page=1&per_page=500&tag_mode=all";

    request(searchURL, function(error, response, body) {
      if(!error) {
        
        var bodyData = JSON.parse(body);
        var data = bodyData.photos.photo;
        if (data[0] !== undefined) {
          var randomPhoto = data[getRandomInt(0, data.length-1)];
          var photoId = randomPhoto.id;
          var foundPhoto = randomPhoto.url_m
        }
        res.render("result", {isAuthenticated: req.isAuthenticated(),
        foundPhoto: foundPhoto, photoId: photoId, user: req.user})
      }
    })
  } else {
    var memeURL = "http://version1.api.memegenerator.net/Generators_Search/?q=" + req.query.searchTerm + "&pageSize=24";
    request(memeURL, function(error, response, body) {
      if(!error) {

        var bodyData = JSON.parse(body);
        var data = bodyData.result;
        if (data[0] !== undefined) {
          var randomPhoto = data[getRandomInt(0, data.length-1)];
          var photoId = randomPhoto.generatorID;
          var foundPhoto = randomPhoto.imageUrl;
        }
        res.render("result", {isAuthenticated: req.isAuthenticated(),
        foundPhoto: foundPhoto, photoId: photoId, user: req.user})
      }
    })
  }
})


app.post('/users/:id', function(req, res) {
  var twitter = new twitterAPI({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callback: 'http://127.0.0.1:3000/auth/twitter/callback'
  });
  // path where to save image
  var photoPath = './photos/' + req.body.photoID;
  // create write stream to write image to path

  picStream = fs.createWriteStream(photoPath);
  picStream.on("close", function() {
    twitter.statuses("update_with_media", {
      status: req.body.status || "",
      media: [photoPath]
    },
    req.user.accesstoken,
    req.user.tokensecret,

    function(error, data, response) {
      if (error) {
        console.log("error", error)
      }

      // var dummyURL = 'https://api.twitter.com/1/statuses/oembed.json?id=133640144317198338'
      var embedURL = 'https://api.twitter.com/1/statuses/oembed.json?id=' + data.id_str + "&omit_script=true";
      console.log("embedURL", embedURL);
      console.log("data", data)

      oauth.get(embedURL, null, null, function(e, d, twitter_res) {
        var tweets = JSON.parse(d)
        console.log(tweets)
        db.user.find(req.user.id).success(function(foundUser) {
          db.picture.create({url: data.id_str, html: tweets.html}).success(function(newPicture) {
            foundUser.addPicture(newPicture).success(function(){
                res.redirect('/users/' + req.user.id);
            })
          })
        })
      })
    })
  })
  request.get(req.body.photo).pipe(picStream);

})


app.get('/users/:id', function(req, res) {
  db.user.find(req.params.id).success(function(foundUser) {
    foundUser.getPictures({order: [['createdAt', 'DESC']]}).success(function(allPictures) {
      res.render("show", {isAuthenticated: req.isAuthenticated(),
      user: foundUser, picture: allPictures});
    })
  })
})

app.get('/', function(req, res) {
  res.render("index", {isAuthenticated: req.isAuthenticated(),
    user: req.user});
});

app.get('/search', function(req, res) {
  res.render("search", {isAuthenticated: req.isAuthenticated(),
    user: req.user});
});


app.get('/users', function(req, res) {
  db.user.findAll({order: [['createdAt', 'DESC']]}).success(function(allUsers) {
    res.render('users', { isAuthenticated: req.isAuthenticated(),
    users: allUsers, user: req.user});
  });
});


app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

app.get('*', function(req, res) {
  res.render("error", { isAuthenticated: req.isAuthenticated(),
    user: req.user});
});


app.listen(3000, function() {
  console.log("Running");
});



