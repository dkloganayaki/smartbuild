
const Sequelize = require('sequelize');
const configC = require('../config/configC');

const sequelizeC = new Sequelize(configC);

module.exports = sequelizeC;
