const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Jervis', phone: '653015981' },
  { first_name: 'Michelle', phone: '' },
  { first_name: 'Shekina', phone: '674070299' },
  { first_name: 'Amie', phone: '' },
  { first_name: 'Brenda', phone: '675889440' },
  { first_name: 'Kiki', phone: '679289198' },
  { first_name: 'Muria', phone: '659598598' }
];

async function importLydiaMembers(lydiaId, areaId) {
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
          leader_id: lydiaId
        }
      });

      if (existingMember) {
        await existingMember.update({ service_type: 'FLES' });
        updated++;
      } else {
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'FLES',
          area_id: areaId,
          leader_id: lydiaId,
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

  // Fallback: update ALL of Lydia's existing members to FLES
  await Member.update(
    { service_type: 'FLES' },
    { where: { leader_id: lydiaId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importLydiaMembers };
