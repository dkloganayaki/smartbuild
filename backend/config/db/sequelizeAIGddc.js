
const Sequelize = require('sequelize');
const configAIGddc = require('../config/configAIGddc');

const sequelizeAIGddc = new Sequelize(configAIGddc);

module.exports = sequelizeAIGddc;
