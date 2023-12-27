// config/models/TallahasseeInventory.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TallahasseeInventory = sequelize.define('TallahasseeInventories', {
    claim_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    emp_id: { 
      type: DataTypes.STRING(255),
    },
    username: DataTypes.STRING,
    worklist_status: DataTypes.STRING,
    pend_effective: DataTypes.STRING,
    pend_expires: DataTypes.STRING,
    payer: DataTypes.STRING,
    custom_insurance_group: DataTypes.STRING,
    insurance_package: DataTypes.STRING,
    outstanding_amount: DataTypes.DECIMAL(10, 2),
    date_of_service: DataTypes.STRING,
    diagnosis_codes: DataTypes.STRING,
    procedure_code: DataTypes.STRING,
    hold_reason: DataTypes.STRING,
    hold_date: DataTypes.STRING,
    days_in_status: DataTypes.INTEGER,
    primary_department: DataTypes.STRING,
    patient_department: DataTypes.STRING,
    service_department: DataTypes.STRING,
    supervising_provider: DataTypes.STRING,
    rendering_provider: DataTypes.STRING,
    referring_provider: DataTypes.STRING,
    patient_name: DataTypes.STRING,
    worklist: DataTypes.STRING,
    last_claim_note: DataTypes.STRING,
    claim_status: DataTypes.STRING,
    specialty: DataTypes.STRING,
    escalated_on: DataTypes.STRING,
    assign_to: DataTypes.STRING, 
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'pending', 
      validate: {
        isIn: [['completed', 'inprogress', 'pending', 'hold']],
      },
    },

  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    inventoryDate: 'inventory_date',
  });

  return TallahasseeInventory;
};
