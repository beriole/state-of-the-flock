const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Mme Nicholas', phone: '676837133' },
  { first_name: 'Bright', phone: '68317351' },
  { first_name: 'Micheline', phone: '699745312' },
  { first_name: 'Alida', phone: '695022143' },
  { first_name: 'Pauline', phone: '671233452' },
  { first_name: 'Melaine', phone: '651132204' },
  { first_name: 'Benny', phone: '695721101' },
  { first_name: 'Pierre', phone: '654271101' },
  { first_name: 'Paul', phone: '653517417' },
  { first_name: 'Ngwa Claudine', phone: '' },
  { first_name: 'Blandine', phone: '656154625' },
  { first_name: 'Emmanuel', phone: '691717311' },
  { first_name: 'Sylvia FT', phone: '681534220' },
  { first_name: 'Blandine FT', phone: '656154625' },
  { first_name: 'Brisan', phone: '677017112' },
  { first_name: 'Priscille', phone: '651214434' },
  { first_name: 'Sandrine', phone: '681283620' },
  { first_name: 'Melanie', phone: '651634812' },
  { first_name: 'Marcel 2', phone: '651117417' },
  { first_name: 'Rhoda', phone: '695022131' },
  { first_name: 'Christine', phone: '651154271' },
  { first_name: 'Marly', phone: '671158276' },
  { first_name: 'Hubre', phone: '681534220' },
  { first_name: 'James FT', phone: '677017112' },
  { first_name: 'Ray', phone: '651132204' },
  { first_name: 'Junior', phone: '681170037' },
  { first_name: 'Prince', phone: '651117417' },
  { first_name: 'Christian', phone: '695721101' },
  { first_name: 'Samuel', phone: '651132204' },
  { first_name: 'Comfort', phone: '671253452' },
  { first_name: 'Lydia', phone: '653517411' },
  { first_name: 'Etienne', phone: '681283620' },
  { first_name: 'Ghislain', phone: '652434551' },
  { first_name: 'Arnaud', phone: '651132204' },
  { first_name: 'Stephane', phone: '691717311' },
  { first_name: 'Marc Devala', phone: '681534220' },
  { first_name: 'Daniel', phone: '656154625' },
  { first_name: 'James', phone: '677017112' },
  { first_name: 'Mame Berthe', phone: '651132204' },
  { first_name: 'Gustave', phone: '651271111' },
  { first_name: 'Hugue', phone: '691717311' },
  { first_name: 'Isai', phone: '670451883' },
  { first_name: 'Gladys', phone: '681534220' },
  { first_name: 'Cynthia', phone: '677017112' },
  { first_name: 'Danielle', phone: '651132204' },
  { first_name: 'Franck', phone: '674227380' },
  { first_name: 'Bernard', phone: '671253452' },
  { first_name: 'Galienne', phone: '691034442' },
  { first_name: 'Aimé', phone: '654271101' },
  { first_name: 'Eustache', phone: '691717311' },
  { first_name: 'Boris', phone: '681534220' },
  { first_name: 'David', phone: '656154625' },
  { first_name: 'Judith FT', phone: '651214434' }
];

async function importMarcelJESMembers(marcelId, areaId) {
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
          leader_id: marcelId
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
          leader_id: marcelId,
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
    { where: { leader_id: marcelId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importMarcelJESMembers };
