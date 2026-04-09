const { Member, User } = require('../models');

const membersData = [
  { first_name: 'LP Frantz Babila', phone: '' },
  { first_name: 'Cisse Dialo', phone: '' },
  { first_name: 'Annie Ebale', phone: '698242882' },
  { first_name: 'Margret Ayuk', phone: '675721101' },
  { first_name: 'Matile Mbida', phone: '' },
  { first_name: 'James Harold', phone: '' },
  { first_name: 'Corinna Harold', phone: '' },
  { first_name: 'Angi ft', phone: '695721101' },
  { first_name: 'Arisida', phone: '' },
  { first_name: 'Marco Devala', phone: '681534220' },
  { first_name: 'Mama Theresse', phone: '' },
  { first_name: 'Mme Harold', phone: '' },
  { first_name: 'Scholastique', phone: '' },
  { first_name: 'Nji', phone: '698242882' },
  { first_name: 'Christian', phone: '695721101' },
  { first_name: 'Danila', phone: '' },
  { first_name: 'Junior', phone: '681170037' },
  { first_name: 'Mme Nicholas', phone: '677017442' },
  { first_name: 'Mélanie', phone: '651634812' },
  { first_name: 'Melissa', phone: '651478712' },
  { first_name: 'Benjamne', phone: '677017442' },
  { first_name: 'Marcel', phone: '651117417' },
  { first_name: 'Bertile', phone: '671412807' },
  { first_name: 'Rhoda', phone: '695022131' },
  { first_name: 'Christine', phone: '651154271' },
  { first_name: 'Marly', phone: '671158276' },
  { first_name: 'Franck', phone: '651132204' },
  { first_name: 'Pierre', phone: '654271101' },
  { first_name: 'Pauline', phone: '671233452' },
  { first_name: 'Leocadie', phone: '653517411' },
  { first_name: 'Chantal', phone: '656154625' },
  { first_name: 'Emma', phone: '691717311' },
  { first_name: 'Michel', phone: '670451883' },
  { first_name: 'Mireille', phone: '681534220' },
  { first_name: 'Priscille', phone: '651214434' },
  { first_name: 'Patience', phone: '677017112' },
  { first_name: 'Anyi', phone: '651132204' },
  { first_name: 'Suzy', phone: '674227380' },
  { first_name: 'Atena', phone: '671253452' },
  { first_name: 'Tsibal Valery', phone: '691034442' },
  { first_name: 'Melissa 2', phone: '654271101' },
  { first_name: 'Paule', phone: '653517417' },
  { first_name: 'Alida', phone: '695022143' },
  { first_name: 'Giles', phone: '651214434' },
  { first_name: 'Ngwa', phone: '677017112' },
  { first_name: 'Fongang', phone: '651132204' },
  { first_name: 'Blessing', phone: '674227380' },
  { first_name: 'Favour', phone: '671007710' },
  { first_name: 'Rachel', phone: '651145457' },
  { first_name: 'Chidou', phone: '699745312' },
  { first_name: 'Cecile', phone: '671253452' },
  { first_name: 'Noe', phone: '653517417' },
  { first_name: 'Sandra', phone: '677017112' },
  { first_name: 'Benila', phone: '671412804' },
  { first_name: 'Bil Ghislain', phone: '652434551' },
  { first_name: 'Njume', phone: '681283620' },
  { first_name: 'Mme Harold 2', phone: '670451883' },
  { first_name: 'Hubre', phone: '681534220' },
  { first_name: 'Marco Devala 2', phone: '681534220' }
];

async function importSamuelJESMembers(samuelId, areaId) {
  let imported = 0;
  let skipped = 0;
  let updated = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Leader/Governor n a pas de zone assignée.' };
  }

  for (const m of membersData) {
    try {
      const cleanFirstName = m.first_name.trim();
      
      const existingMember = await Member.findOne({
        where: {
          first_name: cleanFirstName,
          leader_id: samuelId
        }
      });

      if (existingMember) {
        await existingMember.update({ service_type: 'JES' });
        updated++;
      } else {
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'JES',
          area_id: areaId,
          leader_id: samuelId,
          is_active: true
        });
        imported++;
      }
    } catch (error) {
      console.error(`Error importing ${m.first_name}:`, error.message);
      if (errors.length < 5) {
        errors.push(`${m.first_name}: ${error.message}`);
      }
      skipped++;
    }
  }

  // Force all existing members of this leader to JES
  await Member.update(
    { service_type: 'JES' },
    { where: { leader_id: samuelId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importSamuelJESMembers };
