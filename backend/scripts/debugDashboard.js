const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { User, Region, Area, Member, sequelize } = require('../models');

async function debug() {
  const GOVERNOR_EMAIL = 'calvin.rev@njangui.org';
  try {
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) {
      console.log('CALVIN_NOT_FOUND');
      return;
    }
    console.log('USER:', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      area_id: user.area_id
    }, null, 2));

    const region = await Region.findOne({ where: { governor_id: user.id } });
    if (region) {
      console.log('REGION_ASSIGNED:', JSON.stringify(region, null, 2));
      const areas = await Area.findAll({ where: { region_id: region.id } });
      console.log('AREAS_IN_REGION:', areas.map(a => a.id));
    } else {
      console.log('NO_REGION_ASSIGNED_TO_THIS_GOVERNOR');
    }

    const memberCount = await Member.count({ where: { leader_id: user.id } });
    console.log('MEMBERS_WITH_THIS_LEADER_ID:', memberCount);

    const membersDirect = await Member.findAll({ where: { leader_id: user.id }, limit: 5 });
    console.log('SAMPLE_MEMBERS:', JSON.stringify(membersDirect.map(m => ({ id: m.id, area_id: m.area_id })), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
