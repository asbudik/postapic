module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.createTable('users',
      {id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      username: { type: DataTypes.STRING,
        allowNull: false },
      twitterid: { type: DataTypes.STRING,
        allowNull: false,
        unique: true },
      accesstoken: { type: DataTypes.STRING,
        allowNull: false },
      tokensecret: { type: DataTypes.STRING,
        allowNull: false }
    })
    .complete(done);
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished

    migration.dropTable('users')
      .complete(done);
  }
};
