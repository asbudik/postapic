// var express = require('express'),
//   passport = require('passport'),
//   passportLocal = require('passport-local'),
//   twitterStrategy = require('passport-twitter').Strategy,
//   router = express.Router();

// // authenticate twitter credentials

// router.get('/auth/twitter',
// passport.authenticate('twitter'),
// function(req, res){
// });

// router.get('/auth/twitter/callback',
// passport.authenticate('twitter', { failureRedirect: '/users' }),
// function(req, res) {
//   res.redirect('/search');
// });

// passport.use(new twitterStrategy ({
//   consumerKey: process.env.TWITTER_KEY,
//   consumerSecret: process.env.TWITTER_SECRET,
//   callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
// },
// function(accessToken, tokenSecret, profile, done) {

//   db.user.findOrCreate({username: profile.username,
//     twitterid: profile.id, accesstoken: accessToken, 
//     tokensecret: tokenSecret}).success(function(user, created) {

//     done(null, user);
//   })
// }))

// function getRandomInt(min, max) {
//   return Math.floor(Math.random() * (max - min)) + min;
// }

// router.get('/result', function(req, res) {
//   var searchURL ="https://api.flickr.com/services/rest/?format=json&method=flickr.photos.search&tags=" 
//   + req.query.searchTerm + "&api_key=" + process.env.FLICKR_KEY 
//   + "&nojsoncallback=1&media=photos&extras=url_m&page=1&per_page=500&tag_mode=all";
//   console.log(req.query.searchTerm)
//   request(searchURL, function(error, response, body) {
//     if(!error) {
//       console.log(searchURL)
//       var bodyData = JSON.parse(body);
//       var data = bodyData.photos.photo;
//       console.log(bodyData)
//       var foundPhoto = data[getRandomInt(0, data.length-1)]
//       res.render("result", {isAuthenticated: req.isAuthenticated(),
//       foundPhoto: foundPhoto})
//     }
//   })
// })

// router.get('/', function(req, res) {
//   res.render("index", {isAuthenticated: req.isAuthenticated()});
// })

// router.get('/search', function(req, res) {
//   res.render("search", {isAuthenticated: req.isAuthenticated()});
// })

// router.get('/users', function(req, res) {
//   db.user.findAll({order: [['createdAt', 'DESC']]}).success(function(allUsers) {
//     res.render('users', { isAuthenticated: req.isAuthenticated(),
//     users: allUsers});
//   });
// });

// router.get('/logout', function(req,res){
//   req.logout();
//   res.redirect('/');
// });

// router.get('*', function(req, res) {
//   res.render("error", { isAuthenticated: req.isAuthenticated()});
// })

// module.exports = router;