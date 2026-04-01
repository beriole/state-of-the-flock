// backend/utils/importDaline.js
const { Member } = require('../models');

const membersData = [
  // SHEEP
  { first_name: 'Cindy', phone: '678011620', state: 'Sheep' },
  { first_name: 'Clara', phone: '678686733', state: 'Sheep' },
  { first_name: 'Yannick', phone: '671113848', state: 'Sheep' },
  { first_name: 'Rovel', phone: '671113848', phone2: '680505673', state: 'Sheep' },
  { first_name: 'Amstrong', phone: '676930013', state: 'Sheep' },
  { first_name: 'Alfred', phone: '000000000', state: 'Sheep' },
  { first_name: 'Gwendolyn', phone: '678314103', state: 'Sheep' },
  { first_name: 'Favor', phone: '000000000', state: 'Sheep' },
  { first_name: 'Jules', phone: '000000000', state: 'Sheep' },
  { first_name: 'Noel', phone: '678548398', state: 'Sheep' },

  // GOAT (Group 2)
  { first_name: 'Evans', phone: '000000000', state: 'Goat' },
  { first_name: 'Cinthia', phone: '000000000', state: 'Goat' },
  { first_name: 'Carison', phone: '000000000', state: 'Goat' },
  { first_name: 'Junior (Sweety)', phone: '000000000', state: 'Goat' },
  { first_name: 'Jeff', phone: '000000000', state: 'Goat' },
  { first_name: 'Cedric', phone: '000000000', state: 'Goat' },
  { first_name: 'Praise', phone: '000000000', state: 'Goat' },
  { first_name: 'Andres', phone: '000000000', state: 'Goat' },
  { first_name: 'Valerie', phone: '691610327', state: 'Goat' },
  { first_name: 'Joel', phone: '000000000', state: 'Goat' },
  { first_name: 'Prisca', phone: '000000000', state: 'Goat' },
  { first_name: 'Sonia', phone: '000000000', state: 'Goat' },
  { first_name: 'Sandra', phone: '000000000', state: 'Goat' },

  // GOAT (Group 5)
  { first_name: 'Michael', phone: '697083233', state: 'Goat' },
  { first_name: 'Hilla', phone: '652030955', state: 'Goat' },
  { first_name: 'Vincent', phone: '000000000', state: 'Goat' },
  { first_name: 'miguel', phone: '000000000', state: 'Goat' },
  { first_name: 'Pierre', phone: '653682216', state: 'Goat' },
  { first_name: 'Dieudonne', phone: '000000000', state: 'Goat' },

  // GOAT (Group 6)
  { first_name: 'Carlson', phone: '653975374', state: 'Goat' },
  { first_name: 'Maarga', phone: '000000000', state: 'Goat' },
  { first_name: 'Cedric 2', phone: '651430874', state: 'Goat' },
  { first_name: 'Rene', phone: '000000000', state: 'Goat' },
  { first_name: 'John', phone: '678683258', state: 'Goat' },
  { first_name: 'praise 2', phone: '681167102', state: 'Goat' },
  { first_name: 'Bouba', phone: '000000000', state: 'Goat' },
  { first_name: 'Alfred 2', phone: '676609753', state: 'Goat' },
  { first_name: 'tony', phone: '000000000', state: 'Goat' },
  { first_name: 'Valerie 2', phone: '691610327', state: 'Goat' },
  { first_name: 'Viviane', phone: '000000000', state: 'Goat' },
  { first_name: 'Kasoandria', phone: '000000000', state: 'Goat' },

  // DEER (Group 3)
  { first_name: 'Cedric\'s Sister', phone: '000000000', state: 'Deer' },
  { first_name: 'Fred', phone: '000000000', state: 'Deer' },
  { first_name: 'Amasiah', phone: '000000000', state: 'Deer' },
  { first_name: 'Manga', phone: '000000000', state: 'Deer' },
  { first_name: 'Olivier', phone: '000000000', state: 'Deer' },
  { first_name: 'Oceane', phone: '000000000', state: 'Deer' },
  { first_name: 'Oscar', phone: '000000000', state: 'Deer' },
  { first_name: 'Joy', phone: '000000000', state: 'Deer' },
  { first_name: 'Willifred', phone: '000000000', state: 'Deer' },
  { first_name: 'Criniel', phone: '000000000', state: 'Deer' },
  { first_name: 'John 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Janne', phone: '000000000', state: 'Deer' },
  { first_name: 'Cyril', phone: '680641855', state: 'Deer' },
  { first_name: 'Joseph', phone: '693397342', state: 'Deer' },
  { first_name: 'Joseph\'s sister', phone: '000000000', state: 'Deer' },
  { first_name: 'Nina', phone: '000000000', state: 'Deer' },
  { first_name: 'Liliane', phone: '000000000', state: 'Deer' },
  { first_name: 'Jordan', phone: '000000000', state: 'Deer' },
  { first_name: 'Romaric', phone: '000000000', state: 'Deer' },
  { first_name: 'Jospeh 2', phone: '697967233', state: 'Deer' },
  { first_name: 'Julien', phone: '673518077', state: 'Deer' },
  { first_name: 'Joseph 3', phone: '688037501', state: 'Deer' },
  { first_name: 'Ortance', phone: '000000000', state: 'Deer' },
  { first_name: 'Carista', phone: '000000000', state: 'Deer' },
  { first_name: 'Olivera', phone: '000000000', state: 'Deer' },
  { first_name: 'Herman', phone: '000000000', state: 'Deer' },
  { first_name: 'Richard', phone: '000000000', state: 'Deer' },

  // DEER (First Time)
  { first_name: 'Missora Williams', phone: '640353500', state: 'Deer' },
  { first_name: 'Mundeng', phone: '671770638', state: 'Deer' },
  { first_name: 'Lawrence', phone: '654937357', state: 'Deer' },
  { first_name: 'Ivana', phone: '680043844', state: 'Deer' },
  { first_name: 'Ruth', phone: '000000000', state: 'Deer' },
  { first_name: 'Rochelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Mystère', phone: '000000000', state: 'Deer' },
  { first_name: 'Cassy', phone: '000000000', state: 'Deer' },
  { first_name: 'John 3', phone: '000000000', state: 'Deer' },
  { first_name: 'Chalinse', phone: '000000000', state: 'Deer' },
  { first_name: 'Emmanuel', phone: '000000000', state: 'Deer' },
  { first_name: 'Salvation', phone: '000000000', state: 'Deer' },
  { first_name: 'Joseph Donald', phone: '694527976', state: 'Deer' },
  { first_name: 'Sonia (with Joseph 2)', phone: '000000000', state: 'Deer' },
  { first_name: 'Wilfried (with Joseph 2)', phone: '000000000', state: 'Deer' },
  { first_name: 'Bernard (with Joseph 2)', phone: '000000000', state: 'Deer' },
  { first_name: 'Job', phone: '656015405', state: 'Deer' },
  { first_name: 'Samuel', phone: '693975448', state: 'Deer' },
  { first_name: 'Emmanuel bro', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior', phone: '656056573', state: 'Deer' },
  { first_name: 'Mark Brain', phone: '677351928', state: 'Deer' },
  { first_name: 'Chris', phone: '679344432', state: 'Deer' },
  { first_name: 'Wilfried 2', phone: '695758070', state: 'Deer' },
  { first_name: 'Edmond', phone: '674787094', state: 'Deer' },
  { first_name: 'Rolex', phone: '673318801', state: 'Deer' },
  { first_name: 'Arthur', phone: '657352766', state: 'Deer' },
  { first_name: 'Akono', phone: '680228432', state: 'Deer' },
  { first_name: 'Carine', phone: '674903567', state: 'Deer' },
  { first_name: 'Emreline', phone: '000000000', state: 'Deer' },
  { first_name: 'Loveline', phone: '670996146', state: 'Deer' },
  { first_name: 'Gandi', phone: '657158515', state: 'Deer' },
  { first_name: 'Emile', phone: '656641444', state: 'Deer' },
  { first_name: 'Miguel (with Otri)', phone: '000000000', state: 'Deer' },
  { first_name: 'Oliver', phone: '000000000', state: 'Deer' },
  { first_name: 'placide', phone: '691275153', state: 'Deer' },
  { first_name: 'Eugene SHUMBE', phone: '679208011', state: 'Deer' },
  { first_name: 'Amande', phone: '000000000', state: 'Deer' },
  { first_name: 'Zita', phone: '670680746', state: 'Deer' },
  { first_name: 'Glory (with Zita)', phone: '000000000', state: 'Deer' },
  { first_name: 'Kameni', phone: '691785827', state: 'Deer' },
  { first_name: 'Noel\'s uncle with Noel', phone: '000000000', state: 'Deer' },
  { first_name: 'Nyemec', phone: '694527976', state: 'Deer' },
  { first_name: 'Kamil', phone: '691960799', state: 'Deer' },
  { first_name: 'Aderiju', phone: '697003233', state: 'Deer' },
  { first_name: 'Juliette', phone: '000000000', state: 'Deer' },
  { first_name: 'Kewan', phone: '000000000', state: 'Deer' },
  { first_name: 'Yvette', phone: '000000000', state: 'Deer' },
  { first_name: 'Maguy', phone: '000000000', state: 'Deer' }
];

async function importDalineMembers(dalineId, areaId) {
  let imported = 0;
  let skipped = 0;

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: 'Inconnu',
        phone_primary: m.phone,
        phone_secondary: m.phone2 || null,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: dalineId,
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

module.exports = { importDalineMembers };
