// backend/utils/importRayon.js
const { Member } = require('../models');

const membersData = [
  // General
  { first_name: 'Rayon', last_name: '', phone: '659371881', state: 'Sheep' },

  // Sheep
  { first_name: 'Bijoux', last_name: '', phone: '694333605', state: 'Sheep' },
  { first_name: 'Thierry', last_name: '', phone: '000000000', state: 'Sheep' },

  // Goat
  { first_name: 'Agnès', last_name: '', phone: '000000000', state: 'Goat' },
  { first_name: 'Duamel', last_name: '', phone: '654934391', state: 'Goat' },
  { first_name: 'Simone', last_name: '', phone: '675163261', state: 'Goat' },
  { first_name: 'Gabriel', last_name: '', phone: '000000000', state: 'Goat' },
  { first_name: 'Anicet', last_name: '', phone: '000000000', state: 'Goat' },

  // Deer
  { first_name: 'Theodore', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Frederick', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Lucile', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Stephane', last_name: '', phone: '657798708', state: 'Deer' },
  { first_name: 'Owona', last_name: 'B.', phone: '698128426', state: 'Deer' },
  { first_name: 'Manualle', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Flore', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandrine', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Bryan', last_name: '', phone: '693587930', state: 'Deer' },
  { first_name: 'Stephan', last_name: '', phone: '658571749', state: 'Deer' },
  { first_name: 'Tony', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Wilfried', last_name: '', phone: '689660630', state: 'Deer' },
  { first_name: 'Simone', last_name: '2', phone: '675163261', state: 'Deer' },
  { first_name: 'Jordan', last_name: '', phone: '697555386', state: 'Deer' },
  { first_name: 'Julien', last_name: '', phone: '692236371', state: 'Deer' },
  { first_name: 'Romeo', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Gerald', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Joel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Verla', last_name: 'Wilma', phone: '000000000', state: 'Deer' },
  { first_name: 'Daril', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Joan', last_name: '', phone: '651165610', state: 'Deer' },
  { first_name: 'Amane', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Cedric', last_name: '', phone: '681305866', state: 'Deer' },
  { first_name: 'Ladouce', last_name: '', phone: '689836978', state: 'Deer' },
  { first_name: 'Inno', last_name: '', phone: '000000000', state: 'Deer' },

  // FTs (Deer)
  { first_name: 'Raissa', last_name: '', phone: '698220289', state: 'Deer' },
  { first_name: 'Armand', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Kenne', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Idriss', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Merveille', last_name: 'Glory', phone: '000000000', state: 'Deer' },
  { first_name: 'Djoufack', last_name: 'Merveille', phone: '691300875', state: 'Deer' },
  { first_name: 'Gregoir', last_name: '', phone: '656083502', state: 'Deer' },
  { first_name: 'Sky', last_name: '', phone: '691613405', state: 'Deer' },
  { first_name: 'Iarrissa', last_name: '', phone: '698879557', state: 'Deer' },
  { first_name: 'Catherine', last_name: '', phone: '694701198', state: 'Deer' },
  { first_name: 'Onana', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Jeremi', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Keliane', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Freddy', last_name: '', phone: '650528188', state: 'Deer' },
  { first_name: 'Fortune', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Daril', last_name: '2', phone: '640733708', state: 'Deer' },
  { first_name: 'Delor', last_name: '', phone: '000000000', state: 'Deer' }
];

async function importRayonMembers(rayonId, areaId) {
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
        leader_id: rayonId,
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

module.exports = { importRayonMembers };
