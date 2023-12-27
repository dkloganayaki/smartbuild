// config/models/Client.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      client_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  }, {
    timestamps: false, 
  });

  return Client;
};

