const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Shalom', phone: '673840850' },
  { first_name: 'Glory', phone: '' },
  { first_name: 'Ulrich', phone: '697248958' },
  { first_name: 'David ft', phone: '670310883' },
  { first_name: 'Irish', phone: '673126814' },
  { first_name: 'William', phone: '655464355' },
  { first_name: 'Pierret', phone: '' },
  { first_name: 'brandon', phone: '' },
  { first_name: 'Yumbi', phone: '' },
  { first_name: 'Dan', phone: '' },
  { first_name: 'Joy', phone: '679712162' },
  { first_name: 'Armand', phone: '' },
  { first_name: 'Juliette', phone: '674067445' },
  { first_name: 'New member ft', phone: '' },
  { first_name: 'Paul Ft', phone: '651035878' },
  { first_name: 'Mme Danieller', phone: '' },
  { first_name: 'Clovis FT', phone: '681015998' },
  { first_name: 'Lawrence friend', phone: '' },
  { first_name: 'Joseph ft', phone: '' },
  { first_name: 'Morgan', phone: '' },
  { first_name: 'Jordan', phone: '' },
  { first_name: 'delight', phone: '' },
  { first_name: 'alvine', phone: '' },
  { first_name: 'elsie', phone: '' }
];

async function importShalomMembers(shalomId, areaId) {
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
          leader_id: shalomId
        }
      });

      if (existingMember) {
        await existingMember.update({ service_type: 'GES' });
        updated++;
      } else {
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'GES',
          area_id: areaId,
          leader_id: shalomId,
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

  // Fallback: update ALL of Shalom's existing members to GES
  await Member.update(
    { service_type: 'GES' },
    { where: { leader_id: shalomId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importShalomMembers };
