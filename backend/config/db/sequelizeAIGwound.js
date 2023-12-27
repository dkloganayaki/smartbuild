
const Sequelize = require('sequelize');
const configAIGwound = require('../config/configAIGwound');

const sequelizeAIGwound = new Sequelize(configAIGwound);

module.exports = sequelizeAIGwound;
