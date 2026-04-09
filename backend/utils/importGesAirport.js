const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Frederic', phone: '' },
  { first_name: 'Solomon', phone: '650580593' },
  { first_name: 'Stacey', phone: '653015947' },
  { first_name: 'Laure', phone: '657533131' },
  { first_name: 'Michel', phone: '' },
  { first_name: 'Laetitia', phone: '' },
  { first_name: 'Mama Joy', phone: '' },
  { first_name: 'All bright', phone: '68317351' },
  { first_name: 'Adrian ft', phone: '' },
  { first_name: 'Ivo ft', phone: '' },
  { first_name: 'Prince', phone: '' },
  { first_name: 'Olive', phone: '695192670' },
  { first_name: 'Wilson', phone: '' },
  { first_name: 'Flavia', phone: '' },
  { first_name: 'Adeline', phone: '' },
  { first_name: 'Alan', phone: '' },
  { first_name: 'Tewang', phone: '672919647' },
  { first_name: 'Alex', phone: '' },
  { first_name: 'Micheal ft', phone: '' },
  { first_name: 'Noella ft', phone: '' },
  { first_name: 'Adriano ft', phone: '' },
  { first_name: 'Kevin ft', phone: '' },
  { first_name: 'Marc ft', phone: '670126015' },
  { first_name: 'Maxwell ft', phone: '' },
  { first_name: 'Brayan ft', phone: '' },
  { first_name: 'Sandrine ft', phone: '' },
  { first_name: 'Clémentine ft', phone: '' },
  { first_name: 'Hilaria ft', phone: '' },
  { first_name: 'Queenta ft', phone: '' },
  { first_name: 'Boris ft', phone: '679941742' },
  { first_name: 'Sandra ft', phone: '' },
  { first_name: 'Ramsey ft', phone: '' },
  { first_name: 'Benito ft', phone: '691086780' },
  { first_name: 'Desmond ft', phone: '' },
  { first_name: 'William', phone: '' },
  { first_name: 'Laure 2', phone: '' },
  { first_name: 'Ken', phone: '' },
  { first_name: 'Estella', phone: '' },
  { first_name: 'jules', phone: '' },
  { first_name: 'jacqueline', phone: '' },
  { first_name: 'kecenia', phone: '' },
  { first_name: 'aime', phone: '' },
  { first_name: 'elisabeth', phone: '' },
  { first_name: 'ngwa brian', phone: '' },
  { first_name: 'raoul', phone: '694461446' }
];

async function importGesAirportMembers(leaderId, areaId) {
  let imported = 0;
  let skipped = 0;
  let updated = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Leader/Governor n a pas de zone assignée.' };
  }

  for (const m of membersData) {
    try {
      const cleanFirstName = m.first_name.trim();
      
      const existingMember = await Member.findOne({
        where: {
          first_name: cleanFirstName,
          leader_id: leaderId
        }
      });

      if (existingMember) {
        await existingMember.update({ service_type: 'GES' });
        updated++;
      } else {
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'GES',
          area_id: areaId,
          leader_id: leaderId,
          is_active: true
        });
        imported++;
      }
    } catch (error) {
      console.error(`Error importing ${m.first_name}:`, error.message);
      if (errors.length < 5) {
        errors.push(`${m.first_name}: ${error.message}`);
      }
      skipped++;
    }
  }

  // Fallback: update ALL of this leader's existing members to GES
  await Member.update(
    { service_type: 'GES' },
    { where: { leader_id: leaderId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importGesAirportMembers };
