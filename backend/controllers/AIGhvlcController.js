const { Sequelize } = require('sequelize');
const HVLC = require('../config/models/AIG_hvlc_inventory');
const HVLCduplicate = require('../config/models/AIG_hvlc_inventory_duplicates');
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

const dbsequelizeAIGhvlc = {
  database: 'AIG_HVLC',
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

const sequelizeAIGhvlc = new Sequelize(dbsequelizeAIGhvlc);
const ProjectEmail = ProjectEmailModel(sequelize, Sequelize);

const storeDataAIGhvlc = async (req, res) => {
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
        'ticket_number','doctor','insurance_carrier','patient_id','patient_name','dos','doe','facility','pos','coder_e_m_cpt','coder_e_m_icd','biller_audit_cpt','biller_audit_icd','em_dx_problem_addressed','severity_of_diagnosis','amount_and_complexity_of_data','risk_of_complications','visit_status','cpt','units','modifier','diagnoses','coder_comments','emp_id'
    ];

    const missingColumns = expectedColumns.filter(column => !data[0].hasOwnProperty(column));

    if (missingColumns.length > 0) {
      sendMissingColumnsEmail(res, missingColumns);
      return res.status(200).json({ status: 'Failed', code: 200, message: 'Missing columns detected.' });
    }

    const duplicateClaimNumbers = await findDuplicateClaimNumbers(Model, data);

    if (duplicateClaimNumbers.length > 0) {
      const tableName = 'AIG_hvlc_inventory_duplicates'; 
      await saveAllClaimData(dbName, tableName, data);
          sendEmailNotification(res, data, duplicateClaimNumbers);
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Duplicate Ticket numbers detected. Email notification sent.',
        duplicateClaimNumbers: duplicateClaimNumbers,
      });
    }

    // Filter out duplicates
    const uniqueData = data.filter(item => !duplicateClaimNumbers.includes(item.ticket_number));

    if (uniqueData.length === 0) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'No new data to save because few data have duplicate Ticket numbers.',
        duplicateClaimNumbers: duplicateClaimNumbers,
      });
    }

    const batchSize = 100;
    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      await bulkInsertData(Model, batch);
    }

    return res.status(200).json({ status: 'success', code: 200, message: 'TicketNumber Data stored Successfully...!' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ status: 'error', code: 500, error: 'Internal Server Error' });
  }
};

async function findDuplicateClaimNumbers(Model, data) {
  const claimNumbers = data.map(item => item.ticket_number);
  const duplicatesInDatabase = await Model.findAll({
    attributes: ['ticket_number'],
    where: { ticket_number: claimNumbers },
    raw: true,
  });

  console.log('All Ticket numbers in data:', claimNumbers);
  console.log('Duplicate Ticket numbers in database:', duplicatesInDatabase);

  const duplicateClaimNumbers = duplicatesInDatabase.map(item => item.ticket_number);
  return duplicateClaimNumbers;
}

async function saveAllClaimData(dbName, tableName, data) {
  const sequelizeInstance = getSequelizeInstance(dbName);
  const ClaimsModel = getModel(sequelizeInstance, tableName);

  try {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (item.status === 'accepted') {
        // Insert a new record with the same ticket_number
        await ClaimsModel.create({
          ...item,
          accepted_date: new Date(),
        });
        console.log(`ClaimID ${item.ticket_number} inserted into ${tableName}, accepted_date set to current date and time`);
      } else {
        const existingRecord = await ClaimsModel.findOne({ where: { ticket_number: item.ticket_number } });

        if (existingRecord) {
          // If record exists, update the record without changing accepted_date
          await existingRecord.update(item);
          console.log(`ClaimID ${item.ticket_number} updated in ${tableName}`);
        } else {
          // If record doesn't exist, insert a new record
          await ClaimsModel.create(item);
          console.log(`ClaimID ${item.ticket_number} inserted into ${tableName}`);
        }
      }
    }

    console.log(`All Ticketnumber data processed for ${tableName}`);
  } catch (error) {
    console.error(`Error processing Ticketnumber data for ${tableName}:`, error);
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
      where: { client_name: 'ccg_inventories' },
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
      where: { client_name: 'ccg_inventories' },
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
      where: { client_name: 'ccg_inventories' },
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
  if (dbName === 'AIG_HVLC') {
    return sequelizeAIGhvlc;
  }
}

function getModel(sequelizeInstance, modelName) {
  switch (modelName) {
    case 'AIG_hvlc_inventory':
      return HVLC(sequelizeInstance);
    case 'AIG_hvlc_inventory_duplicates':   
      return HVLCduplicate(sequelizeInstance);
      case 'ProjectEmail':   
      return ProjectEmail;
    default:
      throw new Error(`Invalid modelName: ${modelName}`);
  }
}



module.exports = {
    storeDataAIGhvlc
};
