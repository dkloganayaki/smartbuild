// models/AIGWoundInventory.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AIGWoundInventory = sequelize.define('aig_wound_inventories', {
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
    patientid: {
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
    coders_em_cpt: {
      type: DataTypes.STRING(255),
    },
    coders_em_icd_10: {
      type: DataTypes.STRING(255),
    },
    coders_procedure_cpt: {
      type: DataTypes.STRING(255),
    },
    coders_procedure_icd_10: {
      type: DataTypes.STRING(255),
    },
    billers_audit_cpt_comments: {
      type: DataTypes.TEXT,
    },
    billers_audit_icd: {
      type: DataTypes.STRING(255),
    },
    doctors_mr_cpt: {
      type: DataTypes.STRING(255),
    },
    em_dx_number_attended: {
      type: DataTypes.STRING(255),
    },
    severity_of_diagnosis: {
      type: DataTypes.STRING(255),
    },
    amount_and_or_complexity_of_data: {
      type: DataTypes.DECIMAL(10, 2),
    },
    risk_of_complications_and_or_morbidity: {
      type: DataTypes.STRING(255),
    },
    rationale: {
      type: DataTypes.TEXT,
    },
    visit_status: {
      type: DataTypes.STRING(255),
    },
    visitdesc: {
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
    coder_comment: {
      type: DataTypes.TEXT,
    },
    emp_id: {
      type: DataTypes.STRING(255),
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
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
    // Add timestamps for createdAt and updatedAt
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    inventoryDate: 'inventory_date',
  });

  return AIGWoundInventory;
};
