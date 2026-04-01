const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { User, sequelize } = require('../models');

async function check() {
  try {
    const user = await User.findOne({ where: { email: 'calvin.rev@njangui.org' } });
    if (user) {
      console.log('USER_DETAILS:' + JSON.stringify({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        area_id: user.area_id,
        role: user.role
      }));
    } else {
      console.log('USER_NOT_FOUND');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
