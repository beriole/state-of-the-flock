const { Member } = require('../models');

const membersData = [
  { first_name: 'lumiere', phone: '674624243', state: 'Deer' },
  { first_name: 'ma martha', phone: '698531238', state: 'Deer' },
  { first_name: 'ma Miriam', phone: '000000000', state: 'Deer' },
  { first_name: 'Joseph Choco', phone: '655761448', state: 'Deer' },
  { first_name: 'Misericorde', phone: '000000000', state: 'Deer' },
  { first_name: 'Vicky Mvogo', phone: '656952728', state: 'Deer' },
  { first_name: 'Evouna', phone: '000000000', state: 'Deer' },
  { first_name: 'Gamaris', phone: '651560915', state: 'Deer' },
  { first_name: 'Florine', phone: '681748688', state: 'Deer' },
  { first_name: 'Grace', phone: '658952695', state: 'Deer' },
  { first_name: 'Teo', phone: '000000000', state: 'Deer' },
  { first_name: 'Neh', phone: '000000000', state: 'Deer' },
  { first_name: 'Blessing', phone: '682908407', state: 'Deer' },
  { first_name: 'Jean', phone: '000000000', state: 'Deer' },
  { first_name: 'Jeremy', phone: '695254121', state: 'Deer' },
  { first_name: 'Florine 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Ted', phone: '659080586', state: 'Deer' },
  { first_name: 'Ezekiel', phone: '693037091', state: 'Deer' },
  { first_name: 'Mael', phone: '689215084', state: 'Deer' },
  { first_name: 'John Tabe', phone: '652521288', state: 'Deer' },
  { first_name: 'Caroline', phone: '000000000', state: 'Deer' },
  { first_name: 'Giselle', phone: '000000000', state: 'Deer' },
  { first_name: 'Chico', phone: '000000000', state: 'Deer' },
  { first_name: 'Kenra', phone: '000000000', state: 'Deer' },
  { first_name: 'Arnold', phone: '000000000', state: 'Deer' },
  { first_name: 'Bons', phone: '000000000', state: 'Deer' }
];

async function importMercedesMembers(mercedesId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Gouverneur n a pas de area_id (zone) assignée. Impossible de créer des membres.' };
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
        leader_id: mercedesId,
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

module.exports = { importMercedesMembers };
