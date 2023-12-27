
const Sequelize = require('sequelize');
const configB = require('../config/configB');

const sequelizeB = new Sequelize(configB);

module.exports = sequelizeB;
