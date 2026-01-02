// models/Ministry.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Ministry = sequelize.define('Ministry', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        leader_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'ministries',
        timestamps: true,
        underscored: true
    });

    return Ministry;
};
