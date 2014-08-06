var passport = require("passport");
var passportLocal = require("passport-local");
var twitterStrategy = require('passport-twitter').Strategy;

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
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