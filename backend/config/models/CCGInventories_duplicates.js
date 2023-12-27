// models/CCGInventory.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CCGInventory = sequelize.define('CCGinventories_duplicates', {
    charge_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.ENUM('accepted', 'notaccepted'),
      allowNull: true,
      defaultValue: 'notaccepted'
    },
    accepted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    // Add timestamps for createdAt and updatedAt
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    inventoryDate: 'inventory_date'
  });

  return CCGInventory;
};
