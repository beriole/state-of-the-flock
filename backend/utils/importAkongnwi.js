// backend/utils/importAkongnwi.js
const { Member } = require('../models');

const membersData = [
  // Sheep (General)
  { first_name: 'Daniella', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Manuella', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ma', last_name: 'Rosalie', phone: '000000000', state: 'Sheep' },
  { first_name: 'Bertin', last_name: '', phone: '698220492', state: 'Sheep' },
  { first_name: 'Destiny', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Joël', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Dylan', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Esther', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Henry', last_name: '', phone: '676777937', state: 'Sheep' },
  { first_name: 'Ntantan', last_name: '', phone: '678764410', state: 'Sheep' },
  { first_name: 'Emmanuel', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Jean', last_name: 'de Dieu', phone: '676178453', phone2: '690170897', state: 'Sheep' },
  { first_name: 'Leonel', last_name: '', phone: '697356056', state: 'Sheep' },
  { first_name: 'Raoul', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Costa', last_name: '', phone: '692518585', state: 'Sheep' },
  { first_name: 'Russel', last_name: '', phone: '655988098', state: 'Sheep' },
  { first_name: 'Herve', last_name: '', phone: '672918607', state: 'Sheep' },
  { first_name: 'Winifred', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Bryan', last_name: '', phone: '000000000', state: 'Sheep' },

  // Deer
  { first_name: 'Jude', last_name: '', phone: '652057333', state: 'Deer' },
  { first_name: 'Miguel', last_name: '', phone: '688060894', state: 'Deer' },
  { first_name: 'Steve', last_name: '', phone: '659456549', state: 'Deer' },
  { first_name: 'Blaise', last_name: '', phone: '653907277', phone2: '651289110', state: 'Deer' },
  { first_name: 'Marie', last_name: '', phone: '659402181', state: 'Deer' },
  { first_name: 'Marie\'s', last_name: 'Hubby', phone: '000000000', state: 'Deer' },
  { first_name: 'Durand', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Gaetan', last_name: '', phone: '672430392', state: 'Deer' },
  { first_name: 'Brandon', last_name: '', phone: '691084139', state: 'Deer' },
  { first_name: 'Francis', last_name: '', phone: '692396906', phone2: '679489729', state: 'Deer' },
  { first_name: 'Brice', last_name: '', phone: '671655231', state: 'Deer' },
  { first_name: 'Judith', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Richnelle', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Manguina', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Eddy', last_name: '', phone: '677514507', state: 'Deer' },
  { first_name: 'Patrick', last_name: '', phone: '686223956', state: 'Deer' },
  { first_name: 'Frank', last_name: '', phone: '693155925', state: 'Deer' },
  { first_name: 'Ellen', last_name: '', phone: '653350845', state: 'Deer' },
  { first_name: 'Abigael', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Rita', last_name: '', phone: '672890465', state: 'Deer' },
  { first_name: 'Maxwell', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Augustine', last_name: '', phone: '675942358', state: 'Deer' },
  { first_name: 'Daniel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Success', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Brenda', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Brice', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Ambe', last_name: '', phone: '654429510', state: 'Deer' },
  { first_name: 'Excel', last_name: '', phone: '000000000', state: 'Deer' }
];

async function importAkongnwiMembers(akongnwiId, areaId) {
  let imported = 0;
  let skipped = 0;

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: m.last_name || 'Inconnu',
        phone_primary: m.phone,
        phone_secondary: m.phone2 || null,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: akongnwiId,
        is_active: true
      });
      imported++;
    } catch (error) {
      console.error(`Error importing ${m.first_name}:`, error.message);
      skipped++;
    }
  }

  return { imported, skipped, total: membersData.length };
}

module.exports = { importAkongnwiMembers };
