// backend/utils/importReward.js
const { Member } = require('../models');

const membersData = [
  // Block 1 & 2 (Assigned to Sheep)
  { first_name: 'Sonita', phone: '652667085', state: 'Sheep' },
  { first_name: 'Audrey', phone: '673702042', state: 'Sheep' },
  { first_name: 'Kareen', phone: '673702042', state: 'Sheep' },
  { first_name: 'Leticia', phone: '681499558', state: 'Sheep' },
  { first_name: 'Edel Pascale', phone: '692973096', state: 'Sheep' },
  { first_name: 'Herman', phone: '000000000', state: 'Sheep' },
  { first_name: 'Nathan', phone: '000000000', state: 'Sheep' },
  { first_name: 'Harriet', phone: '653676898', state: 'Sheep' },
  { first_name: 'Benedict', phone: '000000000', state: 'Sheep' },
  { first_name: 'Mildred', phone: '675217867', state: 'Sheep' },
  { first_name: 'Abola', phone: '689818264', state: 'Sheep' },
  { first_name: 'Joyce', phone: '652988091', state: 'Sheep' },
  { first_name: 'Treasure', phone: '677768861', state: 'Sheep' },
  { first_name: 'Kono Frederick', phone: '657303207', state: 'Sheep' },
  { first_name: 'Maevine', phone: '653972257', state: 'Sheep' },
  { first_name: 'Dimitri', phone: '694769801', state: 'Sheep' },
  { first_name: 'Blaise Enowgeneh', phone: '674907328', state: 'Sheep' },
  { first_name: 'Cedric Djindze', phone: '677162328', state: 'Sheep' },
  { first_name: 'Papi Sidione', phone: '681792960', state: 'Sheep' },
  { first_name: 'Precious', phone: '651743090', state: 'Sheep' },

  // Block 3 & 4 (Assigned to Goat)
  { first_name: 'Ransom Muluh', phone: '680231519', state: 'Goat' },
  { first_name: 'Blanche Agnès', phone: '674851181', state: 'Goat' },
  { first_name: 'Sarah', phone: '689401685', state: 'Goat' },
  { first_name: 'Mildred 2', phone: '675217867', state: 'Goat' },
  { first_name: 'Ronell', phone: '681498345', state: 'Goat' },
  { first_name: 'Loïc', phone: '656942183', state: 'Goat' },
  { first_name: 'Junior', phone: '656299127', state: 'Goat' },
  { first_name: 'Roy', phone: '670628969', state: 'Goat' },
  { first_name: 'Dimitri 2', phone: '657523838', state: 'Goat' },
  { first_name: 'Landry', phone: '696645034', state: 'Goat' },
  { first_name: 'Silas', phone: '681955646', state: 'Goat' },
  { first_name: 'Marie Noëlle', phone: '653972257', state: 'Goat' },
  { first_name: 'Bryan', phone: '000000000', state: 'Goat' },
  { first_name: 'Sama', phone: '683937002', state: 'Goat' },
  { first_name: 'MariBelle', phone: '657458360', state: 'Goat' },
  { first_name: 'James', phone: '000000000', state: 'Goat' },

  // Block 5, 6, 7 (Assigned to Deer)
  { first_name: 'Vanelle', phone: '653601019', state: 'Deer' },
  { first_name: 'Antoine Mongo', phone: '688756518', state: 'Deer' },
  { first_name: 'Maevine 2', phone: '653972257', state: 'Deer' },

  { first_name: 'Raissa Obama', phone: '655942521', state: 'Deer' },
  { first_name: 'Promesse', phone: '000000000', state: 'Deer' },
  { first_name: 'Laetitia Sih', phone: '000000000', state: 'Deer' },
  { first_name: 'Marie', phone: '673989312', state: 'Deer' },
  { first_name: 'Brandon', phone: '682469250', state: 'Deer' },
  { first_name: 'Cédric Nwaha', phone: '691485488', state: 'Deer' },
  { first_name: 'Romeo', phone: '688012534', state: 'Deer' },
  { first_name: 'Justin', phone: '000000000', state: 'Deer' },
  { first_name: 'Francois Eyembe', phone: '655019491', state: 'Deer' },
  { first_name: 'Jean Atangana', phone: '689557885', state: 'Deer' },
  { first_name: 'Derrick Livingstone', phone: '000000000', state: 'Deer' },

  { first_name: 'Stanislas', phone: '677206188', state: 'Deer' },
  { first_name: 'Brandon 2', phone: '678054142', state: 'Deer' },
  { first_name: 'Brian', phone: '680140576', state: 'Deer' },
  { first_name: 'Edwige', phone: '657029532', state: 'Deer' },
  { first_name: 'Precious 2', phone: '676767924', state: 'Deer' },
  { first_name: 'Alvarez', phone: '696437346', state: 'Deer' },
  { first_name: 'Jean Rene', phone: '658287494', state: 'Deer' },
  { first_name: 'Issa', phone: '696594984', state: 'Deer' },
  { first_name: 'Nadia', phone: '697882191', state: 'Deer' },
  { first_name: 'Cyprien', phone: '690439517', state: 'Deer' },
  { first_name: 'Samuel Fondoh', phone: '000000000', state: 'Deer' },
  { first_name: 'Irene', phone: '656712115', state: 'Deer' },
  { first_name: 'Emilien', phone: '698718122', state: 'Deer' },
  { first_name: 'Lionel', phone: '689834497', state: 'Deer' },
  { first_name: 'Vanessa', phone: '000000000', state: 'Deer' },
  { first_name: 'Queentabelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Glory', phone: '000000000', state: 'Deer' },
  { first_name: 'Fatima', phone: '672144174', state: 'Deer' },
  { first_name: 'Sarah 2', phone: '657303207', state: 'Deer' },
  { first_name: 'Maeva', phone: '657303207', state: 'Deer' },
  { first_name: 'Taty Tatiana', phone: '694885281', state: 'Deer' }
];

async function importRewardMembers(rewardId, areaId) {
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
        leader_id: rewardId,
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

module.exports = { importRewardMembers };
