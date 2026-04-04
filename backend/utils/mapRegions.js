const data = [
  { firstName: 'Marcel', lastName: 'Ps', email: 'marcel.ps@njangui.org', phone: '677001122', region: 'Area 1', zone: 'Camp Sonel', pass: 'Marcel@123' },
  { firstName: 'Yvette', lastName: 'Lp', email: 'yvette.lp@njangui.org', phone: '677112233', region: 'Area 1', zone: 'Afanayo', pass: 'Yvette@123' },
  { firstName: 'Akongnwi', lastName: 'Leader', email: 'akongnwi@njangui.org', phone: '677223344', region: 'Area 1', zone: 'Cimencam', pass: 'Akongnwi@123' },
  { firstName: 'Vera', lastName: 'Overseer', email: 'vera@njangui.org', phone: '677334455', region: 'Area 2', zone: 'Mendong', pass: 'Vera@123' },
  { firstName: 'Clovis', lastName: 'Ps', email: 'clovis.ps@njangui.org', phone: '677445566', region: 'Area 2', zone: 'Simbock / Eloumdem', pass: 'Clovis@123' },
  { firstName: 'Daline', lastName: 'Leader', email: 'daline@njangui.org', phone: '677556677', region: 'Area 2', zone: 'Mbalgon', pass: 'Daline@123' },
  { firstName: 'Noella', lastName: 'Leader', email: 'noella@njangui.org', phone: '677667788', region: 'Area 2', zone: 'Damas', pass: 'Noella@123' },
  { firstName: 'Rayon', lastName: 'Leader', email: 'rayon@njangui.org', phone: '677778899', region: 'Area 2', zone: 'Efoulan', pass: 'Rayon@123' },
  { firstName: 'Marco', lastName: 'Leader', email: 'marco@njangui.org', phone: '678001122', region: 'Area 2', zone: 'Bandoumou', pass: 'Marco@123' },
  { firstName: 'Aimé', lastName: 'Ps', email: 'aime.ps@njangui.org', phone: '678112233', region: 'Area 2', zone: 'Nkonfulu', pass: 'Aime@123' },
  { firstName: 'Emmanuel', lastName: 'Glory', email: 'emmanuel.glory@njangui.org', phone: '678223344', region: 'Area 2', zone: 'Soa 1', pass: 'Emmanuel@123' },
  { firstName: 'Calvin', lastName: 'Rev', email: 'calvin.rev@njangui.org', phone: '678334455', region: 'Area 2', zone: 'IAI', pass: 'Calvin@123' },
  { firstName: 'Esther', lastName: 'Leader', email: 'esther@njangui.org', phone: '678445566', region: 'Area 2', zone: 'ODZA', pass: 'Esther@123' },
  { firstName: 'Annie', lastName: 'Grace', email: 'annie.grace@njangui.org', phone: '678556677', region: 'Area 2', zone: 'Ekounou', pass: 'Annie@123' },
  { firstName: 'Reward', lastName: 'Leader', email: 'reward@njangui.org', phone: '678667788', region: 'Area 2', zone: 'Nsam', pass: 'Reward@123' },
  { firstName: 'Mercedes', lastName: 'Ps', email: 'mercedes.ps@njangui.org', phone: '678778899', region: 'Area 2', zone: 'Siantou / Coron', pass: 'Mercedes@123' },
  { firstName: 'Sandrine', lastName: 'Lp', email: 'sandrine.lp@njangui.org', phone: '679001122', region: 'Area 2', zone: 'Ecole de Poste', pass: 'Sandrine@123' },
  { firstName: 'Mukete', lastName: 'Leader', email: 'mukete@njangui.org', phone: '679112233', region: 'Area 2', zone: 'Etoug-Ebe', pass: 'Mukete@123' },
  { firstName: 'Cynthia', lastName: 'Lp', email: 'cynthia.lp@njangui.org', phone: '679223344', region: 'Area 2', zone: 'Nkolbison', pass: 'Cynthia@123' },
  { firstName: 'Priscilla', lastName: 'Lp', email: 'priscilla.lp@njangui.org', phone: '679334455', region: 'Area 2', zone: 'Obili', pass: 'Priscilla@123' },
  { firstName: 'Bongeh', lastName: 'Leader', email: 'bongeh@njangui.org', phone: '679445566', region: 'Area 2', zone: 'Mvog-Betsi', pass: 'Bongeh@123' },
  { firstName: 'Tracey', lastName: 'Rev', email: 'tracey.rev@njangui.org', phone: '679556677', region: 'Area 2', zone: 'Bonas', pass: 'Tracey@123' },
  { firstName: 'Clifford', lastName: 'Leader', email: 'clifford@njangui.org', phone: '679667788', region: 'Area 2', zone: 'Mimboman 2', pass: 'Clifford@123' },
  { firstName: 'Samuel', lastName: 'Ps', email: 'samuel.ps@njangui.org', phone: '679778899', region: 'Area 2', zone: 'Eloumdem / Damas / Simbock', pass: 'Samuel@123' },
  { firstName: 'Lydia', lastName: 'Lp', email: 'lydia.lp@njangui.org', phone: '680001122', region: 'Area 2', zone: 'Tropicana', pass: 'Lydia@123' },
  { firstName: 'Dexter', lastName: 'Ps', email: 'dexter.ps@njangui.org', phone: '680112233', region: 'Area 2', zone: 'FLES', pass: 'Dexter@123' },
  { firstName: 'Akime', lastName: 'Rev', email: 'akime.rev@njangui.org', phone: '680223344', region: 'Area 2', zone: 'General', pass: 'Akime@123' },
  { firstName: 'Rosa', lastName: 'Joy', email: 'rosa.joy@njangui.org', phone: '680334455', region: 'Area 2', zone: 'General', pass: 'Rosa@123' },
  { firstName: 'Ricardo', lastName: 'Leader', email: 'ricardo@njangui.org', phone: '680445566', region: 'Area 2', zone: 'General', pass: 'Ricardo@123' },
  { firstName: 'Stella', lastName: 'Lp', email: 'stella.lp@njangui.org', phone: '681001122', region: 'Area 3', zone: 'Choir', pass: 'Stella@123' },
  { firstName: 'Nora', lastName: 'Lp', email: 'nora.lp@njangui.org', phone: '681112233', region: 'Area 3', zone: 'Choir', pass: 'Nora@123' },
  { firstName: 'Maxi', lastName: 'Leader', email: 'maxi@njangui.org', phone: '681223344', region: 'Area 3', zone: 'FES Choir', pass: 'Maxi@123' },
  { firstName: 'Shalom', lastName: 'Leader', email: 'shalom@njangui.org', phone: '681334455', region: 'Area 3', zone: 'GES Choir', pass: 'Shalom@123' },
  { firstName: 'Jacobson', lastName: 'Leader', email: 'jacobson@njangui.org', phone: '681445566', region: 'Area 3', zone: 'Doves', pass: 'Jacobson@123' },
  { firstName: 'Rawlings', lastName: 'Leader', email: 'rawlings@njangui.org', phone: '681556677', region: 'Area 3', zone: 'Spiders', pass: 'Rawlings@123' },
  { firstName: 'Cimon', lastName: 'Leader', email: 'cimon@njangui.org', phone: '681667788', region: 'Area 3', zone: 'Unicorn', pass: 'Cimon@123' },
  { firstName: 'Ricardo', lastName: 'Leader', email: 'ricardo.ds@njangui.org', phone: '681778899', region: 'Area 3', zone: 'FES DS', pass: 'Ricardo@123' },
  { firstName: 'Kevine', lastName: 'Leader', email: 'kevine@njangui.org', phone: '682001122', region: 'Area 3', zone: 'Film Stars', pass: 'Kevine@123' },
  { firstName: 'Karl', lastName: 'Leader', email: 'karl@njangui.org', phone: '682112233', region: 'Area 4', zone: 'Ushers', pass: 'Karl@123' },
  { firstName: 'Smith', lastName: 'Leader', email: 'smith@njangui.org', phone: '682223344', region: 'Area 4', zone: 'Ushers', pass: 'Smith@123' },
  { firstName: 'Chris', lastName: 'Leader', email: 'chris@njangui.org', phone: '682334455', region: 'Area 4', zone: 'Ushers', pass: 'Chris@123' },
  { firstName: 'Claris', lastName: 'Leader', email: 'claris@njangui.org', phone: '682445566', region: 'Area 4', zone: 'Airport Stars', pass: 'Claris@123' },
  { firstName: 'GES', lastName: 'Leader', email: 'ges.airport@njangui.org', phone: '682556677', region: 'Area 4', zone: 'Airport GES', pass: 'Ges@123' },
  { firstName: 'FES', lastName: 'Leader', email: 'fes.airport@njangui.org', phone: '682667788', region: 'Area 4', zone: 'Airport FES', pass: 'Fes@123' },
  { firstName: 'Elysee', lastName: 'Dr', email: 'elysee.dr@njangui.org', phone: '682778899', region: 'Area 4', zone: 'Projection', pass: 'Elysee@123' },
  { firstName: 'Rudolph', lastName: 'Leader', email: 'rudolph@njangui.org', phone: '683001122', region: 'Area 4', zone: 'Perfect Sound', pass: 'Rudolph@123' },
  { firstName: 'Cathy', lastName: 'Leader', email: 'cathy@njangui.org', phone: '683112233', region: 'Area 4', zone: 'Photography', pass: 'Cathy@123' },
  { firstName: 'Leena', lastName: 'Leader', email: 'leena@njangui.org', phone: '683223344', region: 'Area 4', zone: 'Communion Stars', pass: 'Leena@123' },
  { firstName: 'Mike', lastName: 'Ps', email: 'mike.ps@njangui.org', phone: '683334455', region: 'Area 4', zone: 'Instrumentalist', pass: 'Mike@123' }
];

