// backend/utils/importAnnie.js
const { Member } = require('../models');

const membersData = [
  // Groupe 1 (Sheep)
  { first_name: 'Christelle', last_name: '', phone: '683537068', state: 'Sheep' },
  { first_name: 'Leonnel', last_name: '', phone: '697356056', state: 'Sheep' },
  { first_name: 'Julienne', last_name: '', phone: '659336593', state: 'Sheep' },
  { first_name: 'Andrea', last_name: '', phone: '692993634', state: 'Sheep' },
  { first_name: 'Claire', last_name: '', phone: '658722319', state: 'Sheep' },
  { first_name: 'Gaby', last_name: '', phone: '693823398', state: 'Sheep' },
  { first_name: 'Lucy', last_name: '', phone: '697405465', state: 'Sheep' },
  { first_name: 'Jenny', last_name: 'mimboman', phone: '675308852', state: 'Sheep' },
  { first_name: 'Emmanuelle', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Precious', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Trésor', last_name: 'Ekounou', phone: '686198737', state: 'Sheep' },
  { first_name: 'Carista', last_name: '', phone: '690050759', state: 'Sheep' },
  { first_name: 'Samuel', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Prince', last_name: 'noel', phone: '000000000', state: 'Sheep' },
  { first_name: 'Rodrigue', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Steve', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Leonel', last_name: 'Ekounou', phone: '691330990', state: 'Sheep' },
  { first_name: 'Merveille', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Cliford', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Donald', last_name: 'Awae', phone: '658942753', state: 'Sheep' },
  { first_name: 'Fidele', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Sharone', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Louis', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Prestone', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Sharon', last_name: '2', phone: '000000000', state: 'Sheep' },
  { first_name: 'Joseph', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Bénis', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Marie', last_name: 'Bell', phone: '000000000', state: 'Sheep' },
  { first_name: 'Alice', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Fiona', last_name: 'Nkomo', phone: '000000000', state: 'Sheep' },
  { first_name: 'Boris', last_name: 'ATanga', phone: '000000000', state: 'Sheep' },
  { first_name: 'Emilie', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Jordan', last_name: 'kumbe', phone: '000000000', state: 'Sheep' },
  { first_name: 'Shalom', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Alain', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Tresor', last_name: '2', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ndoumbe', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Landry', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Mateke', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Essam', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Claude', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Divinateur', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ottou', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Double', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Karmel', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Bryan', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Meniengue', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Daniel', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Ange', last_name: '', phone: '000000000', state: 'Sheep' },
  { first_name: 'Pauline', last_name: '', phone: '672112354', state: 'Sheep' },

  // Groupe 2 (Deer)
  { first_name: 'Basile', last_name: '', phone: '650569918', state: 'Deer' },
  { first_name: 'Julienne', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Tresor', last_name: '', phone: '698477730', state: 'Deer' },
  { first_name: 'Stecy', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Pharelle', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Miguel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Ryan', last_name: '', phone: '695707434', state: 'Deer' },
  { first_name: 'Kurtis', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Salomon', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Aristide', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Reine', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Samira', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Marie', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Lucy', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Merveille', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Gaby', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Andrea', last_name: '2', phone: '000000000', state: 'Deer' },
  { first_name: 'Mikel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Daniela', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Claire', last_name: '2', phone: '690846643', state: 'Deer' },
  { first_name: 'Lionel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Astride', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'René', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'La Grâce', last_name: '', phone: '000000000', state: 'Deer' },

  // FT (Deer)
  { first_name: 'Alain (FT)', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Francoise (FT)', last_name: '', phone: '659454590', state: 'Deer' },
  { first_name: 'Ndong', last_name: '', phone: '690777020', state: 'Deer' },
  { first_name: 'Yvan', last_name: '', phone: '658430818', state: 'Deer' },
  { first_name: 'Cedrick', last_name: '', phone: '693127058', state: 'Deer' },
  { first_name: 'Joel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Clara', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Brenda', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Divine', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Mvondo', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Flaura', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Jessica', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Estelle', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Rolex', last_name: '', phone: '691254432', state: 'Deer' },
  { first_name: 'Bekale', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Anderson', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Cabrel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Chancel', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Asanly', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Freddy', last_name: '', phone: '000000000', state: 'Deer' },
  { first_name: 'Borel', last_name: '', phone: '000000000', state: 'Deer' }
];

async function importAnnieMembers(annieId, areaId) {
  let imported = 0;
  let skipped = 0;

  for (const m of membersData) {
    try {
      await Member.create({
        first_name: m.first_name,
        last_name: m.last_name || 'Inconnu',
        phone_primary: m.phone,
        gender: 'Unknown',
        state: m.state,
        area_id: areaId,
        leader_id: annieId,
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

module.exports = { importAnnieMembers };
