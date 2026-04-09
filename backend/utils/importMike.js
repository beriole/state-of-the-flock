const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Lawrence', phone: '' },
  { first_name: 'Aron', phone: '' },
  { first_name: 'Eric', phone: '' },
  { first_name: 'Dasi', phone: '' },
  { first_name: 'Ps Mike', phone: '651302262' },
  { first_name: 'Pamela', phone: '' },
  { first_name: 'Blandine', phone: '681082266' },
  { first_name: 'Fancy', phone: '' },
  { first_name: 'Aunty Solange', phone: '' },
  { first_name: 'Jennifer', phone: '' },
  { first_name: 'Mama Sandrine', phone: '' },
  { first_name: 'Marie ft', phone: '' },
  { first_name: 'Marie\'s friend ft', phone: '' },
  { first_name: 'Larissa ft', phone: '694195389' },
  { first_name: 'Julienne', phone: '' },
  { first_name: 'Alberto', phone: '' },
  { first_name: 'Charlotte', phone: '' },
  { first_name: 'Bum Precious', phone: '' },
  { first_name: 'Precious FT', phone: '671752381' },
  { first_name: 'Baker', phone: '' },
  { first_name: 'Susan', phone: '' },
  { first_name: 'zoser', phone: '699566843' },
  { first_name: 'zozer beloved', phone: '' },
  { first_name: 'ines', phone: '691753238' },
  { first_name: 'Mme Njume', phone: '680006754' },
  { first_name: 'chantal', phone: '658839928' },
  { first_name: 'harriette', phone: '670643450' },
  { first_name: 'carnisia', phone: '650866352' },
  { first_name: 'favour', phone: '' },
  { first_name: 'leocardie', phone: '683954460' },
  { first_name: 'simon pierre', phone: '679965538' },
  { first_name: 'varta francoise', phone: '693610014' },
  { first_name: 'kumato vera', phone: '673995053' },
  { first_name: 'dilan', phone: '678401702' },
  { first_name: 'bevanie', phone: '678841685' },
  { first_name: 'yvette friend', phone: '' },
  { first_name: 'paule', phone: '697843551' },
  { first_name: 'patrick', phone: '651956837' },
  { first_name: 'allianz', phone: '691969277' },
  { first_name: 'bless', phone: '654062073' },
  { first_name: 'roline', phone: '654402073' },
  { first_name: 'carinton', phone: '' },
  { first_name: 'steve', phone: '' },
  { first_name: 'regina', phone: '' },
  { first_name: 'emmanuella', phone: '' },
  { first_name: 'fredrick', phone: '' }
];

async function importMikeMembers(mikeId, areaId) {
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
          leader_id: mikeId
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
          leader_id: mikeId,
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

  // Fallback: update ALL of Mike's existing members to GES
  await Member.update(
    { service_type: 'GES' },
    { where: { leader_id: mikeId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importMikeMembers };
