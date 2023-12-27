
const Sequelize = require('sequelize');
const configA = require('../config/configA');

const sequelizeA = new Sequelize(configA);

module.exports = sequelizeA;
