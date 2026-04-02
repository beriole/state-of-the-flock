// backend/utils/importCynthia.js
const { Member } = require('../models');

const membersData = [
  // SHEEP
  { first_name: 'Victory', phone: '000000000', state: 'Sheep' },
  { first_name: 'Destiny', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ps sylvanus', phone: '651076681', state: 'Sheep' },
  { first_name: 'David', phone: '000000000', state: 'Sheep' },
  { first_name: 'Madame Magarito', phone: '698601430', state: 'Sheep' },
  
  // GOAT
  { first_name: 'Genny', phone: '000000000', state: 'Goat' },

  // DEER
  { first_name: 'Bladine', phone: '000000000', state: 'Deer' },
  { first_name: 'Brenda', phone: '000000000', state: 'Deer' },
  { first_name: 'Suzanne', phone: '696616565', state: 'Deer' },
  { first_name: 'Thierry', phone: '000000000', state: 'Deer' },
  { first_name: 'Yannick', phone: '000000000', state: 'Deer' },
  { first_name: 'Sebastien', phone: '658193381', state: 'Deer' },
  { first_name: 'Sami', phone: '670386146', state: 'Deer' },
  { first_name: 'Dieudonne', phone: '000000000', state: 'Deer' },
  { first_name: 'Veronica', phone: '000000000', state: 'Deer' },
  { first_name: 'Richard', phone: '000000000', state: 'Deer' },
  { first_name: 'Salomel', phone: '000000000', state: 'Deer' },
  { first_name: 'Irika', phone: '000000000', state: 'Deer' },
  { first_name: 'Jean pierre', phone: '658299564', state: 'Deer' },
  { first_name: 'Anthony', phone: '692064234', state: 'Deer' },
  { first_name: 'Joseph', phone: '000000000', state: 'Deer' },
  { first_name: 'Pavel', phone: '693458306', state: 'Deer' },
  { first_name: 'Bryan', phone: '000000000', state: 'Deer' },
  { first_name: 'Destiny 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Anas', phone: '000000000', state: 'Deer' },
  { first_name: 'Daniel', phone: '673707340', state: 'Deer' },
  { first_name: 'Simon', phone: '000000000', state: 'Deer' },
  { first_name: 'Bida', phone: '000000000', state: 'Deer' },
  { first_name: 'Delphin', phone: '000000000', state: 'Deer' },
  { first_name: 'Yvan', phone: '696136656', state: 'Deer' },
  { first_name: 'Roy', phone: '672151751', state: 'Deer' },
  { first_name: 'Merveille', phone: '000000000', state: 'Deer' },
  { first_name: 'Marie', phone: '000000000', state: 'Deer' },
  { first_name: 'Kevin', phone: '000000000', state: 'Deer' },

  // FTs
  { first_name: 'Melanie', phone: '650766933', state: 'Deer' },
  { first_name: 'Destiny 3', phone: '000000000', state: 'Deer' },
  { first_name: 'Princely', phone: '000000000', state: 'Deer' },
  { first_name: 'Wisdom', phone: '000000000', state: 'Deer' },
  { first_name: 'Daniela', phone: '000000000', state: 'Deer' },
  { first_name: 'Awa', phone: '000000000', state: 'Deer' },
  { first_name: 'Margaret uncle', phone: '000000000', state: 'Deer' },
  { first_name: 'Margaret aunty', phone: '000000000', state: 'Deer' },

  // LEADER & SHEEP
  { first_name: 'DR. Elysee', phone: '000000000', state: 'Sheep' },
  { first_name: 'Arthur', phone: '000000000', state: 'Sheep' },
  { first_name: 'Goodness', phone: '673863822', state: 'Sheep' },
  { first_name: 'Glory', phone: '67723271', state: 'Sheep' },

  // GOAT
  { first_name: 'Athony', phone: '000000000', state: 'Goat' },
  { first_name: 'Dickson', phone: '000000000', state: 'Goat' },
  { first_name: 'morelle', phone: '000000000', state: 'Goat' },
  { first_name: 'Suzanne 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Jean pierre 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Cury', phone: '000000000', state: 'Goat' },
  { first_name: 'Brendine', phone: '000000000', state: 'Goat' },
  { first_name: 'Joyful', phone: '000000000', state: 'Goat' },
  { first_name: 'Jacomes', phone: '683494784', state: 'Goat' },
  { first_name: 'Raoul', phone: '000000000', state: 'Goat' },
  { first_name: 'Daniel 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Christel', phone: '000000000', state: 'Goat' },
  { first_name: 'Faustine', phone: '000000000', state: 'Goat' },
  { first_name: 'Henrita', phone: '000000000', state: 'Goat' },
  { first_name: 'Elme', phone: '000000000', state: 'Goat' },
  { first_name: 'Nji', phone: '000000000', state: 'Goat' },
  { first_name: 'Clinton', phone: '000000000', state: 'Goat' },
  { first_name: 'Yvan 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Jenny', phone: '000000000', state: 'Goat' },
  { first_name: 'Daniel 3', phone: '675383346', state: 'Goat' },
  { first_name: 'Blaise', phone: '651067681', state: 'Goat' },
  { first_name: 'Sam', phone: '000000000', state: 'Goat' },
  { first_name: 'Clement', phone: '000000000', state: 'Goat' },
  { first_name: 'Glory 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Mildred', phone: '000000000', state: 'Goat' },
  { first_name: 'Edward', phone: '000000000', state: 'Goat' },

  // FTs
  { first_name: 'NZele', phone: '000000000', state: 'Deer' },
  { first_name: 'Rose', phone: '685681436', state: 'Deer' },
  { first_name: 'Tracy', phone: '650397788', state: 'Deer' },

  // GOAT
  { first_name: 'Etienne', phone: '653330724', state: 'Goat' },
  { first_name: 'Sonia', phone: '667623668', state: 'Goat' },

  // DEER
  { first_name: 'kim', phone: '669006877', state: 'Deer' },
  { first_name: 'Jessica', phone: '000000000', state: 'Deer' },
  { first_name: 'Ristelle', phone: '671247438', state: 'Deer' },
  { first_name: 'Chrescence', phone: '000000000', state: 'Deer' },
  { first_name: 'Faith', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior', phone: '655472523', state: 'Deer' },
  { first_name: 'Fabrice', phone: '000000000', state: 'Deer' },
  { first_name: 'Fortune', phone: '000000000', state: 'Deer' },
  { first_name: 'Rondelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Yannick 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Joelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Edouwa', phone: '000000000', state: 'Deer' },
  { first_name: 'Loic', phone: '660132755', state: 'Deer' },
  { first_name: 'Sophia', phone: '000000000', state: 'Deer' },
  { first_name: 'Herve', phone: '674480982', state: 'Deer' },
  { first_name: 'Andre', phone: '000000000', state: 'Deer' },
  { first_name: 'Velaire', phone: '665215311', state: 'Deer' },
  { first_name: 'Moise', phone: '000000000', state: 'Deer' },
  { first_name: 'Roger', phone: '653164849', state: 'Deer' },
  { first_name: 'Estelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Oceane', phone: '000000000', state: 'Deer' },
  { first_name: 'Simon 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Theophy', phone: '000000000', state: 'Deer' }
];

async function importCynthiaMembers(cynthiaId, areaId) {
  let imported = 0;
  let skipped = 0;
  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: 'Inconnu',
        phone_primary: m.phone,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: cynthiaId,
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

module.exports = { importCynthiaMembers };
