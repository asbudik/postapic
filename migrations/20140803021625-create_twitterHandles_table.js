module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.createTable('twitterHandles',
      {id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      handle: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        foreignKey: true
      }
    })
    .complete(done)
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.dropTable('twitterHandles')
      .complete(done)
  }
}
