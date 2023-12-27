// models/AigDdcInventoryDuplicates.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AigDdcInventoryDuplicates = sequelize.define('aig_ddc_inventory_duplicates', {
    ticket_number: {
      type: DataTypes.STRING(255),
    },
    doctor: {
      type: DataTypes.STRING(255),
    },
    insurance_carrier: {
      type: DataTypes.STRING(255),
    },
    patient_id: {
      type: DataTypes.STRING(255),
    },
    patient_name: {
      type: DataTypes.STRING(255),
    },
    dos: {
      type: DataTypes.STRING(255),
    },
    doe: {
      type: DataTypes.STRING(255),
    },
    facility: {
      type: DataTypes.STRING(255),
    },
    pos: {
      type: DataTypes.STRING(255),
    },
    coder_e_m_cpt: {
      type: DataTypes.STRING(255),
    },
    coder_e_m_icd: {
      type: DataTypes.STRING(255),
    },
    biller_audit_cpt: {
      type: DataTypes.STRING(255),
    },
    biller_audit_icd: {
      type: DataTypes.STRING(255),
    },
    em_dx_problem_addressed: {
      type: DataTypes.STRING(255),
    },
    severity_of_diagnosis: {
      type: DataTypes.STRING(255),
    },
    amount_and_complexity_of_data: {
      type: DataTypes.STRING(255),
    },
    risk_of_complications: {
      type: DataTypes.STRING(255),
    },
    visit_status: {
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
    coder_comments: {
      type: DataTypes.STRING(255),
    },
    emp_id: {
      type: DataTypes.STRING(255),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('accepted', 'notaccepted'),
      defaultValue: 'notaccepted',
    },
    inventory_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    accepted_date: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  }, {
    // Add timestamps for createdAt and updatedAt
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    inventoryDate: 'inventory_date',
  });

  return AigDdcInventoryDuplicates;
};
