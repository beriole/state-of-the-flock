// models/CallLog.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CallLog = sequelize.define('CallLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    caller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    call_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    outcome: {
      type: DataTypes.ENUM(
        'Contacted',
        'No_Answer',
        'Callback_Requested',
        'Wrong_Number',
        'Other'
      ),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    next_followup_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    followup_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    call_duration: {
      type: DataTypes.INTEGER, // en secondes
      allowNull: true
    },
    contact_method: {
      type: DataTypes.ENUM('Phone', 'WhatsApp', 'SMS', 'In_Person'),
      defaultValue: 'Phone'
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    tableName: 'call_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['member_id']
      },
      {
        fields: ['caller_id']
      },
      {
        fields: ['call_date']
      },
      {
        fields: ['outcome']
      },
      {
        fields: ['next_followup_date']
      }
    ]
  });

  return CallLog;
};