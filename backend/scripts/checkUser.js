const { Sequelize } = require('sequelize');
const initUser = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

const User = initUser(sequelize);

(async () => {
  try {
    const user = await User.findOne({ where: { email: 'calvin.rev@njangui.org' } });
    if (user) {
      console.log('USER_FOUND:' + JSON.stringify(user));
    } else {
      console.log('USER_NOT_FOUND');
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit();
  }
})();
