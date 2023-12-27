
const Sequelize = require('sequelize');
const configCCG = require('../config/configCCG');

const sequelizeCCG = new Sequelize(configCCG);

module.exports = sequelizeCCG;
