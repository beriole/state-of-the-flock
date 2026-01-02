// models/MinistryAttendance.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MinistryAttendance = sequelize.define('MinistryAttendance', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        ministry_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'ministries',
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        present: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        marked_by_user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'ministry_attendances',
        timestamps: true,
        underscored: true
    });

    return MinistryAttendance;
};
