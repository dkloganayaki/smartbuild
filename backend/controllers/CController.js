const { Sequelize } = require('sequelize');
const CClientClaimsDetailsModel = require('../config/models/C_client_claims_details');
const ADuplicateClientClaimsDetailsModel = require('../config/models/A_duplicate_client_claims_details');
const transporter = require('../email/transporter');

const dbConfigC = {
    database: 'C',
    username: 'root',
    password: 'root',
    host: 'localhost',
    dialect: 'mysql',
  };
  
  const sequelizeC = new Sequelize(dbConfigC);
  
const cDatastore = async (req, res) => {
  try {
    const { dbName, modelName } = req.params;
    const data = req.body;
    console.log('Received datass:', data);
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
      'escalated_on'
    ];

    const missingColumns = expectedColumns.filter(column => !data[0].hasOwnProperty(column));

    if (missingColumns.length > 0) {
      sendMissingColumnsEmail(res, missingColumns);
      return res.status(200).json({ status: 'Failed', code: 200, message: 'Missing columns detected.' });
    }

    const duplicateClaimNumbers = await findDuplicateClaimNumbers(Model, data);

    if (duplicateClaimNumbers.length > 0) {
      const duplicateTableName = 'A_duplicate_client_claims_details';
      await saveDuplicateClaimData(dbName, duplicateTableName, duplicateClaimNumbers, data);

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

async function saveDuplicateClaimData(dbName, duplicateClaimNumbers, originalData) {
    const sequelizeInstance = getSequelizeInstance('A'); 
    const globalDuplicateTableName = 'A_duplicate_client_claims_details';
    const DuplicateClaimsModel = getModel(sequelizeInstance, globalDuplicateTableName);
  
    try {
        const existingClaimIds = await DuplicateClaimsModel.findAll({
            attributes: ['claim_id'],
            raw: true,
        });
  
        const existingClaimIdsSet = new Set(existingClaimIds.map(item => item.claim_id));
  
        for (let i = 0; i < originalData.length; i++) {
            const item = originalData[i];
  
            if (duplicateClaimNumbers.includes(item.claim_id) && !existingClaimIdsSet.has(item.claim_id)) {
                await DuplicateClaimsModel.create(item);
                console.log(`Claim ${item.claim_id} inserted into ${globalDuplicateTableName}`);
            } else {
                console.log(`Claim ${item.claim_id} already exists in ${globalDuplicateTableName}, not inserted`);
            }
        }
  
        console.log(`Duplicate claim data saved in ${globalDuplicateTableName}`);
    } catch (error) {
        console.error(`Error saving duplicate claim data for ${globalDuplicateTableName}:`, error);
        throw error;
    }
}

  

async function bulkInsertData(Model, data) {
  return Model.bulkCreate(data);
}

function sendEmailNotification(res, request, invalidDates) {
  if (!request || !Array.isArray(request)) {
    return res.status(400).json({ status: 'error', code: 400, error: 'Invalid data format. Expected an array for request.' });
  }

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
    to: 'dkloganayaki132@gmail.com',
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
}

function sendErrorEmail(res, errorResponse) {
  const mailOptions = {
    from: 'dkloganayaki132@gmail.com',
    to: 'dkloganayaki132@gmail.com',
    subject: 'Error in Data Processing',
    html: `<p>Error details: ${JSON.stringify(errorResponse)}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending error email:', error);
      res.status(500).json({ error: 'Error sending error email' });
    } else {
      console.log('Error email sent:', info.response);
      res.json({ message: 'Error email sent successfully.' });
    }
  });
}

function sendMissingColumnsEmail(res, missingColumns) {
  const mailOptions = {
    from: 'dkloganayaki132@gmail.com',
    to: 'dkloganayaki132@gmail.com',
    subject: 'Missing Columns in Data',
    html: `<p>The following columns are missing in the received data: ${missingColumns.join(', ')}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ status: 'error', code: 500, error: 'Error sending email' });
    } else {
      console.log('Email sent:', info.response);
      return res.json({ status: 'success', code: 200, message: 'Email sent successfully for missing columns.' });
    }
  });
}

function getSequelizeInstance(dbName) {
    if (dbName === 'C') {
        return sequelizeC;
      }
}

function getModel(sequelizeInstance, modelName) {
    switch (modelName) {
      case 'C_client_claims_details':
        return CClientClaimsDetailsModel(sequelizeInstance);
      case 'A_duplicate_client_claims_details':
        return ADuplicateClientClaimsDetailsModel(sequelizeInstance);
      default:
        throw new Error(`Invalid modelName: ${modelName}`);
    }
  }
  




module.exports = {
    cDatastore,
};
