const { Member } = require('../models');

const membersData = [
  { first_name: 'Wanji Edel', phone: '000000000', state: 'Deer' },
  { first_name: "Marco's neighbour", phone: '000000000', state: 'Deer' },
  { first_name: 'Comfort', phone: '000000000', state: 'Deer' },
  { first_name: 'Blessing', phone: '000000000', state: 'Deer' },
  { first_name: 'Juliet', phone: '673345130', state: 'Deer' },
  { first_name: 'Noela', phone: '670861329', state: 'Deer' },
  { first_name: 'Pamela', phone: '000000000', state: 'Deer' },

  { first_name: 'Rostanie', phone: '000000000', state: 'Goat' },
  { first_name: 'Sheila', phone: '682053889', state: 'Goat' },
  { first_name: 'Madam Tabi', phone: '000000000', state: 'Goat' },
  { first_name: 'Frances', phone: '000000000', state: 'Goat' },
  { first_name: 'Joyce', phone: '000000000', state: 'Goat' }
];

async function importMarcoMembers(marcoId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Gouverneur n a pas de area_id (zone) assignée. Impossible de créer des membres.' };
  }

  // Delete all existing members for Marco
  try {
    const deletedCount = await Member.destroy({ where: { leader_id: marcoId } });
    console.log(`Deleted ${deletedCount} existing members for Marco.`);
  } catch (err) {
    return { error: 'Erreur lors de la suppression des anciens membres: ' + err.message };
  }

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: 'Inconnu',
        phone_primary: m.phone,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: marcoId,
        is_active: true
      });
      imported++;
    } catch (error) {
      console.error(`Error importing ${m.first_name}:`, error.message);
      if (errors.length < 5) {
        errors.push(`${m.first_name}: ${error.message}`);
      }
      skipped++;
    }
  }
  return { imported, skipped, total: membersData.length, errors };
}

module.exports = { importMarcoMembers };
