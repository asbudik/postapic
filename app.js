var express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  cookieSession = require("cookie-session"),
  db = require("./models/index"),
  flash = require('connect-flash'),
  app = express();

// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}) ); 
app.use(methodOverride("_method"));

app.use(express.static(__dirname, 'public'));

app.use(cookieSession( {
  secret: 'tempkey',
  name: 'tempsession',
  // this is in milliseconds
  maxage: 36000000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// prepare our serialize functions
passport.serializeUser(function(user, done){
  console.log("SERIALIZED");
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED");
  db.user.find({
      where: {
        id: id
      }
    })
    .done(function(error,user){ 
      done(error, user);
    });
});

app.get('/', function(req, res) {
  res.render("index");
})

app.get('/login', function(req, res) {
  res.render("login");
})

app.get('/signup', function(req, res) {
  res.render("signup");
})

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

app.post('/create', function(req, res) {
  // Oauth
})

app.post('/login')
// Oauth


app.post('/user/:id', function(req, res) {
  // post content to user's page
  res.render("show");
})

app.post('/search', function(req, res) {
  // http request to return pictures from search
  // from results, randomly generate a single pic
})

app.put('/users/:id' function(req, res) {
  // update additional details
})


app.get('*', function(req, res) {
  res.render("error");
})


