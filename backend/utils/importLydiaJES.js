const { Member, User } = require('../models');

const membersData = [
  { first_name: 'La Lydia', phone: '676837133' },
  { first_name: 'Favour', phone: '679907710' },
  { first_name: 'Rachel', phone: '651145457' },
  { first_name: 'Chidou', phone: '699745312' },
  { first_name: 'Harriett', phone: '' },
  { first_name: 'Emmanuel', phone: '' },
  { first_name: 'Mama Theresse', phone: '' },
  { first_name: 'Mme Harold', phone: '670451883' },
  { first_name: 'James Harold', phone: '' },
  { first_name: 'Suzanne', phone: '' },
  { first_name: 'Scholastique', phone: '' },
  { first_name: 'Nji', phone: '698242882' },
  { first_name: 'Christian', phone: '695721101' },
  { first_name: 'Danila', phone: '' },
  { first_name: 'Marco Devala', phone: '681534220' },
  { first_name: 'Hubre', phone: '' },
  { first_name: 'Pearl Peter', phone: '' },
  { first_name: 'Raymon', phone: '' },
  { first_name: 'Scholastique Boy', phone: '' },
  { first_name: 'Stephane', phone: '' },
  { first_name: 'Glen', phone: '' },
  { first_name: 'Matile', phone: '' },
  { first_name: 'Ismail', phone: '' },
  { first_name: 'Lida', phone: '' },
  { first_name: 'Leocadie', phone: '695022143' },
  { first_name: 'Mr Ousaga', phone: '' },
  { first_name: 'Cecile', phone: '' },
  { first_name: 'Noe', phone: '678243722' },
  { first_name: 'Eto Marie', phone: '' },
  { first_name: 'Junior', phone: '681170037' },
  { first_name: 'Mme Nicholas', phone: '677017442' },
  { first_name: 'Mr Kinshong', phone: '' },
  { first_name: 'Sandra', phone: '' },
  { first_name: 'Melanie', phone: '651634812' },
  { first_name: 'Melissa', phone: '' },
  { first_name: 'Benjamne', phone: '677017112' },
  { first_name: 'Marcel', phone: '' },
  { first_name: 'Bertile', phone: '671412807' },
  { first_name: 'Rhoda', phone: '695022131' },
  { first_name: 'Christine', phone: '' },
  { first_name: 'Marly', phone: '671158276' },
  { first_name: 'Danielle', phone: '' },
  { first_name: 'Shalom', phone: '' },
  { first_name: 'Desmond', phone: '' },
  { first_name: 'Divine', phone: '' },
  { first_name: 'Benny', phone: '' },
  { first_name: 'Pauline', phone: '671253452' },
  { first_name: 'Leocadie 2', phone: '653517417' },
  { first_name: 'Nina', phone: '' },
  { first_name: 'Lea', phone: '' },
  { first_name: 'Melaine', phone: '' },
  { first_name: 'Gladys', phone: '' },
  { first_name: 'Bertrand', phone: '' },
  { first_name: 'Hero', phone: '' },
  { first_name: 'Franck', phone: '651132204' },
  { first_name: 'Pierre', phone: '654271101' },
  { first_name: 'Bil Ghislain', phone: '652434551' },
  { first_name: 'Sorel', phone: '' },
  { first_name: 'Micheline', phone: '' },
  { first_name: 'Njume', phone: '681283620' },
  { first_name: 'Freddy', phone: '' },
  { first_name: 'Benila', phone: '671412804' },
  { first_name: 'Chantal', phone: '656154625' },
  { first_name: 'Emma', phone: '691717311' },
  { first_name: 'Mireille', phone: '681534220' },
  { first_name: 'Priscille', phone: '651214434' },
  { first_name: 'Anyi', phone: '651132204' },
  { first_name: 'Suzy', phone: '674227380' },
  { first_name: 'Atena', phone: '671253142' },
  { first_name: 'Tsibal Valery', phone: '631034442' },
  { first_name: 'Paule', phone: '653517417' },
  { first_name: 'Fabrice', phone: '' },
  { first_name: 'Alida', phone: '695022143' }
];

async function importLydiaJESMembers(lydiaId, areaId) {
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
          leader_id: lydiaId
        }
      });

      if (existingMember) {
        // We update the service type to JES as requested
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
          leader_id: lydiaId,
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

  // Force all existing members of this leader to JES if they weren't already
  await Member.update(
    { service_type: 'JES' },
    { where: { leader_id: lydiaId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importLydiaJESMembers };
