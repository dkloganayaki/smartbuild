const { Sequelize } = require('sequelize');
const Tallahassee = require('../config/models/TallahasseeInventory');
const Tallahasseeduplicate = require('../config/models/TallahasseeInventories_duplicate');
const ProjectEmailModel   = require('../config/models/ProjectEmail');
const transporter = require('../email/transporter');
const mysql = require('mysql');

const connection = mysql.createConnection({
  database: 'master_email',
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'mysql',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

const dbsequelizeTallahassee = {
  database: 'Tallahassee',
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'mysql',
};

const sequelize = new Sequelize({
  database: 'master_email',
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'mysql',
});

const sequelizeTallahassee = new Sequelize(dbsequelizeTallahassee);
const ProjectEmail = ProjectEmailModel(sequelize, Sequelize);

const storeDataTallahassee = async (req, res) => {
  try {
    const { dbName, modelName } = req.params;
    const data = req.body;
    console.log('Received data:', data);
    console.log('Database Name:', dbName);
    console.log('Model Name:', modelName);

    if (!data || !Array.isArray(data) || data.length === 0) {
      const errorResponse = {
        status: 'error',
        code: 400,
        message: 'Invalid data format. Expected a non-empty array.',
      };
      sendErrorEmail(res, errorResponse);
      return res.status(400).json(errorResponse);
    }

    const sequelizeInstance = getSequelizeInstance(dbName);
    const Model = getModel(sequelizeInstance, modelName);

       const expectedColumns = [
      'claim_id',
      'username',
      'worklist_status',
      'pend_effective',
      'pend_expires',
      'payer',
      'custom_insurance_group',
      'insurance_package',
      'outstanding_amount',
      'date_of_service',
      'diagnosis_codes',
      'procedure_code',
      'service_department',
      'hold_reason',
      'hold_date',
      'days_in_status',
      'primary_department',
      'patient_department',
      'supervising_provider',
      'rendering_provider',
      'referring_provider',
      'patient_name',
      'worklist',
      'last_claim_note',
      'claim_status',
      'specialty',
      'escalated_on',
      'assigned_to',
      'emp_id'
    ];

    const missingColumns = expectedColumns.filter(column => !data[0].hasOwnProperty(column));

    if (missingColumns.length > 0) {
      sendMissingColumnsEmail(res, missingColumns);
      return res.status(200).json({ status: 'Failed', code: 200, message: 'Missing columns detected.' });
    }

    const duplicateClaimNumbers = await findDuplicateClaimNumbers(Model, data);

    if (duplicateClaimNumbers.length > 0) {
      const tableName = 'TallahasseeInventories_duplicate';
      await saveAllClaimData(dbName, tableName, data);
          sendEmailNotification(res, data, duplicateClaimNumbers);
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Duplicate claim numbers detected. Email notification sent.',
        duplicateClaimNumbers: duplicateClaimNumbers,
      });
    }

    // Filter out duplicates
    const uniqueData = data.filter(item => !duplicateClaimNumbers.includes(item.claim_id));

    if (uniqueData.length === 0) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'No new data to save because few data have duplicate claim numbers.',
        duplicateClaimNumbers: duplicateClaimNumbers,
      });
    }

    const batchSize = 100;
    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      await bulkInsertData(Model, batch);
    }

    return res.status(200).json({ status: 'success', code: 200, message: 'Claims stored Successfully...!' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ status: 'error', code: 500, error: 'Internal Server Error' });
  }
};

async function findDuplicateClaimNumbers(Model, data) {
  const claimNumbers = data.map(item => item.claim_id);
  const duplicatesInDatabase = await Model.findAll({
    attributes: ['claim_id'],
    where: { claim_id: claimNumbers },
    raw: true,
  });

  console.log('All claim numbers in data:', claimNumbers);
  console.log('Duplicate claim numbers in database:', duplicatesInDatabase);

  const duplicateClaimNumbers = duplicatesInDatabase.map(item => item.claim_id);
  return duplicateClaimNumbers;
}

