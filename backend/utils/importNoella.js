// backend/utils/importNoella.js
const { Member } = require('../models');

const membersData = [
  // GÉNÉRAL (Sheep)
  { first_name: 'Elias', last_name: '', phone: '681485051', state: 'Sheep' },
  { first_name: 'Shekina', last_name: '', phone: '674070299', state: 'Sheep' },
  { first_name: 'Leaticia', last_name: '', phone: '695692007', state: 'Sheep' },
  { first_name: 'Daniella', last_name: '', phone: '694602705', state: 'Sheep' },
  { first_name: 'Nana', last_name: 'Eliane', phone: '673628687', state: 'Sheep' },

  // DEER (Deer)
  { first_name: 'Phino', last_name: '', phone: '678736904', state: 'Deer' },
  { first_name: 'Blaise', last_name: '', phone: '651270710', state: 'Deer' },
  { first_name: 'Cherif', last_name: '', phone: '687735920', state: 'Deer' },
  { first_name: 'Alisane', last_name: '', phone: '687735920', state: 'Deer' },
  { first_name: 'Gracious', last_name: '', phone: '654723766', state: 'Deer' },
  { first_name: 'Bless', last_name: '', phone: '672310103', state: 'Deer' },
  { first_name: 'Gisèle', last_name: '', phone: '673724123', state: 'Deer' },
  { first_name: 'Romario', last_name: '', phone: '640183556', state: 'Deer' },
  { first_name: 'Roline', last_name: '', phone: '621070905', state: 'Deer' },
  { first_name: 'Astro', last_name: '', phone: '677636330', state: 'Deer' },
  { first_name: 'Sonia', last_name: '', phone: '672152938', state: 'Deer' },
  { first_name: 'Frank', last_name: '', phone: '692630373', state: 'Deer' },

  // LEADER (Sheep)
  { first_name: 'Fon', last_name: 'Rodrigue', phone: '682391327', state: 'Sheep' },

  // FIRST TIMERS / FTs (Deer)
  { first_name: 'Ismail', last_name: '', phone: '657354888', state: 'Deer' },
  { first_name: 'Prince', last_name: '', phone: '682289242', state: 'Deer' },
  { first_name: 'Kiki', last_name: '', phone: '679289198', state: 'Deer' },
  { first_name: 'Jude', last_name: '', phone: '654476567', state: 'Deer' },
  { first_name: 'Paola', last_name: '', phone: '692999231', state: 'Deer' },
  { first_name: 'Vinichous', last_name: '', phone: '653236669', state: 'Deer' },
  { first_name: 'Noela', last_name: '', phone: '683064656', state: 'Deer' },
  { first_name: 'Diland', last_name: '', phone: '692820766', state: 'Deer' },
  { first_name: 'Catherine', last_name: '', phone: '676529976', state: 'Deer' },
  { first_name: 'Dylan', last_name: 'Wamba', phone: '652041404', state: 'Deer' },
  { first_name: 'Erica', last_name: '', phone: '698215987', state: 'Deer' },
  { first_name: 'Desco', last_name: '', phone: '677926255', state: 'Deer' },
  { first_name: 'Ryan', last_name: '', phone: '692701692', state: 'Deer' },
  { first_name: 'Maxi', last_name: '', phone: '653538460', state: 'Deer' },
  { first_name: 'John', last_name: '', phone: '689255396', state: 'Deer' },
  { first_name: 'Serge', last_name: '', phone: '678115853', state: 'Deer' },
  { first_name: 'Marc', last_name: 'Donalds', phone: '675168643', state: 'Deer' },
  { first_name: 'Gracious', last_name: '', phone: '650142916', state: 'Deer' },
  { first_name: 'Harrison', last_name: '', phone: '672902261', state: 'Deer' },
  { first_name: 'Ceavious', last_name: 'Amungwa', phone: '682065745', state: 'Deer' },
  { first_name: 'Glory', last_name: '', phone: '678533237', state: 'Deer' },
  { first_name: 'Willy', last_name: '', phone: '674788992', state: 'Deer' },
  { first_name: 'Destiny', last_name: '', phone: '653853722', state: 'Deer' },
  { first_name: 'Alex', last_name: '', phone: '672888868', state: 'Deer' },
  { first_name: 'Lilian', last_name: '', phone: '681312326', state: 'Deer' },
  { first_name: 'Patrick', last_name: '', phone: '682180504', state: 'Deer' },
  { first_name: 'Bryan', last_name: 'Junior', phone: '678481562', state: 'Deer' },
  { first_name: 'Mr', last_name: 'Peter', phone: '670876625', state: 'Deer' },
  { first_name: 'Mario', last_name: '', phone: '680930364', state: 'Deer' },
  { first_name: 'Antony', last_name: '', phone: '683513900', state: 'Deer' },
  { first_name: 'Lisa', last_name: '', phone: '674821925', state: 'Deer' },
  { first_name: 'Herman', last_name: '', phone: '698564918', state: 'Deer' },
  { first_name: 'Pauline', last_name: '', phone: '655431443', state: 'Deer' },
  { first_name: 'Paul', last_name: '', phone: '695109965', state: 'Deer' },
  { first_name: 'Ornella', last_name: '', phone: '686927789', state: 'Deer' },
  { first_name: 'Jean', last_name: '', phone: '657307151', state: 'Deer' },
  { first_name: 'Joseph', last_name: '', phone: '656173932', state: 'Deer' },
  { first_name: 'Uncle', last_name: 'Michael', phone: '673108831', state: 'Deer' },
  { first_name: 'Kelvin', last_name: '', phone: '696057542', state: 'Deer' },
  { first_name: 'Clinton', last_name: '', phone: '683082429', state: 'Deer' },
  { first_name: 'Clifford', last_name: '', phone: '676717837', state: 'Deer' },

  // AUTRES (Sheep)
  { first_name: 'Joy', last_name: '', phone: '674855923', state: 'Sheep' },
  { first_name: 'Bryan', last_name: '', phone: '673746553', state: 'Sheep' },
  { first_name: 'Lauress', last_name: '', phone: '675113731', state: 'Sheep' },
  { first_name: 'Joasquine', last_name: '', phone: '695621831', state: 'Sheep' },
  { first_name: 'Desmond', last_name: '', phone: '676851067', state: 'Sheep' },
  { first_name: 'Arthur', last_name: '', phone: '655076508', state: 'Sheep' },
  { first_name: 'Boris', last_name: '', phone: '697263559', state: 'Sheep' },
  { first_name: 'Arthur 2', last_name: '', phone: '695863626', state: 'Sheep' },
  { first_name: 'Chantal', last_name: '', phone: '679927727', state: 'Sheep' },
  { first_name: 'Yvonne', last_name: '', phone: '682693335', state: 'Sheep' },

  // SHEEP / DEER (fin)
  { first_name: 'Shekina', last_name: 'Ndi', phone: '673881037', state: 'Sheep' },

  // CONTACTS FINAUX (Sheep)
  { first_name: 'Fabrice', last_name: '', phone: '677826701', state: 'Sheep' },
  { first_name: 'Brinda', last_name: '', phone: '691175503', state: 'Sheep' },
  { first_name: 'David', last_name: '', phone: '640202368', state: 'Sheep' },
  { first_name: 'Dilani', last_name: '', phone: '652041404', state: 'Sheep' },

  // AREA 1 SOULS (Deer)
  { first_name: 'Blaise', last_name: '', phone: '651543203', state: 'Deer' },
  { first_name: 'Anderson', last_name: '', phone: '690894528', state: 'Deer' },
  { first_name: 'Paulin', last_name: '', phone: '690337044', state: 'Deer' },
  { first_name: 'Jackson', last_name: '', phone: '653858942', state: 'Deer' },
  { first_name: 'Elvis', last_name: '', phone: '675573473', state: 'Deer' },
  { first_name: 'Divine', last_name: '', phone: '681795812', state: 'Deer' },
  { first_name: 'Destiny', last_name: '', phone: '672725535', state: 'Deer' },
  { first_name: 'Desko', last_name: '', phone: '679642461', state: 'Deer' },
  { first_name: 'Cletus', last_name: '', phone: '682744843', state: 'Deer' },
  { first_name: 'Cynthia', last_name: '', phone: '656740772', state: 'Deer' },
  { first_name: 'Innocent', last_name: '', phone: '691725816', state: 'Deer' },
  { first_name: 'Stéphane', last_name: '', phone: '655935569', state: 'Deer' },
  { first_name: 'O\'Neil', last_name: '', phone: '693941062', state: 'Deer' }
];

async function importNoellaMembers(noellaId, areaId) {
  let imported = 0;
  let skipped = 0;

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: m.last_name || 'Inconnu',
        phone_primary: m.phone,
        gender: 'M', // Defaulting to Male as per provided list
        state: m.state,
        area_id: areaId,
        leader_id: noellaId,
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

module.exports = { importNoellaMembers };
