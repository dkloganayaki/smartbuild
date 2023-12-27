// models/Ashe_inventory.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AsheInventory = sequelize.define('AsheInventories', {
    
    coding_date: {
      type: DataTypes.STRING(255),
    },
    claim_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      unique: true,
    },
    emp_id: { 
      type: DataTypes.STRING(255),
    },
    patient_name: {
      type: DataTypes.STRING(255),
    },
    mri_number: {
      type: DataTypes.STRING(255),
    },
    admit_date: {
      type: DataTypes.STRING(255),
    },
    discharge_date: {
      type: DataTypes.STRING(255),
    },
    insurance: {
      type: DataTypes.STRING(255),
    },
    location: {
      type: DataTypes.STRING(255),
    },
    user_name: {
      type: DataTypes.STRING(255),
    },
    actual_user: {
      type: DataTypes.STRING(255),
    },
    emp_id: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'pending', 
      validate: {
        isIn: [['completed', 'inprogress', 'pending', 'hold']],
      },
    },
  }, {
    // Add timestamps for createdAt and updatedAt
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    inventoryDate: 'inventory_date',
  });
 

  return AsheInventory;
};
