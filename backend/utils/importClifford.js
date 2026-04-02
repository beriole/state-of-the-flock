// backend/utils/importClifford.js
const { Member } = require('../models');

const membersData = [
  // Sheep
  { first_name: 'Jimmy', phone: '000000000', state: 'Sheep' },
  { first_name: 'Argo', phone: '000000000', state: 'Sheep' },
  { first_name: 'Marlina', phone: '000000000', state: 'Sheep' },
  { first_name: 'Rodrigue', phone: '000000000', state: 'Sheep' },
  { first_name: 'Simon', phone: '000000000', state: 'Sheep' },
  { first_name: 'Vanessa Kananga', phone: '000000000', state: 'Sheep' },
  { first_name: 'Argo Nadanga', phone: '000000000', state: 'Sheep' },
  { first_name: 'Marlina 2', phone: '000000000', state: 'Sheep' },
  { first_name: 'Rosa Marie', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ghislain', phone: '000000000', state: 'Sheep' },
  { first_name: 'Hans', phone: '000000000', state: 'Sheep' },
  { first_name: 'Marcelle', phone: '000000000', state: 'Sheep' },
  { first_name: 'Pauline', phone: '000000000', state: 'Sheep' },
  { first_name: 'Yvonne', phone: '000000000', state: 'Sheep' },
  { first_name: 'Elsa', phone: '000000000', state: 'Sheep' },
  { first_name: 'Sharone', phone: '000000000', state: 'Sheep' },
  { first_name: 'Francina', phone: '000000000', state: 'Sheep' },
  { first_name: 'Landry', phone: '000000000', state: 'Sheep' },
  { first_name: 'Lina', phone: '000000000', state: 'Sheep' },
  { first_name: 'Jordan Kamga', phone: '000000000', state: 'Sheep' },
  { first_name: 'Enow', phone: '000000000', state: 'Sheep' },
  { first_name: 'Jonathan', phone: '000000000', state: 'Sheep' },
  { first_name: 'Mima Rachel', phone: '000000000', state: 'Sheep' },
  { first_name: 'Diana', phone: '656341419', state: 'Sheep' },

  // FT
  { first_name: 'Josian', phone: '680643806', state: 'Deer' },
  { first_name: 'Dany', phone: '698030942', state: 'Deer' },
  { first_name: 'Hillary', phone: '656041433', state: 'Deer' },
  { first_name: 'Aristide', phone: '656066470', state: 'Deer' },
  { first_name: 'Nelly', phone: '681363673', state: 'Deer' },
  { first_name: 'Samou', phone: '699363341', state: 'Deer' },
  { first_name: 'Allan Nkwame', phone: '679043545', state: 'Deer' },
  { first_name: 'Ngono Mama', phone: '679043545', state: 'Deer' },
  { first_name: 'Jimmy 2', phone: '680265784', state: 'Deer' },
  { first_name: 'Jane', phone: '658903490', state: 'Deer' },
  { first_name: 'Prochore', phone: '682501435', state: 'Deer' },
  { first_name: 'Enow 2', phone: '656315866', state: 'Deer' },
  { first_name: 'Landry 2', phone: '694580411', state: 'Deer' },
  { first_name: 'Blaise', phone: '650033005', state: 'Deer' },
  { first_name: 'Dany 2', phone: '698030948', state: 'Deer' },
  { first_name: 'Magloire', phone: '699318412', state: 'Deer' },
  { first_name: 'Amos', phone: '658737660', state: 'Deer' },
  { first_name: 'Courage', phone: '656560057', state: 'Deer' },
  { first_name: 'Priso', phone: '682734990', state: 'Deer' },
  { first_name: 'Nola', phone: '656134405', state: 'Deer' },
  { first_name: 'Cyrus', phone: '676236688', state: 'Deer' },
  { first_name: 'Amos FT', phone: '000000000', state: 'Deer' },
  { first_name: 'Nadine', phone: '653520547', state: 'Deer' },
  { first_name: 'Manuella ndem', phone: '656015509', state: 'Deer' },
  { first_name: 'Jodel', phone: '695722306', state: 'Deer' },
  { first_name: 'Rene', phone: '680193131', state: 'Deer' },
  { first_name: 'Tom fon', phone: '657140801', state: 'Deer' },
  { first_name: 'Yvonne 2', phone: '688401831', state: 'Deer' },
  { first_name: 'Carine', phone: '670693042', state: 'Deer' },
  { first_name: 'Emmanuel', phone: '681940556', state: 'Deer' },
  { first_name: 'Vanessa Kananga 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Argo Nadanga 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Marlina 3', phone: '000000000', state: 'Deer' },
  { first_name: 'Ghislain 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Hans 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Marcelle 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Argo 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Marlina 4', phone: '000000000', state: 'Deer' },
  { first_name: 'Jonathan 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Cyrus Amos', phone: '657685448', state: 'Deer' },
  { first_name: 'Anthony FT', phone: '656111863', state: 'Deer' },
  { first_name: 'Prendy', phone: '000000000', state: 'Deer' },
  { first_name: 'Nola 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Mola', phone: '656134434', state: 'Deer' },
  { first_name: 'Kelle', phone: '000000000', state: 'Deer' },
  { first_name: 'Salomon FT', phone: '652125568', state: 'Deer' },
  { first_name: 'Aristide FT', phone: '000000000', state: 'Deer' },
  { first_name: 'Lina FT', phone: '000000000', state: 'Deer' },
  { first_name: 'Prochore 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Nabel', phone: '000000000', state: 'Deer' },
  { first_name: 'Marlina 5', phone: '000000000', state: 'Deer' },
  { first_name: 'Gitane', phone: '652136015', state: 'Deer' },
  { first_name: 'Bryne', phone: '000000000', state: 'Deer' },
  { first_name: 'Madeleine', phone: '000000000', state: 'Deer' },
  { first_name: 'Prince', phone: '000000000', state: 'Deer' },
  { first_name: 'Amed', phone: '000000000', state: 'Deer' },
  { first_name: 'Rodrigue 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Jorel', phone: '000000000', state: 'Deer' },
  { first_name: 'Carlota', phone: '000000000', state: 'Deer' },
  { first_name: 'Blanche', phone: '000000000', state: 'Deer' },
  { first_name: 'Desiree', phone: '000000000', state: 'Deer' },
  { first_name: 'Aubiere', phone: '000000000', state: 'Deer' },
  { first_name: 'Gildas', phone: '000000000', state: 'Deer' },
  { first_name: 'Herveline', phone: '000000000', state: 'Deer' },
  { first_name: 'Loetic', phone: '000000000', state: 'Deer' },
  { first_name: 'Daniel', phone: '000000000', state: 'Deer' },
  { first_name: 'Arnod', phone: '000000000', state: 'Deer' },
  { first_name: 'Loic', phone: '000000000', state: 'Deer' },
  { first_name: 'Cyrinel', phone: '000000000', state: 'Deer' },
  { first_name: 'Dylane', phone: '000000000', state: 'Deer' },
  { first_name: 'Marcelle 3', phone: '000000000', state: 'Deer' },
  { first_name: 'Prince 2', phone: '000000000', state: 'Deer' },
  { first_name: 'William', phone: '000000000', state: 'Deer' },
  { first_name: 'Audrey', phone: '000000000', state: 'Deer' },
  { first_name: 'Aurelie', phone: '000000000', state: 'Deer' },
  { first_name: 'Gloire', phone: '000000000', state: 'Deer' },
  { first_name: 'Anea', phone: '000000000', state: 'Deer' },
  { first_name: 'Stanley', phone: '000000000', state: 'Deer' },
  { first_name: 'Nadine Sary', phone: '000000000', state: 'Deer' },
  { first_name: 'Kim', phone: '000000000', state: 'Deer' },
  { first_name: 'Fellina', phone: '000000000', state: 'Deer' },
  { first_name: 'Dmitry', phone: '000000000', state: 'Deer' },

  // Goat Group 1
  { first_name: 'Audrey 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Tom Terry', phone: '000000000', state: 'Goat' },
  { first_name: 'Junior Mbarga', phone: '000000000', state: 'Goat' },
  { first_name: 'Tombe regine', phone: '000000000', state: 'Goat' },
  { first_name: 'Tom Victoire', phone: '000000000', state: 'Goat' },
  { first_name: 'Gaelle', phone: '000000000', state: 'Goat' },
  { first_name: 'Gilles', phone: '000000000', state: 'Goat' },
  { first_name: 'Tombe Rayul', phone: '000000000', state: 'Goat' },
  { first_name: 'Tombe vious', phone: '000000000', state: 'Goat' },
  { first_name: 'Herve', phone: '000000000', state: 'Goat' },
  { first_name: 'Mirelle', phone: '000000000', state: 'Goat' },
  { first_name: 'Gaelle Fobasso', phone: '000000000', state: 'Goat' },

  // Goat Group 2
  { first_name: 'Carole', phone: '000000000', state: 'Goat' },
  { first_name: 'Bella Abega', phone: '000000000', state: 'Goat' },
  { first_name: 'Daline', phone: '000000000', state: 'Goat' },
  { first_name: 'Bralen', phone: '000000000', state: 'Goat' },
  { first_name: 'Mun', phone: '000000000', state: 'Goat' },
  { first_name: 'Joseph', phone: '000000000', state: 'Goat' },

  // Goat Group 3
  { first_name: 'Macelle', phone: '000000000', state: 'Goat' },
  { first_name: 'Emmanuel 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Precious', phone: '000000000', state: 'Goat' },
  { first_name: 'Leonel', phone: '000000000', state: 'Goat' },
  { first_name: 'Amos 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Lina 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Rodrigue 3', phone: '000000000', state: 'Goat' },

  // FT
  { first_name: 'Landry FT', phone: '000000000', state: 'Deer' },
  { first_name: 'Carlo', phone: '000000000', state: 'Deer' },
  { first_name: 'Flavien', phone: '000000000', state: 'Deer' },
  { first_name: 'Dedel', phone: '000000000', state: 'Deer' },

  // Goat Group 4
  { first_name: 'Shelsy', phone: '000000000', state: 'Goat' },
  { first_name: 'Jessika', phone: '000000000', state: 'Goat' },
  { first_name: 'Marie', phone: '000000000', state: 'Goat' },
  { first_name: 'Reine', phone: '000000000', state: 'Goat' },
  { first_name: 'Estelle', phone: '000000000', state: 'Goat' },
  { first_name: 'Kamil', phone: '000000000', state: 'Goat' },
  { first_name: 'Evelyne', phone: '000000000', state: 'Goat' },
  { first_name: 'Shinny', phone: '000000000', state: 'Goat' },
  { first_name: 'Carine 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Anthony', phone: '000000000', state: 'Goat' },
  { first_name: 'Pauline 2', phone: '000000000', state: 'Goat' },
  { first_name: 'Gae', phone: '673652848', state: 'Goat' },

  // FT
  { first_name: 'Estelle FT', phone: '000000000', state: 'Deer' }
];

async function importCliffordMembers(cliffordId, areaId) {
  let imported = 0;
  let skipped = 0;
  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: 'Inconnu',
        phone_primary: m.phone,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: cliffordId,
        is_active: true
      });
      imported++;
    } catch (error) {
      console.error(`Error importing ${m.first_name}:`, error.message);
      skipped++;
    }
  }
  return { imported, skipped, total: membersData.length };
}

module.exports = { importCliffordMembers };
