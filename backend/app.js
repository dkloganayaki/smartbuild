const express = require('express');
const { Sequelize } = require('sequelize');

const AController = require('./controllers/AController');
const BController = require('./controllers/BController');
const CController = require('./controllers/CController');
const TallahasseeController = require('./controllers/TallahasseeController');
const AsheController = require('./controllers/AsheController');
const CCGController = require('./controllers/CCGController');
const StatusController = require('./controllers/StatusController');
const AIGWoundController = require('./controllers/AIGWoundController');
const AIGddcController = require('./controllers/AIGddcController');
const AIGhvlcController = require('./controllers/AIGhvlcController');
const AIGpscController = require('./controllers/AIGpscController');

const databaseConfig = require('./databaseConfig');

const sequelizeA = new Sequelize(databaseConfig.A);
const sequelizeB = new Sequelize(databaseConfig.B);
const sequelizeC = new Sequelize(databaseConfig.C);
const sequelizeTallahassee = new Sequelize(databaseConfig.Tallahassee);
const sequelizeAshe = new Sequelize(databaseConfig.Ashe);
const sequelizeCCG = new Sequelize(databaseConfig.CCG);
const sequelizemasteremail = new Sequelize(databaseConfig.master_email);
const sequelizeAIGwound = new Sequelize(databaseConfig.AIG_wound);
const sequelizeAIGddc = new Sequelize(databaseConfig.AIG_DDC);
const sequelizeAIGhvlc = new Sequelize(databaseConfig.AIG_HVLC);
const sequelizeAIGpsc = new Sequelize(databaseConfig.AIG_PSC);


// Authenticate and synchronize models for each database
async function connectAndSync() {

  try {
    await sequelizeA.authenticate();
    console.log('Connection to database A has been established successfully.');
    await sequelizeA.sync();
  } catch (error) {
    console.error('Unable to connect to database A:', error);
  }

  try {
    await sequelizeB.authenticate();
    console.log('Connection to database B has been established successfully.');
    await sequelizeB.sync();
  } catch (error) {
    console.error('Unable to connect to database B:', error);
  }

  try {
    await sequelizeC.authenticate();
    console.log('Connection to database C has been established successfully.');
    await sequelizeC.sync();
  } catch (error) {
    console.error('Unable to connect to database C:', error);
  }

  try {
    await sequelizeTallahassee.authenticate();
    console.log('Connection to database Tallahassee has been established successfully.');
    await sequelizeTallahassee.sync();
  } catch (error) {
    console.error('Unable to connect to database Tallahassee:', error);
  }

  try {
    await sequelizeAshe.authenticate();
    console.log('Connection to database Ashe has been established successfully.');
    await sequelizeAshe.sync();
  } catch (error) {
    console.error('Unable to connect to database Ashe:', error);
  }

  try {
    await sequelizeCCG.authenticate();
    console.log('Connection to database CCG has been established successfully.');
    await sequelizeCCG.sync();
  } catch (error) {
    console.error('Unable to connect to database CCG:', error);
  }

  try {
    await sequelizemasteremail.authenticate();
    console.log('Connection to database Masteremail has been established successfully.');
    await sequelizemasteremail.sync();
  } catch (error) {
    console.error('Unable to connect to database Masteremail:', error);
  }

  try {
    await sequelizeAIGwound.authenticate();
    console.log('Connection to database AIGWound has been established successfully.');
    await sequelizeAIGwound.sync();
  } catch (error) {
    console.error('Unable to connect to database AIGWound:', error);
  }

  try {
    await sequelizeAIGddc.authenticate();
    console.log('Connection to database AIGddc has been established successfully.');
    await sequelizeAIGddc.sync();
  } catch (error) {
    console.error('Unable to connect to database AIGddc:', error);
  }

  try {
    await sequelizeAIGhvlc.authenticate();
    console.log('Connection to database AIGhvlc has been established successfully.');
    await sequelizeAIGhvlc.sync();
  } catch (error) {
    console.error('Unable to connect to database AIGhvlc:', error);
  }

  try {
    await sequelizeAIGpsc.authenticate();
    console.log('Connection to database AIGpsc has been established successfully.');
    await sequelizeAIGpsc.sync();
  } catch (error) {
    console.error('Unable to connect to database AIGpsc:', error);
  }

}

// Connect to databases and synchronize models
connectAndSync();

// Create your Express app
const app = express();
app.use(express.json());

// Define your routes and middleware here...
app.post('/store-data/:dbName/:modelName', AController.storeData);  
app.post('/store-data/:dbName/:modelName', BController.store);
app.post('/storedatas/:dbName/:modelName', CController.cDatastore);    
app.post('/store-data-tallahassee/:dbName/:modelName', TallahasseeController.storeDataTallahassee);
app.post('/store-data-ashe/:dbName/:modelName', AsheController.storeDataAshe);
app.post('/store-data-ccg/:dbName/:modelName', CCGController.storeDataCCG);
app.post('/store-data-AIGWound/:dbName/:modelName', AIGWoundController.storeDataAIGWound);
app.post('/store-data-AIGddc/:dbName/:modelName', AIGddcController.storeDataAIGddc);
app.post('/store-data-AIGhvlc/:dbName/:modelName', AIGhvlcController.storeDataAIGhvlc);
app.post('/store-data-AIGpsc/:dbName/:modelName', AIGpscController.storeDataAIGpsc);

app.get('/status-count', StatusController.getStatusCounts);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


