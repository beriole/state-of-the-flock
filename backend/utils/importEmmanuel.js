const { Member } = require('../models');

const membersData = [
  // SHEEP
  { first_name: 'MAKENZIE', phone: '689461469', state: 'Sheep' },
  { first_name: 'MICHELLE', phone: '667366639', state: 'Sheep' },
  { first_name: 'DANIEL', phone: '685201222', state: 'Sheep' },
  { first_name: 'WILFRID', phone: '685291486', state: 'Sheep' },
  { first_name: 'JORDAN', phone: '690213591', state: 'Sheep' },
  { first_name: 'BRICE', phone: '687848805', state: 'Sheep' },
  { first_name: 'AGNES', phone: '000000000', state: 'Sheep' },
  { first_name: 'Miguel', phone: '000000000', state: 'Sheep' },

  // GOATS
  { first_name: 'SUZANNE', phone: '668381834', state: 'Goat' },
  { first_name: 'MANUELLA', phone: '687544344', state: 'Goat' },
  { first_name: 'ETENSON', phone: '687803387', state: 'Goat' },
  { first_name: 'RAISSA', phone: '000000000', state: 'Goat' },
  { first_name: 'PRUDENCE', phone: '688781546', state: 'Goat' },
  { first_name: 'YVAN', phone: '681366646', state: 'Goat' },
  { first_name: 'Arsène FT', phone: '000000000', state: 'Goat' },
  { first_name: 'THIERRY', phone: '000000000', state: 'Goat' },
  { first_name: 'FRANK', phone: '000000000', state: 'Goat' },
  { first_name: 'DANIEL 2', phone: '000000000', state: 'Goat' },
  { first_name: 'ANGE', phone: '000000000', state: 'Goat' },
  { first_name: 'JONAS', phone: '687326845', state: 'Goat' },
  { first_name: 'JESSICA', phone: '691353623', state: 'Goat' },
  { first_name: 'MIKAEL', phone: '685800488', state: 'Goat' },
  { first_name: 'BRYAN', phone: '688573150', state: 'Goat' },
  { first_name: 'RYAN', phone: '688573150', state: 'Goat' },
  { first_name: 'DUVAL', phone: '682754422', state: 'Goat' },
  { first_name: 'JUSTIN', phone: '656469577', state: 'Goat' },
  { first_name: 'LEONCE', phone: '698351785', state: 'Goat' },
  { first_name: 'Julien', phone: '000000000', state: 'Goat' },
  { first_name: 'Roger', phone: '000000000', state: 'Goat' },
  { first_name: 'Benjamin', phone: '000000000', state: 'Goat' },
  { first_name: 'Princesse', phone: '000000000', state: 'Goat' },
  { first_name: 'Bryan 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Cedric', phone: '681497481', state: 'Goat' },
  { first_name: 'Amel', phone: '681334234', state: 'Goat' },
  { first_name: 'Franky', phone: '678393740', state: 'Goat' },
  { first_name: 'Junior', phone: '682405641', state: 'Goat' },

  // FIRST TIMERS (Mapped to Deer)
  { first_name: 'Lou', phone: '000000000', state: 'Deer' },
  { first_name: 'Martial', phone: '000000000', state: 'Deer' },
  { first_name: 'Paul', phone: '668854252', state: 'Deer' },
  { first_name: 'Marie', phone: '682593285', state: 'Deer' },
  { first_name: 'Leandre', phone: '688314553', state: 'Deer' },
  { first_name: 'Michel', phone: '683100810', state: 'Deer' },
  { first_name: 'Dave', phone: '618524036', state: 'Deer' },
  { first_name: 'Herve', phone: '680101537', state: 'Deer' },
  { first_name: 'Mama Seraphine', phone: '000000000', state: 'Deer' },
  { first_name: 'Stephanie', phone: '000000000', state: 'Deer' },
  { first_name: 'Emmanuel', phone: '000000000', state: 'Deer' },
  { first_name: 'Charlene', phone: '000000000', state: 'Deer' },
  { first_name: 'Evangline', phone: '000000000', state: 'Deer' },
  { first_name: 'Alida', phone: '000000000', state: 'Deer' },
  { first_name: 'John', phone: '666806445', state: 'Deer' },
  { first_name: 'Martial 2', phone: '683434320', state: 'Deer' },
  { first_name: 'Pretty', phone: '687379743', state: 'Deer' },
  { first_name: 'Cowan', phone: '680862785', state: 'Deer' },
  { first_name: 'Martin', phone: '615321156', state: 'Deer' },
  { first_name: 'Mohamed', phone: '672227706', state: 'Deer' },
  { first_name: 'Israel', phone: '000000000', state: 'Deer' },
  { first_name: 'Derrick', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Roanira', phone: '000000000', state: 'Deer' },
  { first_name: 'Jeremy', phone: '000000000', state: 'Deer' },
  { first_name: 'Martial 3', phone: '642404320', state: 'Deer' },

  { first_name: 'ERIKA', phone: '000000000', state: 'Deer' },
  { first_name: 'Christiane', phone: '000000000', state: 'Deer' },
  { first_name: 'STELLA', phone: '000000000', state: 'Deer' },
  { first_name: 'Eric', phone: '682590253', state: 'Deer' },
  { first_name: 'Dylan', phone: '650013338', state: 'Deer' },
  { first_name: 'Saurelle', phone: '659117638', state: 'Deer' },
  { first_name: 'Laure', phone: '690725160', state: 'Deer' },
  { first_name: 'Dany', phone: '000000000', state: 'Deer' },
  { first_name: 'Steve', phone: '657111239', state: 'Deer' },
  { first_name: 'Frank 2', phone: '657552113', state: 'Deer' },
  { first_name: 'Steve 2', phone: '655497514', state: 'Deer' },
  { first_name: 'Dylan 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Mathurin', phone: '000000000', state: 'Deer' },
  { first_name: 'Gabriel', phone: '000000000', state: 'Deer' },
  { first_name: 'Orianie', phone: '000000000', state: 'Deer' },
  { first_name: 'Nehemie', phone: '000000000', state: 'Deer' },
  { first_name: 'Kendall', phone: '000000000', state: 'Deer' },
  { first_name: 'Wilfried', phone: '000000000', state: 'Deer' },
  { first_name: 'Emmanuel 3', phone: '654435656', state: 'Deer' },
  { first_name: 'Laurice', phone: '000000000', state: 'Deer' },

  // FTS
  { first_name: 'Bonheur', phone: '000000000', state: 'Deer' },
  { first_name: 'Jean Marie', phone: '697155953', state: 'Deer' },
  { first_name: 'Phaen', phone: '000000000', state: 'Deer' },
  { first_name: 'Alex', phone: '000000000', state: 'Deer' },
  { first_name: 'Raissa', phone: '000000000', state: 'Deer' },
  { first_name: 'Steph', phone: '000000000', state: 'Deer' },
  { first_name: 'Diane', phone: '000000000', state: 'Deer' },
  { first_name: 'Romarique', phone: '671896583', state: 'Deer' },
  { first_name: 'Dylan 3', phone: '673701652', state: 'Deer' },
  { first_name: 'Cyril', phone: '699313240', state: 'Deer' },
  { first_name: 'Kevin', phone: '000000000', state: 'Deer' },
  { first_name: 'Joseph', phone: '651385988', state: 'Deer' },
  
  { first_name: 'Sammy', phone: '000000000', state: 'Deer' },
  { first_name: 'Israel 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Grace', phone: '000000000', state: 'Deer' },
  { first_name: 'Aristide', phone: '000000000', state: 'Deer' },
  { first_name: 'Becky', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandra', phone: '000000000', state: 'Deer' },
  { first_name: 'Gloria', phone: '000000000', state: 'Deer' },
  
  { first_name: 'JULIUS', phone: '000000000', state: 'Deer' },
  { first_name: 'Duval 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior 3', phone: '000000000', state: 'Deer' },
  { first_name: 'FELIX', phone: '000000000', state: 'Deer' },
  { first_name: 'EUNICE', phone: '000000000', state: 'Deer' },
  { first_name: 'VALERY', phone: '000000000', state: 'Deer' },
  { first_name: 'Becky 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Alfredo', phone: '000000000', state: 'Deer' },
  { first_name: 'Carine', phone: '000000000', state: 'Deer' },
  { first_name: 'Linda', phone: '000000000', state: 'Deer' },
  { first_name: 'Flore', phone: '000000000', state: 'Deer' },
  { first_name: 'Yannick', phone: '000000000', state: 'Deer' },

  { first_name: 'Ubright', phone: '000000000', state: 'Deer' },
  { first_name: 'Anthony', phone: '000000000', state: 'Deer' },
  { first_name: 'Modeste', phone: '000000000', state: 'Deer' },
  { first_name: 'Bestiane', phone: '000000000', state: 'Deer' },
  { first_name: 'Bety', phone: '000000000', state: 'Deer' },
  { first_name: 'Yann', phone: '000000000', state: 'Deer' },
  { first_name: 'Queendla', phone: '000000000', state: 'Deer' },
  { first_name: 'Nora', phone: '000000000', state: 'Deer' },
  { first_name: 'Eunice 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Karine', phone: '000000000', state: 'Deer' },
  { first_name: 'Eunice Mother', phone: '000000000', state: 'Deer' },
  { first_name: 'Eunice Sister', phone: '000000000', state: 'Deer' },
  { first_name: 'Kalyla', phone: '000000000', state: 'Deer' },
  { first_name: 'Boris', phone: '000000000', state: 'Deer' },
  { first_name: 'Beta', phone: '000000000', state: 'Deer' }
];

async function importEmmanuelMembers(emmanuelId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Gouverneur n a pas de area_id (zone) assignée. Impossible de créer des membres.' };
  }

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: 'Inconnu',
        phone_primary: m.phone,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: emmanuelId,
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

module.exports = { importEmmanuelMembers };
