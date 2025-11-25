// models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM(
        'Bishop',
        'Assisting_Overseer',
        'Governor',
        'Area_Pastor',
        'Bacenta_Leader',
        'Data_Clerk',
        'Volunteer'
      ),
      allowNull: false
    },
    area_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'areas',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: true,
        darkMode: false,
        language: 'fr'
      }
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['role']
      },
      {
        fields: ['area_id']
      }
    ]
  });

  return User;
};