// models/BacentaAttendance.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BacentaAttendance = sequelize.define('BacentaAttendance', {
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
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    present: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    arrival_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    offering_contribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    special_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    marked_by_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },

  }, {
    tableName: 'bacenta_attendances',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['bacenta_meeting_id', 'member_id'],
        unique: true
      },
      {
        fields: ['member_id']
      },
      {
        fields: ['marked_by_user_id']
      },
      {
        fields: ['present']
      }
    ]
  });

  return BacentaAttendance;
};