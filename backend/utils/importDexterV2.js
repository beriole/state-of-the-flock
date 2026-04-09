const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Lucy', phone: '680938302' },
  { first_name: 'Sharma', phone: '670047534' },
  { first_name: 'Gladys', phone: '697421056' },

  { first_name: 'Dana', phone: '' },
  { first_name: 'Therese', phone: '' },
  { first_name: 'Claire', phone: '' },
  { first_name: 'Angel', phone: '' },
  { first_name: 'Cynthia', phone: '' },
  { first_name: 'Bryana Tresor', phone: '682199449' },
  { first_name: 'Noel', phone: '' },
  { first_name: 'Chris', phone: '' },
  { first_name: 'Blaise', phone: '' },
  { first_name: 'Ketty', phone: '' },
  { first_name: 'Zeali', phone: '' },
  { first_name: 'David', phone: '' },
  { first_name: 'Yero', phone: '' },
  { first_name: 'Wendy', phone: '' },
  { first_name: 'Brandon', phone: '' },
  { first_name: 'Blessing', phone: '677001531' },
  { first_name: 'Solange', phone: '' },
  { first_name: 'Sandrine', phone: '' },
  { first_name: 'Loren', phone: '' },
  { first_name: 'Danchou', phone: '' },
  { first_name: 'Gabby', phone: '' },
  { first_name: 'Elbright', phone: '' },
  { first_name: 'Bella', phone: '' },
  { first_name: 'Clara', phone: '682205792' },
  { first_name: 'Ngalim Christian', phone: '678125838' },

  { first_name: 'Princess', phone: '' },
  { first_name: 'Gael', phone: '' },
  { first_name: 'Damaris', phone: '' },
  { first_name: 'Vanessa', phone: '' },
  { first_name: 'Sherife', phone: '' },
  { first_name: 'Gezil', phone: '' },
  { first_name: 'Emmanuel', phone: '' },
  { first_name: 'Nforba', phone: '' },
  { first_name: 'Sonia', phone: '' },
  { first_name: 'Bless', phone: '' },
  { first_name: 'Michelle', phone: '' },
  { first_name: 'Angel', phone: '' },
  { first_name: 'Julienne', phone: '' },
  { first_name: 'Stephan', phone: '' },
  { first_name: 'Betila', phone: '' },
  { first_name: 'James', phone: '' },
  { first_name: 'Chole', phone: '' },
  { first_name: 'Tresor', phone: '672199447' },
  { first_name: 'Claris', phone: '' },
  { first_name: 'Olive', phone: '680122557' },
  { first_name: 'Majolie', phone: '' },
  { first_name: 'Citify Kerry', phone: '654453035' }
];

async function importDexterV2Members(dexterId, areaId) {
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
      
      // Look for existing member by name and leader
      const existingMember = await Member.findOne({
        where: {
          first_name: cleanFirstName,
          leader_id: dexterId
        }
      });

      if (existingMember) {
        // If it exists, update the service_type to FLES to ensure everything is correct
        await existingMember.update({ service_type: 'FLES' });
        updated++;
      } else {
        // Create new if it doesn't exist to avoid duplicates
        await Member.create({
          first_name: cleanFirstName,
          last_name: 'Inconnu',
          phone_primary: m.phone || '000000000',
          gender: 'Unknown',
          service_type: 'FLES',
          area_id: areaId,
          leader_id: dexterId,
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

  // Fallback: Also globally update ALL of Dexter's existing members to FLES
  // just in case they were named slightly differently in the DB before.
  await Member.update(
    { service_type: 'FLES' },
    { where: { leader_id: dexterId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importDexterV2Members };
