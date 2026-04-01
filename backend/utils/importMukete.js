// backend/utils/importMukete.js
const { Member } = require('../models');

const membersData = [
  // GOAT
  { first_name: 'Endurance', last_name: '', phone: '652907101', state: 'Goat' },
  { first_name: 'Fritz', last_name: '', phone: '000000000', state: 'Goat' },
  { first_name: 'Hope', last_name: '', phone: '671805057', state: 'Goat' },

  // DEER
  { first_name: 'Glenda', last_name: '', phone: '680586097', state: 'Deer' },
  { first_name: 'Favour', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Marion', last_name: '', phone: '682602257', state: 'Deer' },
  { first_name: 'Samuel', last_name: '', phone: '682113362', state: 'Deer' },
  { first_name: 'Gracious', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Veronique', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Evenezer', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Stephanie', last_name: '', phone: '658018767', state: 'Deer' },
  { first_name: 'Ma', last_name: 'Dorothee', phone: '000000000', state: 'Deer' },
  { first_name: 'Gabriel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Marcel', last_name: '', phone: '680640595', state: 'Deer' },
  { first_name: 'Veroline', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Alice', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Rodrick', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Maeva', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Brian', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Ryan', last_name: '', phone: '696673160', state: 'Deer' },
  { first_name: 'Ulrich', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Sonia', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Tresor', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Dalin', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Frankline', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Leonnel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Beryl', last_name: '', phone: '671749071', phone2: '659054112', state: 'Deer' },
  { first_name: 'Kelly', last_name: '', phone: '671749071', phone2: '659054112', state: 'Deer' },
  { first_name: 'Fiona', last_name: '', phone: '671749071', phone2: '859054112', state: 'Deer' },
  { first_name: 'Faith', last_name: '', phone: '679154794', state: 'Deer' },
  { first_name: 'Papi', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Eda', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Kimbi', last_name: 'Godwill', phone: '676356853', state: 'Deer' },
  { first_name: 'Clovis', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Pekwaleke', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Godwill', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Titus', last_name: '', phone: '679720817', state: 'Deer' },
  { first_name: 'Destiny', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Rankin', last_name: '', phone: '698022423', state: 'Deer' },
  { first_name: 'Miracle', last_name: '', phone: '673132201', state: 'Deer' },
  { first_name: 'Blessing', last_name: '', phone: '673132201', state: 'Deer' },
  { first_name: 'Glarodis', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Gilead', last_name: '', phone: '686358867', state: 'Deer' },
  { first_name: 'Joy', last_name: '', phone: '673967190', state: 'Deer' },
  { first_name: 'Betty', last_name: '', phone: '659054112', state: 'Deer' },
  { first_name: 'Irene', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Helen', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Praise', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Karine', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Ange', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Salomon', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Therese', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Dickson', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Noah', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Abraham', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'David', last_name: '', phone: '000000000', state: 'Deer' },

  // LEADER
  { first_name: 'Mary', last_name: 'glory', phone: '677743506', phone2: '657466185', state: 'Sheep' },

  // DEER (sous LEADER)
  { first_name: 'Rhoda', last_name: '', phone: '671375239', state: 'Deer' },
  { first_name: 'Marie Claire', last_name: '', phone: '670615531', state: 'Deer' },
  { first_name: 'Blessing 2', last_name: '', phone: '650227368', state: 'Deer' },

  // LEADER
  { first_name: 'Florence', last_name: '', phone: '672933538', phone2: '683515175', state: 'Sheep' },

  // SHEEP
  { first_name: 'Paula', last_name: '', phone: '650050012', state: 'Sheep' },
  { first_name: 'Leena', last_name: '', phone: '652145500', state: 'Sheep' },
  { first_name: 'Godlove', last_name: '', phone: '671805057', state: 'Sheep' },
  { first_name: 'Lentina', last_name: '', phone: '672376761', state: 'Sheep' },
  { first_name: 'Nelson', last_name: '', phone: '670769237', state: 'Sheep' },

  // DEER (sous SHEEP)
  { first_name: 'Pauline', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Terry-Evan', last_name: '', phone: '680589562', phone2: '654089670', state: 'Deer' },
  { first_name: 'Blaise', last_name: '', phone: '671809864', state: 'Deer' },
  { first_name: 'Williane', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Endele', last_name: '', phone: '671704741', state: 'Deer' },
  { first_name: 'Naya', last_name: 'Glory', phone: '000000000', state: 'Deer' },
  { first_name: 'Mercy', last_name: '', phone: '000000000', state: 'Deer' },

  // FT
  { first_name: 'Parfait\'s', last_name: 'friend', phone: '000000000', state: 'Deer' },
  { first_name: 'Nicholas', last_name: '', phone: '000000000', state: 'Deer' }
];

async function importMuketeMembers(muketeId, areaId) {
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
        leader_id: muketeId,
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

module.exports = { importMuketeMembers };
