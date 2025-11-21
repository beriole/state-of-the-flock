const { sequelize } = require('../models');

async function forceDrop() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected');

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.query('DROP TABLE IF EXISTS users');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Users table dropped');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

forceDrop();
