const { Member, User } = require('../models');

// Extracted from the provided list
const membersData = [
  { first_name: 'Prisca', phone: '651239556' },
  { first_name: 'Mama Victorine', phone: '' },
  { first_name: 'Clariss', phone: '671141753' },
  { first_name: 'Odilia', phone: '670678604' },
  { first_name: 'Cliford', phone: '653915858' },
  { first_name: 'Favour', phone: '' },
  { first_name: 'Sandrine', phone: '' },
  { first_name: 'Grace', phone: '672327399' },
  { first_name: 'Mama Emerencia', phone: '' },
  { first_name: 'Lydie', phone: '' },
  { first_name: 'Nadesh', phone: '679267154' },
  { first_name: 'Emmanuel', phone: '' },
  { first_name: 'Chantal', phone: '' },
  { first_name: 'Mama Marie', phone: '' },
  { first_name: 'Evrad', phone: '681577741' },
  { first_name: 'Bena', phone: '' },
  { first_name: 'Prince', phone: '' },
  { first_name: 'Lovinnes', phone: '' },
  { first_name: 'Mme Folefack', phone: '' },
  { first_name: 'Alvine', phone: '671408803' },
  { first_name: 'Marie', phone: '678311400' },
  { first_name: 'Elvira', phone: '' },
  { first_name: 'Hortense', phone: '672439977' },
  { first_name: 'Serge', phone: '656722880' },
  { first_name: 'Abigail', phone: '654228990' },
  { first_name: 'Joel', phone: '694332211' },
  { first_name: 'Pascaline', phone: '691234455' },
  { first_name: 'Mado', phone: '678990011' },
  { first_name: 'Estella', phone: '' },
  { first_name: 'Mme Akono', phone: '' },
  { first_name: 'Rose', phone: '' },
  { first_name: 'Roseline', phone: '' },
  { first_name: 'Krys', phone: '' },
  { first_name: 'Mama Caro', phone: '' }
];

async function importSamuelJESMembers(samuelId, areaId) {
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
          leader_id: samuelId
        }
      });

      if (existingMember) {
        // We update the service type to JES as requested and prevent duplicates
        await existingMember.update({ service_type: 'JES' });
        updated++;
      } else {
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'JES',
          area_id: areaId,
          leader_id: samuelId,
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

  // Force all existing members of this leader to JES if they weren't already
  await Member.update(
    { service_type: 'JES' },
    { where: { leader_id: samuelId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importSamuelJESMembers };
