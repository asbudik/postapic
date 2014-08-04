var express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  twitterStrategy = require('passport-twitter').Strategy,
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  cookieSession = require("cookie-session"),
  db = require("./models/index.js"),
  flash = require('connect-flash'),
  methodOverride = require('method-override'),
  morgan = require('morgan'),
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

passport.use(new twitterStrategy ({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
},
function(accessToken, tokenSecret, profile, done) {
  // console.log(profile);
//  process.nextTick(function () {
  db.user.findOrCreate({username: profile.username,
    twitterid: profile.id, accesstoken: accessToken, 
    tokensecret: tokenSecret}).success(function(user, created) {
      console.log("user", user);
      console.log("created", created);
      done(null, user);
  })
// })
return 
}))

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




app.get('/users', function(req, res) {
  db.user.findAll({order: [['createdAt', 'DESC']]}).success(function(allUsers) {
    res.render('users', { isAuthenticated: req.isAuthenticated(),
    users: allUsers});
  });
});

app.get('/search', function(req, res) {
  res.render("search", {isAuthenticated: req.isAuthenticated()});
})

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

