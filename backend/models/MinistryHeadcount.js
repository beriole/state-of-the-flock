// models/MinistryHeadcount.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MinistryHeadcount = sequelize.define('MinistryHeadcount', {
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        headcount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        marked_by_user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'ministry_headcounts',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['ministry_id', 'date']
            }
        ]
    });

    return MinistryHeadcount;
};
