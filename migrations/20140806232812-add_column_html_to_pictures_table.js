module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.addColumn(
    'pictures',
    'html',
    {
      type: DataTypes.STRING
    }).complete(done)
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    migration.dropTable('pictures')
    .complete(done)
  }
}
