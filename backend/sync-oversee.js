require('dotenv').config();
const { sequelize } = require('./models');

async function syncOversee() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized with Oversee model and Area modifications.');

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database or sync:', error);
    process.exit(1);
  }
}

syncOversee();
