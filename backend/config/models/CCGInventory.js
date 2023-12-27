// models/CCGInventory.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CCGInventory = sequelize.define('ccg_inventories', {
    charge_id: { 
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    emp_id: { 
      type: DataTypes.STRING(255),
    },
    location: {
      type: DataTypes.STRING,
    },
    cpt: {
      type: DataTypes.STRING,
    },
    insurance: {
      type: DataTypes.STRING,
    },
    coder: {
      type: DataTypes.STRING,
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
  }, {
    // Add timestamps for createdAt and updatedAt
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    inventoryDate: 'inventory_date',
  });

  return CCGInventory;
};
