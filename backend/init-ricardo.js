require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Region, Area, sequelize } = require('./models');
const { importRicardoMembers } = require('./utils/importRicardo');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find a default Area or Region just in case we need to assign him one
    // We can just query the first available area or create one
    let area = await Area.findOne();
    if (!area) {
      let region = await Region.findOne();
      if (!region) {
         region = await Region.create({ name: 'Default Region' });
      }
      area = await Area.create({ name: 'Default Area', region_id: region.id });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Ricardo@123', 10);

    // Find or Create user
    const [user, created] = await User.findOrCreate({
      where: { email: 'ricardo@njangui.org' },
      defaults: {
        first_name: 'Ricardo',
        last_name: '',
        role: 'Bacenta_Leader', // Can be Governor, Area_Pastor, or Bacenta_Leader
        password: hashedPassword,
        phone: '',
        area_id: area.id,
        is_active: true
      }
    });

    if (created) {
      console.log('User Ricardo created.');
    } else {
      console.log('User Ricardo already exists.');
    }

    // Pass the user's ID
    const result = await importRicardoMembers(user.id, user.area_id);
    console.log('Import result:', result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

run();
