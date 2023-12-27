// models/ProjectEmailModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectEmail = sequelize.define(
    'ProjectEmail',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      to_address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cc_address: {
        type: DataTypes.STRING(255),
      },
      client_name: {
        type: DataTypes.STRING(255),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'project_email',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return ProjectEmail;
};
