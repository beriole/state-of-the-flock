const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Blanche', phone: '' },
  { first_name: 'Raissa', phone: '655942521' },
  { first_name: 'Favour Missom', phone: '' },
  { first_name: 'Georgette', phone: '' },

  { first_name: 'Steve', phone: '' },
  { first_name: 'Precious', phone: '' },
  { first_name: 'Nancy', phone: '' },
  { first_name: 'Kelly', phone: '' },
  { first_name: 'Noëlle', phone: '' },
  { first_name: 'Chris', phone: '' },
  { first_name: 'Chidi', phone: '651045125' },
  { first_name: 'Kingsley', phone: '670392080' },
  { first_name: 'Doris', phone: '673367025' },
  { first_name: 'Jennifer', phone: '673367025' },
  { first_name: 'Alicia', phone: '656601300' },
  { first_name: 'Carlisle', phone: '677142446' },
  { first_name: 'Davina', phone: '656601300' },
  { first_name: 'Princewill', phone: '673878588' },
  { first_name: 'Apoloner', phone: '' },
  { first_name: 'Mariebelle', phone: '' },
  { first_name: 'Arrey Princewill', phone: '673878588' },
  { first_name: 'Bryana Tresor', phone: '' }
];

async function importRewardMembers(rewardId, areaId) {
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
          leader_id: rewardId
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
          leader_id: rewardId,
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

  // Fallback: update ALL of Reward's existing members to FLES
  await Member.update(
    { service_type: 'FLES' },
    { where: { leader_id: rewardId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importRewardMembers };
