// models/Attendance.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
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
    sunday_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    present: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    marked_by_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    service_type: {
      type: DataTypes.STRING,
      defaultValue: 'Experience'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    tableName: 'attendances',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['member_id', 'sunday_date'],
        unique: true
      },
      {
        fields: ['sunday_date']
      },
      {
        fields: ['marked_by_user_id']
      }
    ]
  });

  return Attendance;
};