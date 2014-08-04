var passport = require("passport");
var passportLocal = require("passport-local");
var twitterStrategy = require('passport-twitter').Strategy;

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    twitterid: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    accesstoken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tokensecret: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },

  {
    classMethods: {
      associate: function(db) {
        User.hasMany(db.picture);
      }
    }
  });
return User;
}
//   passport.use(new twitterStrategy({
//    consumerKey: '79D40sYF18Sa1Itv4CaorUMx4',
//    consumerSecret: 'xKQ0UaikVNUsAHJpSvSgOlkkooBVStuSjM23g6DLPiXabtNVKH',
//    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
//   },
//   function(token, tokenSecret, profile, done) {
//     console.log(profile);
//     console.log(token);
//     console.log(tokenSecret);
//     User.findOrCreate({username: profile.username, twitterid: profile.id,
//       accesstoken: token, tokensecret: tokenSecret}, function(err, user) {
//       if (err) { 
//         return done(err); 
//       }
//       done(null, profile);
//     });
//   }
// ));
//   return User;
// }