module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn(
    'users',
    'username',
    {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }).complete(done)
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.dropTable('tokens')
    .complete(done)
  }
}
