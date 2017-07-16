'use strict';
module.exports = function(sequelize, DataTypes) {
  var snippets = sequelize.define('snippets', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    language: DataTypes.STRING,
    tags: DataTypes.ARRAY(DataTypes.STRING),
    userId: DataTypes.INTEGER,
    stars: DataTypes.INTEGER
  }, {});

  snippets.associate = function(models) {
    snippets.belongsTo(models.users, {as: 'users', foreignKey: 'userId'})
  }

  return snippets;
};
