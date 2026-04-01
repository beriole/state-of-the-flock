// backend/utils/importClovis.js
const { Member } = require('../models');

const membersData = [
  // SHEEP
  { first_name: 'Thomas', last_name: '', phone: '655867924', state: 'Sheep' },
  { first_name: 'Mr', last_name: 'Mba', phone: '677215394', state: 'Sheep' },
  { first_name: 'Gracious', last_name: '', phone: '677215394', state: 'Sheep' },
  { first_name: 'favor', last_name: '', phone: '677215394', state: 'Sheep' },
  { first_name: 'Mrs', last_name: 'MBA', phone: '677427370', state: 'Sheep' },
  { first_name: 'Kelvin', last_name: '', phone: '653618814', state: 'Sheep' },
  { first_name: 'Nadia', last_name: '', phone: '658411340', state: 'Sheep' },
  { first_name: 'Marco', last_name: '', phone: '677573178', state: 'Sheep' },
  { first_name: 'Blessing', last_name: 'mbah', phone: '682193741', state: 'Sheep' },
  { first_name: 'Blessing', last_name: 'Wanji', phone: '673345130', state: 'Sheep' },
  { first_name: 'Christel', last_name: 'Ngambe', phone: '655368082', state: 'Sheep' },
  { first_name: 'Carine', last_name: 'Ngambe', phone: '675212436', state: 'Sheep' },
  { first_name: 'Gabi', last_name: 'Ngambe', phone: '670285519', state: 'Sheep' },
  { first_name: 'Junior', last_name: '', phone: '680659299', state: 'Sheep' },
  { first_name: 'Stella', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Megan', last_name: '', phone: '695305812', state: 'Sheep' },
  { first_name: 'Tatiana', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Stella\'s', last_name: 'sister 1', phone: '000000000', state: 'Sheep' },
  { first_name: 'Stella\'s', last_name: 'sister 2', phone: '000000000', state: 'Sheep' },
  { first_name: 'Marco\'s', last_name: 'neighbour', phone: '000000000', state: 'Sheep' },

  // GOAT
  { first_name: 'Alexiouna', last_name: '', phone: '652687159', state: 'Goat' },
  { first_name: 'Precious', last_name: '', phone: '000000000', state: 'Goat' },
  { first_name: 'Davina', last_name: '', phone: '698344499', state: 'Goat' },
  { first_name: 'Emmanuel', last_name: '', phone: '000000000', state: 'Goat' },
  { first_name: 'Jackie', last_name: 'Linda', phone: '692573793', state: 'Goat' },
  { first_name: 'Franklin', last_name: '', phone: '698350568', state: 'Goat' },
  { first_name: 'Leonard', last_name: 'ft', phone: '000000000', state: 'Goat' },
  { first_name: 'Junior', last_name: '2', phone: '659988225', state: 'Goat' },

  // DEER
  { first_name: 'Franklin\'s', last_name: 'Sister', phone: '000000000', state: 'Deer' },
  { first_name: 'Jerry', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Jeff', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Bryan', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Wina', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Lesley', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Doris', last_name: '', phone: '000000000', state: 'Deer' },

  // FT (Deer)
  { first_name: 'chalie', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Charlie\'s', last_name: 'friend 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Charlie\'s', last_name: 'friend 1', phone: '000000000', state: 'Deer' },
  { first_name: 'Kendrick', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'franklins', last_name: 'friend', phone: '000000000', state: 'Deer' },
  { first_name: 'sarah', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Naomi', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Naomi\'s', last_name: 'daughter', phone: '000000000', state: 'Deer' },
  { first_name: 'Ines', last_name: '', phone: '695305812', state: 'Deer' },
  { first_name: 'Willibroad', last_name: '', phone: '677568270', state: 'Deer' },
  { first_name: 'Jonathan', last_name: '', phone: '000000000', state: 'Deer' },

  // LEADER SHEEP (Sheep)
  { first_name: 'Juliet', last_name: '', phone: '673345130', state: 'Sheep' },
  { first_name: 'Carine', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Pedro', last_name: '', phone: '680659299', state: 'Sheep' },
  { first_name: 'Christy', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Mrs', last_name: 'Awah', phone: '675972629', state: 'Sheep' },
  { first_name: 'Noela', last_name: '', phone: '670861329', state: 'Sheep' },
  { first_name: 'Cara', last_name: '', phone: '675972629', state: 'Sheep' },

  // GOAT
  { first_name: 'Christian', last_name: '', phone: '000000000', state: 'Goat' },
  { first_name: 'Lovellan', last_name: '', phone: '680659299', state: 'Goat' },
  { first_name: 'Edel', last_name: 'Paulin', phone: '000000000', state: 'Goat' },
  { first_name: 'Sharon', last_name: '', phone: '000000000', state: 'Goat' },

  // DEER (and uncategorized)
  { first_name: 'Christy\'s', last_name: 'Sister', phone: '655368082', state: 'Deer' },
  { first_name: 'Sylvia', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Stella', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Woman', last_name: 'from AC', phone: '000000000', state: 'Deer' },
  { first_name: 'Nadege', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Bertin', last_name: '', phone: '672475318', state: 'Deer' },
  { first_name: 'Ocean', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandra', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Kingsley', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Blossom', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Eugene', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Vitalise', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Smith', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Mme', last_name: 'Chancia', phone: '000000000', state: 'Deer' },
  { first_name: 'Wendy', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Wendy\'s', last_name: 'sister', phone: '000000000', state: 'Deer' },
  { first_name: 'Vedict', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Glory', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Ariel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Zubby', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Severen', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Boris', last_name: '', phone: '671810135', state: 'Deer' },
  { first_name: 'Nadia', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Michael', last_name: '', phone: '676849989', state: 'Deer' },
  { first_name: 'Oceyan', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Levis', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Joel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Winner', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Kelly', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Lewis', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Clevious', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Clara', last_name: '', phone: '000000000', state: 'Deer' }
];

async function importClovisMembers(clovisId, areaId) {
  let imported = 0;
  let skipped = 0;

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: m.last_name || 'Inconnu',
        phone_primary: m.phone,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: clovisId,
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

module.exports = { importClovisMembers };
