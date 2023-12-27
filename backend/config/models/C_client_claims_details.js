// config/models/C_client_claims_details.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const C_client_claims_details = sequelize.define('C_client_claims_details', {
    claim_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    employee_id: DataTypes.STRING,
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
    
  }, {
    timestamps: false, 
  });

  return C_client_claims_details;
};
