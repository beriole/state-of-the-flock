// models/Region.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Region = sequelize.define('Region', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        governor_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'regions',
        timestamps: true,
        underscored: true
    });

    return Region;
};
