
const Sequelize = require('sequelize');
const configAshe  = require('../config/configAshe');

const sequelizeAshe  = new Sequelize(configAshe);

module.exports = sequelizeAshe;
