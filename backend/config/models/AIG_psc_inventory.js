// models/aig_psc_inventory_duplicates.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AigPscInventory = sequelize.define('aig_psc_inventories', {
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

  return AigPscInventory;
};
