
const Sequelize = require('sequelize');
const configProcodeemail = require('../config/configProcodeemail');

const sequelizeProcodeemail = new Sequelize(configProcodeemail);

module.exports = sequelizeProcodeemail;
