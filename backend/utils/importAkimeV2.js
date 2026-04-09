const { Member } = require('../models');

const membersData = [
  { first_name: 'Akime', phone: '' },
  { first_name: 'Lehila', phone: '698991889' },
  { first_name: 'Mr Amadou', phone: '691919663' },
  { first_name: 'Mme Amadou', phone: '655412506' },
  { first_name: 'Loïc', phone: '697174042' },
  { first_name: 'Abdel-Aziz', phone: '' },
  { first_name: 'Ferdinand', phone: '' },
  { first_name: 'Olin', phone: '' },
  { first_name: 'Stella', phone: '' },
  { first_name: 'Mama Marie', phone: '' },
  { first_name: 'Dyland', phone: '' },
  
  { first_name: 'Jamile', phone: '' },
  { first_name: 'Djamil', phone: '687025279' },
  { first_name: 'Josline', phone: '694734016' },
  { first_name: 'Romuald', phone: '658847802' },
  { first_name: 'Dylan', phone: '' },
  { first_name: 'Frère 1', phone: '' },
  { first_name: 'Frère 2', phone: '' },
  { first_name: 'Serena', phone: '' },
  { first_name: 'Frêde', phone: '693045335' },
  { first_name: 'Lorena', phone: '' },
  { first_name: 'Sidoine', phone: '' },
  { first_name: 'Anicet', phone: '690496211' },
  { first_name: 'Russel', phone: '' },
  { first_name: 'Maman Christelle', phone: '694494211' },

  { first_name: 'Mathias', phone: '' },
  { first_name: 'Dominc', phone: '' },
  { first_name: 'Lizette', phone: '' },
  { first_name: 'Cynthia', phone: '' },
  { first_name: 'Siduane', phone: '' },

  { first_name: 'Hanna', phone: '' },
  { first_name: 'Stephanie', phone: '' },
  { first_name: 'Facile', phone: '' },
  { first_name: 'Awah', phone: '' },
  { first_name: 'Rene', phone: '' },
  { first_name: 'Brunu', phone: '' }
];

async function importAkimeMembers(akimeId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Leader/Governor n a pas de area_id (zone) assignée. Impossible de créer des membres.' };
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
        leader_id: akimeId,
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

module.exports = { importAkimeMembers };
