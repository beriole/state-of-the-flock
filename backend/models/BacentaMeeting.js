// models/BacentaMeeting.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BacentaMeeting = sequelize.define('BacentaMeeting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leader_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    meeting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    meeting_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    meeting_type: {
      type: DataTypes.ENUM(
        'Weekly_Sharing',
        'Prayer_Meeting',
        'Bible_Study',
        'Evangelism',
        'Other'
      ),
      defaultValue: 'Weekly_Sharing'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    host: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expected_participants: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agenda: {
      type: DataTypes.JSON,
      allowNull: true
    },
    family_photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    offering_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_members_present: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    meeting_duration: {
      type: DataTypes.INTEGER, // en minutes
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    tableName: 'bacenta_meetings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['leader_id']
      },
      {
        fields: ['meeting_date']
      },
      {
        fields: ['meeting_type']
      },
      {
        fields: ['is_verified']
      }
    ]
  });

  return BacentaMeeting;
};