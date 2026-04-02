const { Member } = require('../models');

const membersData = [
  { first_name: 'Hermann', phone: '000000000', state: 'Deer' },
  { first_name: 'Mark', phone: '695001625', state: 'Deer' },
  { first_name: 'William', phone: '672580977', state: 'Deer' },
  { first_name: 'Sonia', phone: '675966345', state: 'Deer' },

  { first_name: 'Patrick', phone: '651608256', state: 'Deer' },
  { first_name: 'Carine', phone: '000000000', state: 'Deer' },
  { first_name: 'Amiel', phone: '000000000', state: 'Deer' },
  { first_name: 'Bise', phone: '000000000', state: 'Deer' },
  { first_name: 'Gwladis', phone: '000000000', state: 'Deer' },
  { first_name: 'Princely', phone: '000000000', state: 'Deer' },
  { first_name: 'Fabiola', phone: '000000000', state: 'Deer' },
  { first_name: 'Faith', phone: '000000000', state: 'Deer' },
  { first_name: 'Kingsley', phone: '650000318', state: 'Deer' },
  { first_name: 'Nelly', phone: '674251206', state: 'Deer' },
  { first_name: 'Belise', phone: '651000661', state: 'Deer' },
  { first_name: 'Ludolf', phone: '672689582', state: 'Deer' },
  { first_name: 'Caros', phone: '670238120', state: 'Deer' },
  { first_name: 'Enok', phone: '000000000', state: 'Deer' },
  { first_name: 'Brutus', phone: '000000000', state: 'Deer' },
  { first_name: 'Evan', phone: '670542109', state: 'Deer' },
  { first_name: 'Blandine', phone: '000000000', state: 'Deer' },
  { first_name: 'Rodney', phone: '000000000', state: 'Deer' },
  { first_name: 'Gael', phone: '000000000', state: 'Deer' },
  { first_name: 'Corine', phone: '000000000', state: 'Deer' },
  { first_name: 'Emile', phone: '000000000', state: 'Deer' },
  { first_name: 'Nadège', phone: '000000000', state: 'Deer' },
  { first_name: 'Elvis', phone: '000000000', state: 'Deer' },
  { first_name: 'Ema', phone: '000000000', state: 'Deer' },
  { first_name: 'Elvira', phone: '000000000', state: 'Deer' },
  { first_name: 'Hermann 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Adu', phone: '000000000', state: 'Deer' },
  { first_name: 'Jea', phone: '000000000', state: 'Deer' },

  { first_name: 'Florentine', phone: '655261328', state: 'Deer' },

  { first_name: 'Nadege', phone: '000000000', state: 'Sheep' },
  { first_name: 'Marie', phone: '675662706', state: 'Goat' },
  { first_name: 'Josiah', phone: '695021381', state: 'Goat' },
  { first_name: 'Aimeouce', phone: '671070669', state: 'Goat' },

  { first_name: 'Michel', phone: '000000000', state: 'Deer' },
  { first_name: 'Emmanuelle', phone: '678012226', state: 'Deer' },
  { first_name: 'Gerard', phone: '000000000', state: 'Deer' },
  { first_name: 'Julie', phone: '000000000', state: 'Deer' },
  { first_name: 'Sharon', phone: '657805971', state: 'Deer' },
  { first_name: 'Josée', phone: '670154466', state: 'Deer' },
  { first_name: 'Claris', phone: '658112456', state: 'Deer' },
  { first_name: 'Abdoulaye', phone: '695002075', state: 'Deer' },
  { first_name: 'Gennesis', phone: '675003928', state: 'Deer' },
  { first_name: 'Gerard 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Israel', phone: '000000000', state: 'Deer' },
  { first_name: 'Judith', phone: '695576300', state: 'Deer' },
  { first_name: 'Nancy', phone: '677064312', state: 'Deer' },
  { first_name: 'Marius', phone: '671078713', state: 'Deer' },
  { first_name: 'Danis', phone: '695013252', state: 'Deer' },
  { first_name: 'Joyce', phone: '695192314', state: 'Deer' },
  { first_name: 'Gerard 3', phone: '000000000', state: 'Deer' },
  { first_name: 'Meliange', phone: '672841611', state: 'Deer' },
  { first_name: 'Yougouan', phone: '678042953', state: 'Deer' },
  { first_name: 'Alfred', phone: '695159372', state: 'Deer' },
  { first_name: 'Brlige', phone: '657156230', state: 'Deer' },
  { first_name: 'Ada', phone: '655581944', state: 'Deer' },
  { first_name: 'Carine 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Amiel 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Felix', phone: '675003290', state: 'Deer' },
  
  { first_name: 'Rely', phone: '000000000', state: 'Deer' },
  { first_name: 'Dominic', phone: '000000000', state: 'Deer' },
  { first_name: 'Precious', phone: '000000000', state: 'Deer' },

  { first_name: 'Mohamadou', phone: '695381254', state: 'Deer' },
  { first_name: 'Emmanuel', phone: '672002497', state: 'Deer' },
  { first_name: 'Jeanne', phone: '651102793', state: 'Deer' },
  { first_name: 'Becky Chamkcho', phone: '675001966', state: 'Deer' },
  { first_name: 'Josée 2', phone: '675525465', state: 'Deer' },
  { first_name: 'Julen', phone: '653160426', state: 'Deer' },
  { first_name: 'Rodriguez paul', phone: '653102144', state: 'Deer' },
  { first_name: 'Piax', phone: '675581896', state: 'Deer' },
  { first_name: 'Marvel', phone: '675581452', state: 'Deer' },
  { first_name: 'Fred', phone: '675003164', state: 'Deer' },
  { first_name: 'Cedric', phone: '675562134', state: 'Deer' },
  { first_name: 'Raoul', phone: '670566377', state: 'Deer' },
  { first_name: 'Matheo', phone: '651442080', state: 'Deer' },
  { first_name: 'Emmanuel 2', phone: '655451610', state: 'Deer' },
  { first_name: 'Felis', phone: '651262943', state: 'Deer' },
  { first_name: 'Donald', phone: '000000000', state: 'Deer' },
  { first_name: 'Idris', phone: '000000000', state: 'Deer' },

  { first_name: 'Terence', phone: '000000000', state: 'Deer' },

  { first_name: 'Aime', phone: '000000000', state: 'Sheep' },
  { first_name: 'Roselyn', phone: '000000000', state: 'Sheep' },

  { first_name: 'Calvain', phone: '000000000', state: 'Goat' },
  { first_name: 'Omega', phone: '677046294', state: 'Goat' },

  { first_name: 'Anna', phone: '000000000', state: 'Deer' },
  { first_name: 'Charles', phone: '000000000', state: 'Deer' },
  { first_name: 'Michael', phone: '000000000', state: 'Deer' },
  { first_name: 'Evelyne', phone: '000000000', state: 'Deer' },
  { first_name: 'Marin', phone: '000000000', state: 'Deer' },
  { first_name: 'Mael', phone: '000000000', state: 'Deer' },
  { first_name: 'Carle', phone: '000000000', state: 'Deer' },
  { first_name: 'Junior', phone: '000000000', state: 'Deer' },
  { first_name: 'Miha', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandrine', phone: '000000000', state: 'Deer' },
  { first_name: 'Soomo', phone: '000000000', state: 'Deer' },
  { first_name: 'James', phone: '000000000', state: 'Deer' },
  { first_name: 'Patience', phone: '000000000', state: 'Deer' },
  { first_name: 'Mestave', phone: '658079140', state: 'Deer' },
  { first_name: 'Price', phone: '000000000', state: 'Deer' },

  { first_name: 'Jaspen', phone: '655552358', state: 'Deer' },
  { first_name: 'Raoul 2', phone: '657560540', state: 'Deer' },
  { first_name: 'Marguerite', phone: '651460154', state: 'Deer' },
  { first_name: 'Nany Rose', phone: '651460321', state: 'Deer' },
  { first_name: 'Amina', phone: '691760321', state: 'Deer' },
  { first_name: 'Jezehine', phone: '651600311', state: 'Deer' },
  { first_name: 'Chau', phone: '695048254', state: 'Deer' },
  { first_name: 'Uctave', phone: '655014311', state: 'Deer' },
  { first_name: 'Cyril', phone: '657002061', state: 'Deer' },
  { first_name: 'Georgette', phone: '671827904', state: 'Deer' },
  { first_name: 'Ines', phone: '651602165', state: 'Deer' },
  { first_name: 'Dudley', phone: '671239454', state: 'Deer' },
  { first_name: 'Felix 2', phone: '651262943', state: 'Deer' },
  { first_name: 'Vante', phone: '000000000', state: 'Deer' },
  { first_name: 'Gili', phone: '000000000', state: 'Deer' },
  { first_name: 'Gift', phone: '000000000', state: 'Deer' },
  { first_name: 'Armel', phone: '000000000', state: 'Deer' },
  { first_name: 'Junaed', phone: '000000000', state: 'Deer' },
  { first_name: 'Invine', phone: '000000000', state: 'Deer' },
  { first_name: 'Cheila', phone: '000000000', state: 'Deer' },

  { first_name: 'Camille', phone: '673650300', state: 'Deer' },
  { first_name: 'Nany', phone: '673845300', state: 'Deer' },
  { first_name: 'Ouma', phone: '650057200', state: 'Deer' },
  { first_name: 'Maxwell', phone: '672704018', state: 'Deer' },
  { first_name: 'Mima', phone: '655075411', state: 'Deer' },

  { first_name: 'Elena', phone: '655143671', state: 'Deer' },
  { first_name: 'Arrey', phone: '000000000', state: 'Deer' },
  { first_name: 'Junaio', phone: '672217027', state: 'Deer' }
];

async function importPriscillaMembers(priscillaId, areaId) {
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
        leader_id: priscillaId,
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

module.exports = { importPriscillaMembers };
