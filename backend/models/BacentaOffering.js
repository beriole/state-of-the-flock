// models/BacentaOffering.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BacentaOffering = sequelize.define('BacentaOffering', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bacenta_meeting_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bacenta_meetings',
        key: 'id'
      }
    },
    offering_type: {
      type: DataTypes.ENUM(
        'Tithe',
        'Offering',
        'Seed',
        'Project',
        'Thanksgiving',
        'Other'
      ),
      defaultValue: 'Offering'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'XAF'
    },
    collected_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    tableName: 'bacenta_offerings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['bacenta_meeting_id']
      },
      {
        fields: ['offering_type']
      },
      {
        fields: ['collected_by']
      },
      {
        fields: ['is_verified']
      }
    ]
  });

  return BacentaOffering;
};