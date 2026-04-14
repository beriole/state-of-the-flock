const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Oversee = sequelize.define('Oversee', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        region_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'regions',
                key: 'id'
            }
        },
        overseer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        tableName: 'oversees',
        timestamps: true
    });

    return Oversee;
};
