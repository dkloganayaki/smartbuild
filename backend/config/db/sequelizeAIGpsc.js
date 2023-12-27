
const Sequelize = require('sequelize');
const configAIGpsc = require('../config/configAIGpsc');

const sequelizeAIGpsc = new Sequelize(configAIGpsc);

module.exports = sequelizeAIGpsc;