async function mapAllRegions() {
  const { User, Region, Area } = require('../models');
  const bcrypt = require('bcrypt');
  const { Op } = require('sequelize');

  let logs = [];

  try {
    // 1. Ensure the 4 base Regions exist
    for (let i = 1; i <= 4; i++) {
      let r = await Region.findOne({ where: { name: `Area ${i}` } });
      if (!r) {
        r = await Region.create({ name: `Area ${i}` });
        logs.push(`Created Region Area ${i}`);
      }
    }

    // 2. Loop through the list
    for (const gov of data) {
      // Find or create User
      let user = await User.findOne({ where: { email: gov.email } });
      if (!user) {
        const password_hash = await bcrypt.hash(gov.pass, 12);
        user = await User.create({
          email: gov.email,
          password_hash,
          role: 'Governor',
          church_role: 'Governor',
          permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
          first_name: gov.firstName,
          last_name: gov.lastName,
          phone_primary: gov.phone,
          account_status: 'Active'
        });
        logs.push(`Created user ${gov.firstName} ${gov.lastName}`);
      } else {
        logs.push(`Found user ${gov.email}`);
      }

      // Get appropriate Region
      const region = await Region.findOne({ where: { name: gov.region } });
      
      // Get or create Zone
      let area = await Area.findOne({ where: { name: gov.zone } });
      if (!area) {
        let number = 1;
        while (await Area.findOne({ where: { number } })) { number++; }
        area = await Area.create({ name: gov.zone, region_id: region.id, number });
        logs.push(`Created Zone ${gov.zone}`);
      } else {
        await area.update({ region_id: region.id });
        logs.push(`Updated Zone ${gov.zone} to Region ${region.name}`);
      }

      // Explicitly associate user with their area and with Region as governor (if appropriate)
      await user.update({ area_id: area.id });

      // If the region doesnt have a governor, we can set the first one, 
      // but there are multiple governors per region here. So we just update the user's area.
    }

    // 3. Clean up bad "Région Gouverneur..." if they don't have members.
    // Actually, maybe better not to run cleanup automatically yet so we don't break anything.
    // Let's just fix the mapping first.

    return { success: true, logs };

  } catch (err) {
    return { success: false, error: err.message, stack: err.stack };
  }
}

module.exports = { mapAllRegions };
