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
  secret: 'tempkey',
  name: 'tempsession',
  // this is in milliseconds
  maxage: 36000000
  })
);

passport.use(new twitterStrategy ({
  consumerKey: '79D40sYF18Sa1Itv4CaorUMx4',
  consumerSecret: 'xKQ0UaikVNUsAHJpSvSgOlkkooBVStuSjM23g6DLPiXabtNVKH',
  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
},
function(accessToken, tokenSecret, profile, done) {
 process.nextTick(function () {
  console.log(profile);
  console.log(accessToken);
  console.log(tokenSecret);
  db.user.findOrCreate({username: profile.username, twitterid: profile.id, accesstoken: accessToken, tokensecret: tokenSecret}, function(err, user) {
    if (err) {
      done(err)
    }
    done(null, user);
  })
})
}))

// passport.use(new twitterStrategy ({
//  consumerKey: '79D40sYF18Sa1Itv4CaorUMx4',
//  consumerSecret: 'xKQ0UaikVNUsAHJpSvSgOlkkooBVStuSjM23g6DLPiXabtNVKH',
//  callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
// },
// function(accessToken, tokenSecret, profile, done) {
//   console.log("HIII BEFORE FIND")
// db.user.find({ where: {twitterid: profile.id} }, function(err, user) {
//   console.log("afer user find")
//  if(err) { console.log(err); }
//  if (!err && user != null) {
//   console.log("in null user")
//    done(null, user);
//  } else {
//   console.log("in new user create")
//    var user = new db.user({
//      twitterid: profile.id,
//      username: profile.username,
//      accesstoken: 'asdfd',
//      tokensecret: 'sdfd'
//    });
//    user.save(function(err) {
//      if(err) {
//        console.log(err);
//      } else {
//        console.log("saving user ...");
//        done(null, user);
//      };
//    });
//  };
// });
// }
// ));


// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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
  res.render("index");
})


app.get('/auth/twitter',
passport.authenticate('twitter'),
function(req, res){
});
app.get('/auth/twitter/callback',
passport.authenticate('twitter', { failureRedirect: '/users' }),
function(req, res) {
 res.redirect('/search');
});




app.get('/users', function(req, res) {
  res.render("users");
})


app.get('/users/:id', function(req, res) {
  res.render("show");
})

app.get ('/users/:id/edit', function(req, res) {
  res.render("edit");
})

app.get('/search', function(req, res) {
  res.render("search");
})


app.post('/user/:id', function(req, res) {
  // post content to user's page
  res.render("show");
})

app.post('/search', function(req, res) {
  // http request to return pictures from search
  // from results, randomly generate a single pic
})

app.put('/users/:id', function(req, res) {
  // update additional details
})


app.get('*', function(req, res) {
  res.render("error");
})

app.listen(3000, function() {
  console.log("Running");
})

