const { Member, User } = require('../models');

const membersData = [
  { first_name: 'LP Yvette', phone: '679423525' },
  { first_name: 'Arthur', phone: '698089898' },
  { first_name: 'Ma\'a Pauline', phone: '' },
  { first_name: 'Andre', phone: '678835392' },
  { first_name: 'Abena', phone: '' },
  { first_name: 'Augrey', phone: '' },
  { first_name: 'Mr Terence', phone: '678618319' },
  { first_name: 'Novelas', phone: '' },
  { first_name: 'Brenda', phone: '' },
  { first_name: 'Michel', phone: '' },
  { first_name: 'Claude', phone: '' },
  { first_name: 'Mildred', phone: '' },
  { first_name: 'Judencia', phone: '' },
  { first_name: 'Ma Therese', phone: '' },
  { first_name: 'Henrietta', phone: '' },
  { first_name: 'Julius', phone: '' },
  { first_name: 'Blessing', phone: '' },
  { first_name: 'Sylvie', phone: '' },
  { first_name: 'Paius', phone: '' },
  { first_name: 'Savior', phone: '' },
  { first_name: 'Virginie', phone: '653907581' },
  { first_name: 'Micheline', phone: '' },
  { first_name: 'Onna', phone: '' },
  { first_name: 'Clémentine', phone: '' },
  { first_name: 'Solange', phone: '' },
  { first_name: 'Obama', phone: '' },
  { first_name: 'Willy', phone: '' },
  { first_name: 'Maureen', phone: '' },
  { first_name: 'Owona', phone: '' },
  { first_name: 'Marie Louise', phone: '' },
  { first_name: 'Diana', phone: '' },
  { first_name: 'Naomi', phone: '' },
  { first_name: 'Ma\'a Jeanne', phone: '' },
  { first_name: 'Ma\'a Rosalie', phone: '' },
  { first_name: 'Emmanuella', phone: '' },
  { first_name: 'Clem\'s husband', phone: '' },
  { first_name: 'Prince', phone: '' },
  { first_name: 'Ryan', phone: '' },
  { first_name: 'Marvelous', phone: '' },
  { first_name: 'Vera', phone: '' },
  { first_name: 'Ernestein', phone: '' },
  { first_name: 'Peggy', phone: '' },
  { first_name: 'Chris', phone: '' },
  { first_name: 'Emmanuel', phone: '652452021' },
  { first_name: 'Marcel', phone: '' },
  { first_name: 'Edwige', phone: '' },
  { first_name: 'Joana', phone: '' },
  { first_name: 'Alice', phone: '' },
  { first_name: 'Shantila', phone: '' },
  { first_name: 'Prince Bro - Ashu', phone: '' },
  { first_name: 'Anastasia', phone: '' },
  { first_name: 'Edward', phone: '' },
  { first_name: 'Chidi', phone: '65552925' },
  { first_name: 'Ndukong Prisca', phone: '670954076' },
  { first_name: 'Rejoice', phone: '' },
  { first_name: 'Afor Nomenki', phone: '' },
  { first_name: 'Mother', phone: '' },
  { first_name: 'Celine', phone: '' },
  { first_name: 'Olivie', phone: '' },
  { first_name: 'Segoleine', phone: '' },
  { first_name: 'Godlove', phone: '' },
  { first_name: 'Enestein', phone: '' },
  { first_name: 'Mary Louise', phone: '' },
  { first_name: 'Evrard', phone: '' },
  { first_name: 'Winifred', phone: '' },
  { first_name: 'Princess', phone: '' },
  { first_name: 'Max', phone: '' },
  { first_name: 'Michelle', phone: '' },
  { first_name: 'Dworkingly', phone: '' },
  { first_name: 'Ashley smallville', phone: '' },
  { first_name: 'Brenda friend', phone: '672327399' },
  { first_name: 'Jessy', phone: '654171905' },
  { first_name: 'Ecknerd', phone: '' },
  { first_name: 'Fortune Ecole Public', phone: '' },
  { first_name: 'Audrey', phone: '' },
  { first_name: 'Ronald', phone: '' },
  { first_name: 'Brian', phone: '' },
  { first_name: 'Regime', phone: '' },
  { first_name: 'Senge', phone: '' },
  { first_name: 'Ange', phone: '' },
  { first_name: 'Prince Marcel', phone: '' },
  { first_name: 'Grace', phone: '' },
  { first_name: 'Gillian', phone: '' }
];

async function importYvetteJESMembers(yvetteId, areaId) {
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
          leader_id: yvetteId
        }
      });

      if (existingMember) {
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

  // Force all existing members of this leader to JES if they weren't already
  await Member.update(
    { service_type: 'JES' },
    { where: { leader_id: yvetteId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importYvetteJESMembers };
