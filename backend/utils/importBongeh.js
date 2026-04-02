const { Member } = require('../models');

const membersData = [
  // SHEEP
  { first_name: 'Junior', phone: '673473165', state: 'Sheep' },
  { first_name: 'Dailitin', phone: '000000000', state: 'Sheep' },
  { first_name: 'Delphine', phone: '652939595', state: 'Sheep' },
  { first_name: 'Nathan', phone: '000000000', state: 'Sheep' },
  { first_name: 'Mr Joseph', phone: '673074728', state: 'Sheep' },
  
  // GOAT
  { first_name: 'Motale', phone: '000000000', state: 'Goat' },
  { first_name: 'Jackson', phone: '000000000', state: 'Goat' },

  // DEER (and mapped first timers, etc)
  { first_name: 'Gael', phone: '000000000', state: 'Deer' },
  { first_name: 'Erica', phone: '000000000', state: 'Deer' },
  { first_name: 'Muriel', phone: '000000000', state: 'Deer' },
  { first_name: 'Michael', phone: '659259596', state: 'Deer' },
  { first_name: 'Marie', phone: '686469356', state: 'Deer' },
  { first_name: 'Cathy', phone: '000000000', state: 'Deer' },
  { first_name: 'Wyclef', phone: '000000000', state: 'Deer' },
  { first_name: 'Dailitin 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Seraphine', phone: '000000000', state: 'Deer' },
  { first_name: 'Nelly', phone: '000000000', state: 'Deer' },
  { first_name: 'Theophile', phone: '000000000', state: 'Deer' },
  { first_name: 'Claudia', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandrine', phone: '000000000', state: 'Deer' },
  { first_name: 'Mireille', phone: '656027501', state: 'Deer' },
  { first_name: 'Mama Mireille', phone: '000000000', state: 'Deer' },
  { first_name: 'Mayantal', phone: '000000000', state: 'Deer' },
  { first_name: 'Murane', phone: '000000000', state: 'Deer' },
  { first_name: 'Kingsley', phone: '000000000', state: 'Deer' },
  { first_name: 'Daniel', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandra', phone: '000000000', state: 'Deer' },
  { first_name: 'Gaston', phone: '000000000', state: 'Deer' },
  { first_name: 'Godwil', phone: '000000000', state: 'Deer' },
  { first_name: 'Jean', phone: '695347072', state: 'Deer' },
  { first_name: 'Afanui', phone: '000000000', state: 'Deer' },
  { first_name: 'Precious', phone: '687291948', state: 'Deer' },
  { first_name: 'Parfait', phone: '000000000', state: 'Deer' },

  // FIRST TIMERS
  { first_name: 'Myriam', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior Debo', phone: '000000000', state: 'Deer' },
  { first_name: 'Rose', phone: '654962453', state: 'Deer' },
  { first_name: 'Favor', phone: '000000000', state: 'Deer' },
  { first_name: 'Estelle', phone: '680718692', state: 'Deer' },
  { first_name: 'Kevin', phone: '693236766', state: 'Deer' },
  { first_name: 'Marielle', phone: '000000000', state: 'Deer' },
  { first_name: 'Leticia', phone: '000000000', state: 'Deer' },
  { first_name: 'Xila', phone: '000000000', state: 'Deer' },
  { first_name: 'Cipren', phone: '000000000', state: 'Deer' },
  { first_name: 'Brandon', phone: '000000000', state: 'Deer' },
  { first_name: 'Claret', phone: '000000000', state: 'Deer' },

  { first_name: 'Marielle 2', phone: '000000000', state: 'Deer' },

  { first_name: 'Favour', phone: '000000000', state: 'Deer' },
  { first_name: 'Tracey', phone: '000000000', state: 'Deer' },
  { first_name: 'Gracious', phone: '000000000', state: 'Deer' },
  { first_name: 'Brendaline', phone: '000000000', state: 'Deer' },
  { first_name: 'Timothee', phone: '000000000', state: 'Deer' },
  { first_name: 'Ismael', phone: '000000000', state: 'Deer' },
  { first_name: 'Grace', phone: '000000000', state: 'Deer' },

  { first_name: 'Miguel', phone: '000000000', state: 'Deer' },
  { first_name: 'Miguel 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Jores', phone: '000000000', state: 'Deer' },
  { first_name: 'Ivon', phone: '000000000', state: 'Deer' },

  { first_name: 'Brayan', phone: '693724534', state: 'Deer' },

  { first_name: 'Small Brayan', phone: '696896381', state: 'Deer' },
  { first_name: 'Miguel Moumi', phone: '000000000', state: 'Deer' },
  { first_name: 'Yannick ft', phone: '000000000', state: 'Deer' },
  { first_name: 'Dyland ft', phone: '000000000', state: 'Deer' },
  { first_name: 'Mr Mbah', phone: '000000000', state: 'Deer' },
  { first_name: 'Grace Ft', phone: '000000000', state: 'Deer' },
  { first_name: 'Michael Ft', phone: '000000000', state: 'Deer' },
  { first_name: 'Morel Ft', phone: '000000000', state: 'Deer' },
  { first_name: 'Kevine', phone: '693236766', state: 'Deer' },
  { first_name: 'Precious 2', phone: '680895875', state: 'Deer' },
  { first_name: 'Jeannot', phone: '655374221', state: 'Deer' },
  { first_name: 'Gaston 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Mariane Lesly', phone: '000000000', state: 'Deer' }
];

async function importBongehMembers(bongehId, areaId) {
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
        leader_id: bongehId,
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

module.exports = { importBongehMembers };
