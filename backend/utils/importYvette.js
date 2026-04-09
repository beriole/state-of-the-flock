const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Destiny', phone: '652092982' },
  { first_name: 'Furnune', phone: '' },
  { first_name: 'Davina', phone: '' },
  { first_name: 'confort', phone: '' },
  { first_name: 'Alice', phone: '' },
  { first_name: 'Confort', phone: '' }, // keeping exact original list
  { first_name: 'clodine', phone: '' },
  { first_name: 'Vera', phone: '' },
  { first_name: 'Flora', phone: '' },
  { first_name: 'SARa', phone: '' },
  { first_name: 'Fortune', phone: '' },
  { first_name: 'Daniella', phone: '' }
];

async function importYvetteMembers(yvetteId, areaId) {
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
      
      // Look for existing member by name and leader (case insensitive usually in MySQL)
      const existingMember = await Member.findOne({
        where: {
          first_name: cleanFirstName,
          leader_id: yvetteId
        }
      });

      if (existingMember) {
        // If it exists, update the service_type to FLES to ensure everything is correct
        await existingMember.update({ service_type: 'FLES' });
        updated++;
      } else {
        // Create new if it doesn't exist
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'FLES',
          area_id: areaId,
          leader_id: yvetteId,
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

  // Fallback: Also globally update ALL of Yvette's existing members to FLES
  await Member.update(
    { service_type: 'FLES' },
    { where: { leader_id: yvetteId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importYvetteMembers };
