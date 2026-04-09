const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Mafua', phone: '651379608' },
  { first_name: 'Danielle', phone: '676145676' },
  { first_name: 'Béatrice', phone: '676971736' },
  { first_name: 'Gift', phone: '' },
  { first_name: 'Lounge', phone: '654906352' },
  { first_name: 'Kameni', phone: '' },
  { first_name: 'Landry', phone: '' },
  { first_name: 'Justin', phone: '659221985' },
  { first_name: 'Elvis', phone: '671005172' },
  { first_name: 'David', phone: '673181363' },
  { first_name: 'Fritz', phone: '' },
  { first_name: 'Promise ft', phone: '' },
  { first_name: 'Blaise ft', phone: '' },
  { first_name: 'Mrs. Mosima', phone: '' },
  { first_name: 'Engr Fabrice Ft', phone: '' },
  { first_name: 'Dr Noella FT', phone: '' },
  { first_name: 'Dr Malyse FT', phone: '' },
  { first_name: 'Dr Sonita FT', phone: '' },
  { first_name: 'Mgr Valmy FT', phone: '' },
  { first_name: 'Maurice', phone: '' },
  { first_name: 'Divine', phone: '' },
  { first_name: 'Jerry', phone: '' },
  { first_name: 'Aziz', phone: '' },
  { first_name: 'Anyi', phone: '' },
  { first_name: 'Ella', phone: '' },
  { first_name: 'Bella', phone: '' },
  { first_name: 'david 2', phone: '' },
  { first_name: 'daryl', phone: '' },
  { first_name: 'nipoh', phone: '' },
  { first_name: 'fongang', phone: '690803788' },
  { first_name: 'blessing', phone: '656807649' }
];

async function importElyseeMembers(leaderId, areaId) {
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

module.exports = { importElyseeMembers };
