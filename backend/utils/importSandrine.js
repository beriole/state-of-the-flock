// backend/utils/importSandrine.js
const { Member } = require('../models');

const membersData = [
  // Block 1 (Sheep)
  { first_name: 'Christian Nnanga', phone: '000000000', state: 'Sheep' },
  { first_name: 'Christian Nnanga 2', phone: '000000000', state: 'Sheep' },
  { first_name: 'Celine', phone: '000000000', state: 'Sheep' },
  { first_name: 'Lydiane', phone: '000000000', state: 'Sheep' },
  { first_name: 'Eveline', phone: '000000000', state: 'Sheep' },
  { first_name: 'Amstrong', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ruth', phone: '690981040', state: 'Sheep' },
  { first_name: 'Alex', phone: '000000000', state: 'Sheep' },

  // Block 2 (Deer)
  { first_name: 'Frieda', phone: '655421763', state: 'Deer' },
  { first_name: 'Francis', phone: '000000000', state: 'Deer' },
  { first_name: 'Renrick', phone: '000000000', state: 'Deer' },
  { first_name: 'Mogue', phone: '000000000', state: 'Deer' },
  { first_name: 'Dante', phone: '652936284', state: 'Deer' },
  { first_name: 'Denis', phone: '000000000', state: 'Deer' },
  { first_name: 'Rubby', phone: '000000000', state: 'Deer' },
  { first_name: 'Mvengue', phone: '000000000', state: 'Deer' },
  { first_name: 'Mariana', phone: '000000000', state: 'Deer' },
  { first_name: 'Jeremie', phone: '000000000', state: 'Deer' },
  { first_name: 'Nourreth', phone: '671495811', state: 'Deer' },
  { first_name: 'Melan', phone: '000000000', state: 'Deer' },
  { first_name: 'Emmanuel', phone: '000000000', state: 'Deer' },
  { first_name: 'Bercin', phone: '000000000', state: 'Deer' },
  { first_name: 'Manu', phone: '695832341', state: 'Deer' },
  { first_name: 'Clemide', phone: '693498343', state: 'Deer' },
  { first_name: 'Estelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Patrick', phone: '654152864', state: 'Deer' },
  { first_name: 'Lorna', phone: '000000000', state: 'Deer' },
  { first_name: 'Emmanuel 2', phone: '691763462', state: 'Deer' },
  { first_name: 'Wilfre', phone: '678123743', state: 'Deer' },
  { first_name: 'Audrey', phone: '000000000', state: 'Deer' },
  { first_name: 'Cress', phone: '692874051', state: 'Deer' },
  { first_name: 'Caroline', phone: '000000000', state: 'Deer' },
  { first_name: 'Lydia', phone: '000000000', state: 'Deer' },
  { first_name: 'Vivian', phone: '000000000', state: 'Deer' },
  { first_name: 'Laure', phone: '000000000', state: 'Deer' },
  { first_name: 'Bright', phone: '000000000', state: 'Deer' },
  { first_name: 'Adeline', phone: '681403041', state: 'Deer' },
  { first_name: 'Carine', phone: '000000000', state: 'Deer' },
  { first_name: 'Allan', phone: '000000000', state: 'Deer' },
  { first_name: 'Eva', phone: '696461325', state: 'Deer' },
  { first_name: 'Mila', phone: '000000000', state: 'Deer' },
  { first_name: 'Vianney', phone: '000000000', state: 'Deer' },
  { first_name: 'Mvoh', phone: '000000000', state: 'Deer' },
  { first_name: 'Bryan', phone: '000000000', state: 'Deer' },
  { first_name: 'Chima', phone: '652951660', state: 'Deer' },
  { first_name: 'Bih mary', phone: '677655848', state: 'Deer' },
  { first_name: 'wilfried', phone: '000000000', state: 'Deer' },
  { first_name: 'Oriane', phone: '000000000', state: 'Deer' },
  { first_name: 'Deco', phone: '000000000', state: 'Deer' },
  { first_name: 'Chest', phone: '000000000', state: 'Deer' },
  { first_name: 'LAetitia', phone: '000000000', state: 'Deer' },
  { first_name: 'Christian Nnanga 3', phone: '000000000', state: 'Deer' },
  { first_name: 'Jules', phone: '000000000', state: 'Deer' },
  { first_name: 'Arnno', phone: '000000000', state: 'Deer' },
  { first_name: 'Mathias', phone: '000000000', state: 'Deer' },
  { first_name: 'Diane', phone: '000000000', state: 'Deer' },
  { first_name: 'Chelsea', phone: '000000000', state: 'Deer' },
  { first_name: 'Antonia', phone: '000000000', state: 'Deer' },
  { first_name: 'Shalom', phone: '000000000', state: 'Deer' },
  { first_name: 'Laetitia 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Cedric', phone: '000000000', state: 'Deer' },
  { first_name: 'Geny', phone: '000000000', state: 'Deer' },
  { first_name: 'Steve', phone: '693361832', state: 'Deer' },
  { first_name: 'Felix', phone: '000000000', state: 'Deer' },
  { first_name: 'Odeline', phone: '000000000', state: 'Deer' },
  { first_name: 'stanley 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Francelin ft', phone: '651262797', state: 'Deer' },
  { first_name: 'Ruth ft', phone: '653861216', state: 'Deer' },
  { first_name: 'Josiane', phone: '000000000', state: 'Deer' },
  { first_name: 'Victor', phone: '653654519', state: 'Deer' },
  { first_name: 'Edwige', phone: '679461056', state: 'Deer' },
  { first_name: 'LAURA', phone: '655651244', state: 'Deer' },
  { first_name: 'Clemis', phone: '672106321', state: 'Deer' },
  { first_name: 'Sonia', phone: '691865768', state: 'Deer' },
  { first_name: 'loic', phone: '674900595', state: 'Deer' },
  { first_name: 'eugene', phone: '651059134', state: 'Deer' },
  { first_name: 'Theophile', phone: '691958662', state: 'Deer' },
  { first_name: 'Jared', phone: '673456387', state: 'Deer' },
  { first_name: 'Lydia 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Anna Julie', phone: '000000000', state: 'Deer' },
  { first_name: 'Patience', phone: '676227464', state: 'Deer' },
  { first_name: 'Eric', phone: '695651921', state: 'Deer' },
  { first_name: 'Tony', phone: '698651921', state: 'Deer' },
  { first_name: 'Herve', phone: '651651921', state: 'Deer' },
  { first_name: 'Tatiana', phone: '000000000', state: 'Deer' },
  { first_name: 'Julien', phone: '000000000', state: 'Deer' },
  { first_name: 'sami', phone: '000000000', state: 'Deer' },
  { first_name: 'HENRY', phone: '000000000', state: 'Deer' },
  { first_name: 'Dany blue', phone: '620340523', state: 'Deer' },
  { first_name: 'Gisele', phone: '000000000', state: 'Deer' },
  { first_name: 'Romio', phone: '695661294', state: 'Deer' },
  { first_name: 'Pauline', phone: '000000000', state: 'Deer' },
  { first_name: 'Arnaud', phone: '000000000', state: 'Deer' },
  { first_name: 'Munang', phone: '000000000', state: 'Deer' },
  { first_name: 'Nelson 1', phone: '000000000', state: 'Deer' },
  { first_name: 'Ryan', phone: '000000000', state: 'Deer' },
  { first_name: 'Erico', phone: '000000000', state: 'Deer' },
  { first_name: 'Maria Goly Obono', phone: '000000000', state: 'Deer' },
  { first_name: 'Maik', phone: '677447978', state: 'Deer' },
  { first_name: 'Lelo 2', phone: '698124500', state: 'Deer' },
  { first_name: 'Enou', phone: '000000000', state: 'Deer' },
  { first_name: 'Gerard', phone: '000000000', state: 'Deer' },

  // Block 3 (Sheep)
  { first_name: 'Alain', phone: '000000000', state: 'Sheep' },
  { first_name: 'Lucrece', phone: '000000000', state: 'Sheep' },
  { first_name: 'Serges', phone: '000000000', state: 'Sheep' },
  { first_name: 'Maix', phone: '000000000', state: 'Sheep' },
  { first_name: 'Dominique', phone: '000000000', state: 'Sheep' },
  { first_name: 'Bertha', phone: '000000000', state: 'Sheep' },
  { first_name: 'Lilli', phone: '697011928', state: 'Sheep' },
  { first_name: 'Evandia Anna', phone: '653422016', state: 'Sheep' },
  { first_name: 'Leat Tende', phone: '000000000', state: 'Sheep' },

  // Block 4 (Deer)
  { first_name: 'Noel', phone: '000000000', state: 'Deer' },
  { first_name: 'Mado', phone: '000000000', state: 'Deer' },
  { first_name: 'Daniel', phone: '693242643', state: 'Deer' },
  { first_name: 'Elsa', phone: '000000000', state: 'Deer' },
  { first_name: 'Eloko', phone: '000000000', state: 'Deer' },
  { first_name: 'Ively', phone: '000000000', state: 'Deer' },

  // Block 5 (Sheep)
  { first_name: 'Shane', phone: '000000000', state: 'Sheep' },
  { first_name: 'Eleanor', phone: '000000000', state: 'Sheep' },

  // Block 6 (Deer)
  { first_name: 'Edgard', phone: '000000000', state: 'Deer' },
  { first_name: 'Ocean', phone: '000000000', state: 'Deer' },
  { first_name: 'Lenor', phone: '000000000', state: 'Deer' },
  { first_name: 'Janye', phone: '000000000', state: 'Deer' },
  { first_name: 'Briyan', phone: '000000000', state: 'Deer' },
  { first_name: 'Merveille', phone: '000000000', state: 'Deer' },
  { first_name: 'Aline', phone: '000000000', state: 'Deer' },
  { first_name: 'Oriane 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Deborah', phone: '000000000', state: 'Deer' },
  { first_name: 'Abigaelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Baman', phone: '000000000', state: 'Deer' },
  { first_name: 'Jedidjah', phone: '000000000', state: 'Deer' },

  // Block 7 (Goat)
  { first_name: 'Tiffany', phone: '651115206', state: 'Goat' },
  { first_name: 'Ricky', phone: '673390965', state: 'Goat' },
  { first_name: 'Lionel', phone: '653551336', state: 'Goat' },
  { first_name: 'Miludi', phone: '653550489', state: 'Goat' },
  { first_name: 'Diane 2', phone: '673344171', state: 'Goat' },
  { first_name: 'William', phone: '673502808', state: 'Goat' },
  { first_name: 'Hilda', phone: '651441359', state: 'Goat' },
  { first_name: 'Hazel', phone: '654728525', state: 'Goat' },
  { first_name: 'Gabriel', phone: '653856230', state: 'Goat' },
  { first_name: 'Garius', phone: '652648203', state: 'Goat' },
  { first_name: 'Martial', phone: '022509856416', state: 'Goat' },
  { first_name: 'Perga', phone: '672584210', state: 'Goat' },
  { first_name: 'Reine', phone: '652718313', state: 'Goat' },
  { first_name: 'Cyril', phone: '693356059', state: 'Goat' },
  { first_name: 'Flavia', phone: '653644368', state: 'Goat' },
  { first_name: 'Tanya', phone: '653641880', state: 'Goat' },
  { first_name: 'Bernede', phone: '673550264', state: 'Goat' },
  { first_name: 'Pavel', phone: '652150766', state: 'Goat' },
  { first_name: 'Blanch', phone: '699411985', state: 'Goat' },
  { first_name: 'Blaise', phone: '678041019', state: 'Goat' },
  { first_name: 'Louis', phone: '671441813', state: 'Goat' },
  { first_name: 'Sara', phone: '679353316', state: 'Goat' },
  { first_name: 'Ariel', phone: '674759604', state: 'Goat' },
  { first_name: 'Sandra', phone: '673665442', state: 'Goat' },
  { first_name: 'Jenny', phone: '678488518', state: 'Goat' },
  { first_name: 'Maikel', phone: '682447955', state: 'Goat' },
  { first_name: 'Jemila', phone: '652705664', state: 'Goat' },
  { first_name: 'Milani', phone: '695147330', state: 'Goat' },
  { first_name: 'Damaris', phone: '695147330', state: 'Goat' },
  { first_name: 'Felic ff', phone: '000000000', state: 'Goat' },
  { first_name: 'Malvis ff', phone: '000000000', state: 'Goat' },
  { first_name: 'Michael 3', phone: '000000000', state: 'Goat' },
  { first_name: 'Lemerice ft', phone: '000000000', state: 'Goat' },
  { first_name: 'Marie ft', phone: '000000000', state: 'Goat' },
  { first_name: 'Rijouill ft', phone: '000000000', state: 'Goat' },
  { first_name: 'Richen ft', phone: '000000000', state: 'Goat' },
  { first_name: 'Lenor ft', phone: '000000000', state: 'Goat' },
  { first_name: 'Joanie', phone: '000000000', state: 'Goat' },
  { first_name: 'Germain', phone: '000000000', state: 'Goat' },
  { first_name: 'Fatima', phone: '000000000', state: 'Goat' },
  { first_name: 'Odilia', phone: '000000000', state: 'Goat' },
  { first_name: 'Christian num', phone: '000000000', state: 'Goat' },
  { first_name: 'Nelson 2', phone: '000000000', state: 'Goat' },
  { first_name: 'cynthia', phone: '000000000', state: 'Goat' },
  { first_name: 'Prince', phone: '623455930', state: 'Goat' },
  { first_name: 'Boella', phone: '000000000', state: 'Goat' },
  { first_name: 'Michael 4', phone: '000000000', state: 'Goat' },
  { first_name: 'Paul', phone: '692133629', state: 'Goat' },
  { first_name: 'David', phone: '650421140', state: 'Goat' }
];

async function importSandrineMembers(sandrineId, areaId) {
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
        leader_id: sandrineId,
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

module.exports = { importSandrineMembers };
