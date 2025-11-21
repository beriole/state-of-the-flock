const { sequelize } = require('../models');

async function resetDb() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        console.log('🗑️ Dropping tables...');
        // Disable foreign key checks to allow dropping tables in any order
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.drop(); // Drops all tables defined in models
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables dropped');

        console.log('🔄 Syncing database...');
        await sequelize.sync({ force: true });
        console.log('✅ Database synced successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting DB:', error);
        process.exit(1);
    }
}

resetDb();
