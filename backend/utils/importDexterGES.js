const { Member, User } = require('../models');

const membersData = [
  { first_name: 'Bright', phone: '680418974' },
  { first_name: 'Simone ft', phone: '' },
  { first_name: 'Mama Elizabeth', phone: '' },
  { first_name: 'Agnes', phone: '' },
  { first_name: 'Felicia', phone: '679358354' },
  { first_name: 'Clovis', phone: '670330633' },
  { first_name: 'Angela', phone: '652314434' },
  { first_name: 'Blaise', phone: '671535501' },
  { first_name: 'Bryan', phone: '674272278' },
  { first_name: 'David', phone: '' },
  { first_name: 'Vanel', phone: '686155975' },
  { first_name: 'Bryan Motor', phone: '666633222' },
  { first_name: 'Audrey', phone: '' },
  { first_name: 'Anderson', phone: '651947393' },
  { first_name: 'Amanda', phone: '' },
  { first_name: 'Elvis', phone: '' },
  { first_name: 'Danielle', phone: '' },
  { first_name: 'Chantal ft', phone: '' },
  { first_name: 'Pelvani', phone: '' },
  { first_name: 'Zelea', phone: '' },
  { first_name: 'Princess', phone: '' },
  { first_name: 'Justin ft', phone: '' },
  { first_name: 'Danielle 2', phone: '' },
  { first_name: 'Precious', phone: '' },
  { first_name: 'Synthche', phone: '' },
  { first_name: 'Gillian', phone: '672554199' },
  { first_name: 'Fabiola', phone: '' },
  { first_name: 'Hervé', phone: '' },
  { first_name: 'Amanda 2', phone: '' },
  { first_name: 'Alexia', phone: '693081836' },
  { first_name: 'Alois', phone: '' },
  { first_name: 'Bryan 2', phone: '683018556' },
  { first_name: 'Solange', phone: '675387884' },
  { first_name: 'Emmanuel', phone: '674857971' },
  { first_name: 'Blaise ft', phone: '653543777' },
  { first_name: 'Evelyne ft', phone: '' },
  { first_name: 'kelly Preciuos', phone: '651383979' },
  { first_name: 'Miguel ft', phone: '' },
  { first_name: 'Carine', phone: '' },
  { first_name: 'Sandra ft', phone: '' },
  { first_name: 'Josey ft', phone: '' },
  { first_name: 'Roline', phone: '' },
  { first_name: 'kelly\'s Mom', phone: '676161609' },
  { first_name: 'Kelly 3 ft', phone: '681788743' },
  { first_name: 'Clepha ft', phone: '661299533' },
  { first_name: 'Facile ft', phone: '682633221' },
  { first_name: 'Ndi Annabelle', phone: '653327375' },
  { first_name: 'Emilia', phone: '660475209' },
  { first_name: 'Clepha\'s friend ft', phone: '' },
  { first_name: 'Mabel ft', phone: '651243388' },
  { first_name: 'Kindness ft', phone: '680150554' },
  { first_name: 'Damaris ft', phone: '' },
  { first_name: 'Vasti ft', phone: '640471345' },
  { first_name: 'Emmanuel ft', phone: '' },
  { first_name: 'Seth ft', phone: '' },
  { first_name: 'Kingsley ft', phone: '' },
  { first_name: 'Princewill ft', phone: '' },
  { first_name: 'Noel ft', phone: '' },
  { first_name: 'Elvia ft', phone: '' },
  { first_name: 'Rebecca ft', phone: '678446418' },
  { first_name: 'Triomph ft', phone: '672005115' },
  { first_name: 'Beni', phone: '' },
  { first_name: 'Myles', phone: '' },
  { first_name: 'Noella', phone: '' },
  { first_name: 'Joseph', phone: '' },
  { first_name: 'Samuel', phone: '694181021' },
  { first_name: 'Muma ft', phone: '' },
  { first_name: 'Blessing ft', phone: '672014573' },
  { first_name: 'Brice', phone: '654965374' },
  { first_name: 'Landry', phone: '698056118' },
  { first_name: 'Joshua', phone: '651727955' },
  { first_name: 'Moses', phone: '676250686' },
  { first_name: 'Delight', phone: '' },
  { first_name: 'Orgis', phone: '' },
  { first_name: 'Jordan', phone: '' },
  { first_name: 'Emmanuel 2', phone: '' },
  { first_name: 'Isaiah', phone: '' },
  { first_name: 'Esther', phone: '' },
  { first_name: 'Claire', phone: '' },
  { first_name: 'Zell', phone: '674864032' },
  { first_name: 'Phyno', phone: '678736934' },
  { first_name: 'Audrey 2', phone: '651481423' },
  { first_name: 'Betila', phone: '672993863' },
  { first_name: 'David 2', phone: '680669107' },
  { first_name: 'Seth 2', phone: '680051510' },
  { first_name: 'Beryl Mario', phone: '683544738' },
  { first_name: 'Holli', phone: '693885442' },
  { first_name: 'Stanley', phone: '679375812' },
  { first_name: 'Alain Faith ever', phone: '650638432' },
  { first_name: 'Ps Mike', phone: '651302262' },
  { first_name: 'Seraphine', phone: '' },
  { first_name: 'Raissa', phone: '' },
  { first_name: 'Farida', phone: '' },
  { first_name: 'Laura', phone: '' },
  { first_name: 'Prisca', phone: '' },
  { first_name: 'Cedrick', phone: '' },
  { first_name: 'Bless', phone: '' },
  { first_name: 'Frida', phone: '' },
  { first_name: 'florence', phone: '' },
  { first_name: 'Emmanuel 3', phone: '' },
  { first_name: 'Gladness', phone: '' },
  { first_name: 'Isaiah 2', phone: '' },
  { first_name: 'Emmanuella', phone: '' },
  { first_name: 'Clara', phone: '' },
  { first_name: 'Desmond', phone: '' },
  { first_name: 'Britney', phone: '' },
  { first_name: 'Tracey', phone: '' },
  { first_name: 'Joan', phone: '676843463' },
  { first_name: 'Glory', phone: '' },
  { first_name: 'Gael', phone: '675619488' },
  { first_name: 'Olive', phone: '680577512' },
  { first_name: 'Sidonie', phone: '' },
  { first_name: 'Melkichidek', phone: '650475640' },
  { first_name: 'Nadesh', phone: '680713755' },
  { first_name: 'Etienne', phone: '' },
  { first_name: 'Nathaniel', phone: '' },
  { first_name: 'Nara', phone: '' },
  { first_name: 'Naomi', phone: '' },
  { first_name: 'Ines', phone: '' },
  { first_name: 'Mme Njume', phone: '' },
  { first_name: 'Sonia', phone: '678008532' },
  { first_name: 'Mabel', phone: '670415044' },
  { first_name: 'Chidi', phone: '651045125' },
  { first_name: 'Blessing', phone: '675070197' },
  { first_name: 'Micah', phone: '675381566' },
  { first_name: 'Rodrigue', phone: '' },
  { first_name: 'Nancy', phone: '' },
  { first_name: 'Samuel 2', phone: '' },
  { first_name: 'Sophia', phone: '' },
  { first_name: 'Abednego', phone: '670872543' },
  { first_name: 'Daci', phone: '678754075' },
  { first_name: 'Pascal', phone: '' },
  { first_name: 'Briana', phone: '' },
  { first_name: 'Marie', phone: '' }
];

async function importDexterGESMembers(dexterId, areaId) {
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
          leader_id: dexterId
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

  // Fallback: update ALL of Dexter's existing members to GES for this specifically requested import
  await Member.update(
    { service_type: 'GES' },
    { where: { leader_id: dexterId } }
  );

  return { imported, updated, skipped, total: membersData.length, errors };
}

module.exports = { importDexterGESMembers };
