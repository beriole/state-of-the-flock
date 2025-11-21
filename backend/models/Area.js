// models/Area.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Area = sequelize.define('Area', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 50
      }
    },
    overseer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    tableName: 'areas',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['number'],
        unique: true
      },
      {
        fields: ['overseer_id']
      }
    ]
  });

  return Area;
};