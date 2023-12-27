const { Sequelize, DataTypes } = require('sequelize');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const sequelizeMasterEmail = new Sequelize('master_email', 'root', 'root', {
    dialect: 'mysql',
    host: 'localhost',
  });
  
  const sequelizeAIGPSC = new Sequelize('AIG_PSC', 'root', 'root', {
    dialect: 'mysql',
    host: 'localhost',
  });
  
  const initialTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dkloganayaki132@gmail.com',
      pass: 'eoab aiaj jgse qclj',
    },
  });

  const ProjectEmail = sequelizeMasterEmail.define('project_email', {
    client_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cc_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    to_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
   
  }, {
    timestamps: false,
    tableName: 'project_email',
  });

const AIG_psc_inventory = sequelizeAIGPSC.define('AIG_psc_inventories', {
    ticket_number: {
        type: DataTypes.STRING(255),
      },
      doctor: {
        type: DataTypes.STRING(255),
      },
      insurance_carrier: {
        type: DataTypes.STRING(255),
      },
      insurance_group: {
        type: DataTypes.STRING(255),
      },
      patient_id: {
        type: DataTypes.STRING(255),
      },
      patient_name: {
        type: DataTypes.STRING(255),
      },
      dob: {
        type: DataTypes.STRING(255),
      },
      dos: {
        type: DataTypes.STRING(255),
      },
      doe: {
        type: DataTypes.STRING(255),
      },
      department: {
        type: DataTypes.STRING(255),
      },
      facility: {
        type: DataTypes.STRING(255),
      },
      company: {
        type: DataTypes.STRING(255),
      },
      pos: {
        type: DataTypes.STRING(255),
      },
      visit_status: {
        type: DataTypes.STRING(255),
      },
      visit_desc: {
        type: DataTypes.STRING(255),
      },
      cpt: {
        type: DataTypes.STRING(255),
      },
      units: {
        type: DataTypes.STRING(255),
      },
      modifier: {
        type: DataTypes.STRING(255),
      },
      diagnoses: {
        type: DataTypes.STRING(255),
      },
      coder_cpt: {
        type: DataTypes.STRING(255),
      },
      coder_icd: {
        type: DataTypes.STRING(255),
      },
      coder_comments: {
        type: DataTypes.STRING(255),
      },
      emp_id: {
        type: DataTypes.STRING(255),
      },
      created_at: false,
      updated_at: false,
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'pending',
        validate: {
          isIn: [['completed', 'inprogress', 'pending', 'hold']],
        },
      },
      inventory_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

    }, {
        timestamps: false, 
      });


// Define the cron job to run every minute
cron.schedule('* * * * *', async () => {
    try {
      const entries = await AIG_psc_inventory.findAll({
        where: {
            status: ['pending', 'hold'],
        },
      });
  
      if (entries.length > 0) {
        await sendEmailNotification(entries);
      } else {
        console.log('No entries with status duplicate found.');
      }
    } catch (error) {
      console.error('Error querying database or sending email:', error);
    }
  });
  
  async function sendEmailNotification(request) {
    try {
      const result = await ProjectEmail.findOne({
        where: { client_name: 'aig_psc_inventories' },
      });
  
      if (!result) {
        console.log('No data found for the specified condition.');
        return;
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
  
      await sendEmail(mailOptions);
    } catch (error) {
      console.error('Error querying database or sending email:', error);
    }
  }
  
  async function sendEmail(mailOptions) {
    await initialTransporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  }
      
      
