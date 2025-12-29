const { sequelize, User, Area, BacentaMeeting, setupAssociations } = require('./models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connection OK');

        setupAssociations();

        const tableInfo = await sequelize.getQueryInterface().describeTable('bacenta_meetings');
        console.log('Table BacentaMeeting structure:');
        console.log(Object.keys(tableInfo));

        if (!tableInfo.preacher) console.error('❌ MISSING COLUMN: preacher');
        if (!tableInfo.theme) console.error('❌ MISSING COLUMN: theme');

        const user = await User.findOne({ include: [{ model: Area, as: 'area' }] });
        console.log('✅ User lookup with Area OK');

        console.log('✅ Diagnostic complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic FAILED:');
        console.error(error);
        process.exit(1);
    }
}

debug();
