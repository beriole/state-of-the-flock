const { Member } = require('../models');

const membersData = [
  { first_name: 'Innocent', phone: '687967088' },
  { first_name: 'Elysee', phone: '691634815' },
  { first_name: 'Maselen', phone: '696303144' },
  { first_name: 'Desire', phone: '692085091' },
  { first_name: 'David', phone: '689488698' },
  { first_name: 'Confidence', phone: '682863761' },
  { first_name: 'Angela', phone: '687830801' },
  { first_name: 'Junior', phone: '640556373' },
  { first_name: 'Divine', phone: '' },
  { first_name: 'Maxeline', phone: '' },
  { first_name: 'Akoa Manu', phone: '692056947' },
  { first_name: 'Fransisco', phone: '699173486' },
  { first_name: 'Joseph', phone: '659558209' },
  { first_name: 'Alex', phone: '658734512' },
  { first_name: 'Valez', phone: '696534931' },
  { first_name: 'Micaih', phone: '679845653' },
  { first_name: 'Bonhure', phone: '656815288' },
  { first_name: 'Franky', phone: '' },
  { first_name: 'Dilya', phone: '258848950562' },
  { first_name: 'Anaft', phone: '' },
  { first_name: 'Erneneles', phone: '265881919228' },
  { first_name: 'Bryan Eve', phone: '652015865' },
  { first_name: 'Steve ft', phone: '' },
  { first_name: 'Brenda ft', phone: '' },
  { first_name: 'Ariel ft', phone: '' },
  { first_name: 'Fred', phone: '693045335' },
  { first_name: 'Deborah', phone: '' },
  { first_name: 'Mama Awah', phone: '697692245' },
  { first_name: 'Deby\'s brother ft', phone: '' },
  { first_name: 'Katchalla ft', phone: '' },
  { first_name: 'Abdourahman ft', phone: '640378956' },
  { first_name: 'Romeo ft', phone: '' },
  { first_name: 'Bappe ft', phone: '656620893' },
  { first_name: 'Lizette ft', phone: '697671420' },
  { first_name: 'Arieth', phone: '697671420' },
  { first_name: 'Daniel', phone: '697671420' },
  { first_name: 'Musa Chadien', phone: '' },
  { first_name: 'Jenny Muriel', phone: '' },
  { first_name: 'Jennifa', phone: '677347929' },
  { first_name: 'Rohda', phone: '' },
  { first_name: 'Jordan', phone: '' },

  { first_name: 'Stephanie', phone: '693500749' },
  { first_name: 'Ekah Emanuel', phone: '' },
  { first_name: 'Elious', phone: '693500749' },
  { first_name: 'Gladys', phone: '64035251' },
  { first_name: 'Jeff', phone: '696278042' },
  { first_name: 'Marie', phone: '696255588' },
  { first_name: 'Collins', phone: '651400437' },
  { first_name: 'Mark', phone: '651400437' },
  { first_name: 'Leslie', phone: '659456122' },
  { first_name: 'Success', phone: '' },
  { first_name: 'Ornella', phone: '659456122' },
  { first_name: 'Erika', phone: '678344592' },
  { first_name: 'Lucien Meyo', phone: '6822514' },
  { first_name: 'Grab rice Mbankolo', phone: '670215703' },
  { first_name: 'Innocent Azimut', phone: '698769097' },
  { first_name: 'Coreli', phone: '698243293' },
  { first_name: 'Mildred', phone: '676983892' },
  { first_name: 'Daniel (FT)', phone: '' },

  { first_name: 'Abraham', phone: '676367668' },
  { first_name: 'Kelly', phone: '676367668' },
  { first_name: 'Vincent', phone: '' },
  { first_name: 'Andrew', phone: '' },
  { first_name: 'Lionel', phone: '' },
  { first_name: 'Sabina', phone: '675682501' },
  { first_name: 'Micheal mbah', phone: '651808254' },
  { first_name: 'Shansline', phone: '673577663' },
  { first_name: 'Precious', phone: '' },

  { first_name: 'Roda', phone: '' },
  { first_name: 'Phanuel', phone: '' },
  { first_name: 'Pamela', phone: '' },
  { first_name: 'Ornella (Group)', phone: '' },
  { first_name: 'Ryan', phone: '' },
  { first_name: 'Obama', phone: '' },
  { first_name: 'Fidel', phone: '' },
  { first_name: 'Bryan', phone: '' },
  { first_name: 'Justin', phone: '' },
  { first_name: 'Junior (Group)', phone: '' },
  { first_name: 'Leticia', phone: '' },

  { first_name: 'Oliver', phone: '652308422' },
  { first_name: 'MICHELLE', phone: '' },
  { first_name: 'ROSALIE', phone: '' },
  { first_name: 'ROMEO', phone: '658084568' },
  { first_name: 'MAURICE', phone: '658976235' },
  { first_name: 'SIDONIE', phone: '656721473' }
];

async function importRosaMembers(rosaId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Gouverneur n a pas de zone assignée.' };
  }

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name.trim(),
        last_name: 'Inconnu',
        phone_primary: m.phone || '000000000',
        gender: 'Unknown',
        service_type: 'FES',
        area_id: areaId,
        leader_id: rosaId,
        is_active: true
      });
      imported++;
    } catch (error) {
      console.error(`Error importing ${m.first_name}:`, error.message);
      if (errors.length < 5) {
        errors.push(`${m.first_name}: ${error.message}`);
      }
      skipped++;
    }
  }
  return { imported, skipped, total: membersData.length, errors };
}

module.exports = { importRosaMembers };
