
const Sequelize = require('sequelize');
const configAIGhvlc = require('../config/configAIGhvlc');

const sequelizeAIGhvlc = new Sequelize(configAIGhvlc);

module.exports = sequelizeAIGhvlc;
