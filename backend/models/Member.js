// models/Member.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_primary: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_secondary: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('M', 'F'),
      allowNull: false
    },
    is_registered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    state: {
      type: DataTypes.ENUM('Sheep', 'Goat', 'Deer'),
      defaultValue: 'Sheep'
    },
    area_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'areas',
        key: 'id'
      }
    },
    leader_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ministry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_attendance_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    tableName: 'members',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['phone_primary']
      },
      {
        fields: ['area_id']
      },
      {
        fields: ['leader_id']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return Member;
};