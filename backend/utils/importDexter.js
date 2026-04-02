const { Member } = require('../models');

const membersData = [
  { first_name: 'Lucy', phone: '650938302', state: 'Deer' },
  { first_name: 'Sherine', phone: '670047534', state: 'Deer' },
  { first_name: 'Gladys', phone: '697421056', state: 'Deer' },

  { first_name: 'Dana', phone: '000000000', state: 'Deer' },
  { first_name: 'Thevese', phone: '000000000', state: 'Deer' },
  { first_name: 'Claire', phone: '000000000', state: 'Deer' },
  { first_name: 'Angel', phone: '000000000', state: 'Deer' },
  { first_name: 'Cynthia', phone: '000000000', state: 'Deer' },
  { first_name: 'Bryana Tresor', phone: '602159449', state: 'Deer' },
  { first_name: 'Noel', phone: '000000000', state: 'Deer' },
  { first_name: 'Chris', phone: '000000000', state: 'Deer' },
  { first_name: 'Blaise', phone: '000000000', state: 'Deer' },
  { first_name: 'Ketty', phone: '000000000', state: 'Deer' },
  { first_name: 'Zeall', phone: '000000000', state: 'Deer' },
  { first_name: 'David', phone: '000000000', state: 'Deer' },
  { first_name: 'Yero', phone: '000000000', state: 'Deer' },
  { first_name: 'Wendy', phone: '000000000', state: 'Deer' },
  { first_name: 'Brandon', phone: '000000000', state: 'Deer' },
  { first_name: 'Blessing', phone: '677001531', state: 'Deer' },
  { first_name: 'Solange', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandrine', phone: '000000000', state: 'Deer' },
  { first_name: 'Lorren', phone: '000000000', state: 'Deer' },
  { first_name: 'Canchou', phone: '000000000', state: 'Deer' },
  { first_name: 'Gabby', phone: '000000000', state: 'Deer' },
  { first_name: 'Knight', phone: '000000000', state: 'Deer' },
  { first_name: 'Bella', phone: '000000000', state: 'Deer' },
  { first_name: 'Clara', phone: '682515792', state: 'Deer' },
  { first_name: 'Ngalim Christian', phone: '678125838', state: 'Deer' },

  { first_name: 'Princess', phone: '000000000', state: 'First Timer' },
  { first_name: 'Gael', phone: '000000000', state: 'First Timer' },
  { first_name: 'Damaris', phone: '000000000', state: 'First Timer' },
  { first_name: 'Vanessa', phone: '000000000', state: 'First Timer' },
  { first_name: 'Sherife', phone: '000000000', state: 'First Timer' },
  { first_name: 'Gezil', phone: '000000000', state: 'First Timer' },
  { first_name: 'Emmanuel', phone: '000000000', state: 'First Timer' },
  { first_name: 'Nforba', phone: '000000000', state: 'First Timer' },
  { first_name: 'Sonia', phone: '000000000', state: 'First Timer' },
  { first_name: 'Bless', phone: '000000000', state: 'First Timer' },
  { first_name: 'Michelle', phone: '000000000', state: 'First Timer' },
  { first_name: 'Angel 2', phone: '000000000', state: 'First Timer' },
  { first_name: 'Julienne', phone: '000000000', state: 'First Timer' },
  { first_name: 'Stephan', phone: '000000000', state: 'First Timer' },
  { first_name: 'Betilia', phone: '000000000', state: 'First Timer' },
  { first_name: 'James', phone: '000000000', state: 'First Timer' },
  { first_name: 'Chole', phone: '000000000', state: 'First Timer' },
  { first_name: 'Tresor', phone: '672159447', state: 'First Timer' },
  { first_name: 'Clark', phone: '000000000', state: 'First Timer' },
  { first_name: 'Olive', phone: '680122557', state: 'First Timer' },
  { first_name: 'Majelle', phone: '000000000', state: 'First Timer' },
  { first_name: 'Clify Kerry', phone: '654453035', state: 'First Timer' },

  { first_name: 'Destiny', phone: '652062952', state: 'Deer' },

  { first_name: 'Fumane', phone: '000000000', state: 'Deer' },
  { first_name: 'Davina', phone: '000000000', state: 'Deer' },
  { first_name: 'confort', phone: '000000000', state: 'Deer' },
  { first_name: 'Alice', phone: '000000000', state: 'Deer' },
  { first_name: 'Confort clodine', phone: '000000000', state: 'Deer' },
  { first_name: 'Vera', phone: '000000000', state: 'Deer' },
  { first_name: 'Flora', phone: '000000000', state: 'Deer' },
  { first_name: 'SARa', phone: '000000000', state: 'Deer' },
  { first_name: 'Fortune', phone: '000000000', state: 'Deer' },
  { first_name: 'Danielle', phone: '000000000', state: 'Deer' },

  { first_name: 'Jorvia', phone: '653015951', state: 'Deer' },
  { first_name: 'Michelle', phone: '000000000', state: 'Deer' },

  { first_name: 'Shekina', phone: '674070289', state: 'Deer' },
  { first_name: 'Amie', phone: '000000000', state: 'Deer' },
  { first_name: 'Brenda', phone: '675880440', state: 'Deer' },
  { first_name: 'Kila', phone: '679259165', state: 'Deer' },

  { first_name: 'Muriel', phone: '659508585', state: 'Deer' },

  { first_name: 'Blanche', phone: '000000000', state: 'Deer' },
  { first_name: 'Raissa', phone: '655042521', state: 'Deer' },
  { first_name: 'Favour Missom', phone: '000000000', state: 'Deer' },
  { first_name: 'Georgette', phone: '000000000', state: 'Deer' },

  { first_name: 'Stone', phone: '000000000', state: 'Deer' },
  { first_name: 'Precious', phone: '000000000', state: 'Deer' },
  { first_name: 'Nancy', phone: '000000000', state: 'Deer' },
  { first_name: 'Kelly', phone: '000000000', state: 'Deer' },
  { first_name: 'Noella', phone: '000000000', state: 'Deer' },
  { first_name: 'Chris 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Chidi', phone: '651045125', state: 'Deer' },
  { first_name: 'Kingsley', phone: '670382093', state: 'Deer' },
  { first_name: 'Doris', phone: '673367025', state: 'Deer' },
  { first_name: 'Jennifer', phone: '673387025', state: 'Deer' },
  { first_name: 'Aisia', phone: '655601300', state: 'Deer' },
  { first_name: 'Carlisle', phone: '677142445', state: 'Deer' },
  { first_name: 'Davina 2', phone: '688651330', state: 'Deer' },
  { first_name: 'Princewill', phone: '673878555', state: 'Deer' },
  { first_name: 'Apollonair', phone: '000000000', state: 'Deer' },
  { first_name: 'Marianbelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Arrey Princewill', phone: '673878588', state: 'Deer' },
  { first_name: 'Bryana Tresor 2', phone: '000000000', state: 'Deer' },
];

async function importDexterMembers(dexterId, areaId) {
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
        leader_id: dexterId,
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

module.exports = { importDexterMembers };
