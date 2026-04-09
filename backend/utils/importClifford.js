const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Clitus', phone: '' },
  { first_name: 'Hansline', phone: '' },
  { first_name: 'Vanilla', phone: '' },
  { first_name: 'Solange', phone: '' },
  { first_name: 'Brenda', phone: '' },
  { first_name: 'Ramses', phone: '674652977' },
  { first_name: 'Consolant', phone: '' },
  { first_name: 'Mayor', phone: '' },
  { first_name: 'Liz', phone: '674227380' },
  { first_name: 'kelly Preciuos', phone: '651383979' },
  { first_name: 'alberto', phone: '' },
  { first_name: 'julienne', phone: '' },
  { first_name: 'charlote', phone: '' },
  { first_name: 'patricia', phone: '' },
  { first_name: 'amadou', phone: '' },
  { first_name: 'pascal', phone: '' },
  { first_name: 'precious', phone: '' },
  { first_name: 'caxton', phone: '' },
  { first_name: 'prince', phone: '' },
  { first_name: 'noelle', phone: '' },
  { first_name: 'steve', phone: '' },
  { first_name: 'Emmanuel', phone: '' },
  { first_name: 'freddy', phone: '' },
  { first_name: 'stacy', phone: '' },
  { first_name: 'mathias', phone: '' },
  { first_name: 'wemba', phone: '' },
  { first_name: 'cortez', phone: '' },
  { first_name: 'clarance', phone: '' },
  { first_name: 'raphael', phone: '' },
  { first_name: 'elvira', phone: '' },
  { first_name: 'penelope', phone: '' },
  { first_name: 'Esther', phone: '' },
  { first_name: 'Narada ft', phone: '786575432' },
  { first_name: 'Eposi ft', phone: '' },
  { first_name: 'Mama Huguet', phone: '' },
  { first_name: 'Audrey\'s friend', phone: '' },
  { first_name: 'Claudia', phone: '' },
  { first_name: 'Pamela', phone: '680081726' },
  { first_name: 'Fabiola', phone: '' },
  { first_name: 'Daniel', phone: '657351086' },
  { first_name: 'Daniel\'s friend', phone: '' },
  { first_name: 'William\'s friend', phone: '' },
  { first_name: 'Paul ft', phone: '' },
  { first_name: 'Junior', phone: '' },
  { first_name: 'Papa ft', phone: '' },
  { first_name: 'Justine', phone: '' },
  { first_name: 'Louis', phone: '' },
  { first_name: 'Louis brother ft', phone: '' },
  { first_name: 'Gracious ft', phone: '' },
  { first_name: 'Ama ft', phone: '' },
  { first_name: 'Abigail ft', phone: '' },
  { first_name: 'Myriam ft', phone: '' },
  { first_name: 'New soul ft', phone: '' },
  { first_name: 'Marie ft', phone: '651041717' },
  { first_name: 'Naomi\'s mother ft', phone: '' },
  { first_name: 'Melvis', phone: '673521997' },
  { first_name: 'New soul ft 2', phone: '' },
  { first_name: 'Mama Solange', phone: '651291432' },
  { first_name: 'Rose', phone: '679381701' },
  { first_name: 'Rodney', phone: '' },
  { first_name: 'Edmond', phone: '' },
  { first_name: 'Emile', phone: '' },
  { first_name: 'Gaby', phone: '' },
  { first_name: 'Jules', phone: '' }
];

async function importCliffordMembers(cliffordId, areaId) {
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
          leader_id: cliffordId
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
          leader_id: cliffordId,
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

  // Fallback: update ALL of Clifford's existing members to GES
  await Member.update(
    { service_type: 'GES' },
    { where: { leader_id: cliffordId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importCliffordMembers };
