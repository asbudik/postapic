function Picture(sequelize, DataTypes){
  /* sequelize.define(modelName, attributes, options); */

  var Picture = sequelize.define('picture', {
    url: DataTypes.STRING,
  },
    {
      classMethods: {
        associate: function(db) {
          Picture.belongsTo(db.user);
        }
      }
    });
  return Picture;
};



module.exports = Picture;