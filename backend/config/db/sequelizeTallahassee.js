
const Sequelize = require('sequelize');
const configTallahassee = require('../config/configTallahassee');

const sequelizeTallahassee = new Sequelize(configTallahassee);

module.exports = sequelizeTallahassee;