async function saveAllClaimData(dbName, tableName, data) {
  const sequelizeInstance = getSequelizeInstance(dbName);
  const ClaimsModel = getModel(sequelizeInstance, tableName);

  try {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (item.status === 'accepted') {
        // Insert a new record with the same claim_id
        await ClaimsModel.create({
          ...item,
          accepted_date: new Date(),
        });
        console.log(`ClaimID ${item.claim_id} inserted into ${tableName}, accepted_date set to current date and time`);
      } else {
        const existingRecord = await ClaimsModel.findOne({ where: { claim_id: item.claim_id } });

        if (existingRecord) {
          // If record exists, update the record without changing accepted_date
          await existingRecord.update(item);
          console.log(`ClaimID ${item.claim_id} updated in ${tableName}`);
        } else {
          // If record doesn't exist, insert a new record
          await ClaimsModel.create(item);
          console.log(`ClaimID ${item.claim_id} inserted into ${tableName}`);
        }
      }
    }

    console.log(`All ClaimID data processed for ${tableName}`);
  } catch (error) {
    console.error(`Error processing ClaimID data for ${tableName}:`, error);
    throw error;
  }
}


async function bulkInsertData(Model, data) {
  return Model.bulkCreate(data);
}

async function sendEmailNotification(res, request) {
  if (!request || !Array.isArray(request)) {
    return res.status(400).json({ status: 'error', code: 400, error: 'Invalid data format. Expected an array for request.' });
  }

  try {
    const result = await ProjectEmail.findOne({
      where: { client_name: 'Tallahasseeinventories' },
    });

    if (!result) {
      return res.status(404).json({ status: 'error', code: 404, error: 'No data found for the specified condition.' });
    }

    const { cc_address, to_address } = result;

    const columnsToInclude = Object.keys(request[0] || {});

    const tableHtml = `
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            ${columnsToInclude.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${request.map(row => `
            <tr>
              ${columnsToInclude.map(column => `<td>${row[column]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const mailOptions = {
      from: 'dkloganayaki132@gmail.com',
      to: to_address,
      cc: cc_address,
      subject: 'Duplicate Claim Detected',
      html: `<p>Duplicate Claim number is Detected:</p>${tableHtml}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ status: 'error', code: 500, error: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
        return res.json({ status: 'success', code: 200, message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error querying database:', error);
    return res.status(500).json({ status: 'error', code: 500, error: 'Error querying database' });
  }
}

async function sendEmail(res, mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    if (!res.headersSent) {
      return res.json({ status: 'success', code: 200, message: 'Email sent successfully' });
    } else {
      console.error('Headers already sent; cannot send another response.');
    }
  } catch (error) {
    console.error('Error sending email:', error);

    if (!res.headersSent) {
      return res.status(500).json({ status: 'error', code: 500, error: 'Error sending email' });
    } else {
      console.error('Headers already sent; cannot send another response.');
    }
  }
}

async function sendErrorEmail(res, errorResponse) {
  try {
    const result = await ProjectEmail.findOne({
      where: { client_name: 'Tallahasseeinventories' },
    });

    if (!result) {
      return res.status(404).json({ status: 'error', code: 404, error: 'No data found for the specified condition.' });
    }

    const { cc_address, to_address } = result;

    const mailOptions = {
      from: 'dkloganayaki132@gmail.com',
      to: to_address,
      cc: cc_address,
      subject: 'Error in Data Processing',
      html: `<p>Error details: No data....File is Not there..!</p>`,
    };

    return sendEmail(res, mailOptions);
  } catch (error) {
    console.error('Error querying database:', error);
    return res.status(500).json({ status: 'error', code: 500, error: 'Error querying database' });
  }
}

async function sendMissingColumnsEmail(res, missingColumns) {
  try {
    const result = await ProjectEmail.findOne({
      where: { client_name: 'Tallahasseeinventories' },
    });

    if (!result) {
      return res.status(404).json({ status: 'error', code: 404, error: 'No data found for the specified condition.' });
    }

    const { cc_address, to_address } = result;

    const mailOptions = {
      from: 'dkloganayaki132@gmail.com',
      to: to_address,
      cc: cc_address,
      subject: 'Missing Columns in Data',
      html: `<p>The following columns are missing in the received data: ${missingColumns.join(', ')}</p>`,
    };

    return sendEmail(res, mailOptions);
  } catch (error) {
    console.error('Error querying database:', error);
    return res.status(500).json({ status: 'error', code: 500, error: 'Error querying database' });
  }
}

function getSequelizeInstance(dbName) {
  if (dbName === 'Tallahassee') {
    return sequelizeTallahassee;
  }
}

function getModel(sequelizeInstance, modelName) {
  switch (modelName) {
    case 'TallahasseeInventory':
      return Tallahassee(sequelizeInstance);
    case 'TallahasseeInventories_duplicate':
      return Tallahasseeduplicate(sequelizeInstance);
      case 'ProjectEmail':   
      return ProjectEmail;
    default:
      throw new Error(`Invalid modelName: ${modelName}`);
  }
}



module.exports = {
    storeDataTallahassee,
};
