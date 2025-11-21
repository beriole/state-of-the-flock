const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.STRING, // 'info', 'warning', 'success', 'error', 'attendance', 'call', 'meeting'
            defaultValue: 'info'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        data: {
            type: DataTypes.JSON, // Pour stocker des données supplémentaires (ex: ID de la réunion, nom du membre)
            allowNull: true
        },
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        icon: {
            type: DataTypes.STRING,
            defaultValue: 'bell'
        },
        color: {
            type: DataTypes.STRING,
            defaultValue: '#6B7280'
        }
    }, {
        tableName: 'notifications',
        timestamps: true,
        underscored: true
    });

    return Notification;
};
