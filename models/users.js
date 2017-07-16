'use strict';
module.exports = function(sequelize, DataTypes) {
  var users = sequelize.define('users', {
    username: DataTypes.STRING,
    password: DataTypes.TEXT,
    salt: DataTypes.TEXT,
    iterations: DataTypes.INTEGER
  }, {});

  users.associate = function(models) {
    users.hasMany(models.snippets, {as: 'snippets', foreignKey: 'userId'})
  }

  return users;
};
