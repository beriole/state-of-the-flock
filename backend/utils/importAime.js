const { Member } = require('../models');

const membersData = [
  { first_name: 'FLAURENTINE', phone: '699496686', state: 'Sheep' },
  { first_name: 'Auguste', phone: '658564450', state: 'Sheep' },
  { first_name: 'Hilaire', phone: '000000000', state: 'Sheep' },
  { first_name: 'Paul ondon', phone: '690951603', state: 'Sheep' },
  { first_name: 'Sarah Rose', phone: '675126484', state: 'Sheep' },
  { first_name: 'Sandra', phone: '673165829', state: 'Sheep' },
  { first_name: 'Shekina', phone: '657221536', state: 'Sheep' },
  { first_name: 'Mavne', phone: '696001287', state: 'Sheep' },
  { first_name: 'Florian', phone: '657394785', state: 'Sheep' },
  { first_name: 'Nelson', phone: '690214151', state: 'Sheep' },
  { first_name: 'Thierry', phone: '690348300', state: 'Sheep' },
  { first_name: 'Raissa', phone: '000000000', state: 'Sheep' },
  { first_name: 'Mama Deborah', phone: '676481647', state: 'Sheep' },
  { first_name: 'ABDIAS', phone: '696366120', state: 'Sheep' },

  { first_name: 'NAOMI', phone: '693024157', state: 'Goat' },
  { first_name: 'THERESE', phone: '658041647', state: 'Goat' },
  { first_name: 'THIERY', phone: '655754366', state: 'Goat' },
  { first_name: 'THERESE SISTER', phone: '000000000', state: 'Goat' },
  { first_name: 'MERVEILLE', phone: '658612173', state: 'Goat' },
  { first_name: 'Blanche', phone: '000000000', state: 'Goat' },
  { first_name: 'Marie', phone: '697836637', state: 'Goat' },
  { first_name: 'Marguerite', phone: '000000000', state: 'Goat' },
  { first_name: 'Arthur', phone: '000000000', state: 'Goat' },
  { first_name: 'Geovanny', phone: '654002376', state: 'Goat' },
  { first_name: 'Valentine', phone: '658061692', state: 'Goat' },
  { first_name: 'Keziah', phone: '659306096', state: 'Goat' },
  { first_name: 'Roger FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Wisdom Ft', phone: '000000000', state: 'First Timer' },
  { first_name: 'Parfait', phone: '000000000', state: 'Goat' },
  { first_name: 'Julie', phone: '000000000', state: 'Goat' },
  { first_name: 'Wilfried FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Christelle', phone: '000000000', state: 'Goat' },

  { first_name: 'FELICITE', phone: '000000000', state: 'Deer' },
  { first_name: 'HARMON E', phone: '695425485', state: 'Deer' },
  { first_name: 'VERONIQUE', phone: '000000000', state: 'Deer' },
  { first_name: 'CHRISTEL', phone: '652056175', state: 'Deer' },
  { first_name: 'Jerry', phone: '678609489', state: 'Deer' },
  { first_name: 'Abou', phone: '000000000', state: 'Deer' },
  { first_name: 'Sarah', phone: '699401605', state: 'Deer' },
  { first_name: 'EDIMA', phone: '000000000', state: 'Deer' },
  { first_name: 'PATRICIA', phone: '640913254', state: 'Deer' },
  { first_name: 'DIMITRI', phone: '000000000', state: 'Deer' },
  { first_name: 'JOEL', phone: '697047689', state: 'Deer' },
  { first_name: 'Mireille FT', phone: '696062657', state: 'First Timer' },
  { first_name: 'Marvel FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Roxanne FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Anna', phone: '673107408', state: 'Deer' },
  { first_name: 'Daniel', phone: '672051663', state: 'Deer' },
  { first_name: 'Nina', phone: '670017164', state: 'Deer' },
  { first_name: 'Corine', phone: '698306289', state: 'Deer' },
  { first_name: 'Therese 2', phone: '697056579', state: 'Deer' },
  { first_name: 'Lindsay', phone: '678021798', state: 'Deer' },
  { first_name: 'Nnanga', phone: '699575568', state: 'Deer' },
  { first_name: 'Desmon', phone: '670036377', state: 'Deer' },
  { first_name: 'Sandra 2', phone: '697466675', state: 'Deer' },
  { first_name: 'Willy', phone: '000000000', state: 'Deer' },
  { first_name: 'Cédric', phone: '000000000', state: 'Deer' },
  { first_name: 'Gabriel', phone: '000000000', state: 'Deer' },
  { first_name: 'Noel', phone: '678811164', state: 'Deer' },
  { first_name: 'Daniel 2', phone: '672051663', state: 'Deer' },
  { first_name: 'Karen', phone: '000000000', state: 'Deer' },
  { first_name: 'Cedric 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Crispin', phone: '000000000', state: 'Deer' },
  { first_name: 'Marie 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Felicite 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Dany', phone: '653211040', state: 'Deer' },
  { first_name: 'Abraham', phone: '000000000', state: 'Deer' },
  { first_name: 'Jemima', phone: '677524223', state: 'Deer' },
  { first_name: 'Estrella', phone: '658813662', state: 'Deer' },
  { first_name: 'Blessing', phone: '000000000', state: 'Deer' },
  { first_name: 'Kesh', phone: '672516174', state: 'Deer' },
  { first_name: 'Raizel', phone: '674523702', state: 'Deer' },
  { first_name: 'Brayan', phone: '000000000', state: 'Deer' },
  { first_name: 'Jonahim', phone: '000000000', state: 'Deer' },
  { first_name: 'Clementine Ndze', phone: '000000000', state: 'Deer' },
  
  { first_name: 'MRS AKWE', phone: '697516836', state: 'Sheep' },
  { first_name: 'NDAMI BESSEM', phone: '682607900', state: 'Sheep' },
  { first_name: 'BARBIE', phone: '695466331', state: 'Sheep' },
  { first_name: 'DAVID', phone: '670100425', state: 'Sheep' },
  { first_name: 'Georget', phone: '000000000', state: 'Sheep' },

  { first_name: 'FRANK', phone: '654997848', state: 'Goat' },
  { first_name: 'Franklin', phone: '000000000', state: 'Goat' },
  { first_name: 'Goodness', phone: '000000000', state: 'Goat' },
  { first_name: 'Wisdom', phone: '000000000', state: 'Goat' },
  { first_name: 'Clarisse', phone: '000000000', state: 'Goat' },
  { first_name: 'Vicky', phone: '000000000', state: 'Goat' },
  { first_name: 'Ode', phone: '000000000', state: 'Goat' },
  { first_name: 'Jane', phone: '000000000', state: 'Goat' },

  { first_name: 'JOEL 2', phone: '000000000', state: 'Deer' },
  { first_name: 'FRANCO S', phone: '000000000', state: 'Deer' },
  { first_name: 'MONIQUE', phone: '000000000', state: 'Deer' },
  { first_name: 'BRYAN', phone: '000000000', state: 'Deer' },
  { first_name: 'blessing 2', phone: '000000000', state: 'Deer' },
  { first_name: 'FRANKLIN 2', phone: '000000000', state: 'Deer' },
  { first_name: 'JOEL 3', phone: '000000000', state: 'Deer' },
  { first_name: 'AARON', phone: '000000000', state: 'Deer' },
  { first_name: 'TALINA', phone: '693910623', state: 'Deer' },
  { first_name: 'TATIANA', phone: '655006600', state: 'Deer' },
  { first_name: 'JEAN', phone: '676109765', state: 'Deer' },
  { first_name: 'HARRY', phone: '000000000', state: 'Deer' },
  { first_name: 'BRYAN 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Faith', phone: '000000000', state: 'Deer' },
  { first_name: 'Mama Lucy', phone: '000000000', state: 'Deer' },
  { first_name: 'Franck brother', phone: '000000000', state: 'Deer' },
  { first_name: 'Yvan', phone: '000000000', state: 'Deer' },
  { first_name: 'DIVINE', phone: '657516503', state: 'Deer' },
  { first_name: 'FRANCK', phone: '695096678', state: 'Deer' },
  { first_name: 'AMINA', phone: '696662021', state: 'Deer' },
  { first_name: 'ROMÉO', phone: '658094588', state: 'Deer' },
  { first_name: 'Daryl', phone: '000000000', state: 'Deer' },
  { first_name: 'Jean 2', phone: '000000000', state: 'Deer' },
  { first_name: 'Rejoice', phone: '000000000', state: 'Deer' },
  { first_name: 'Glory', phone: '000000000', state: 'Deer' },

  { first_name: 'ARSIENE', phone: '658726835', state: 'Deer' },
  { first_name: 'FLORENT', phone: '657394785', state: 'Deer' },
  { first_name: 'JORDAN', phone: '652937408', state: 'Deer' },
  { first_name: 'Agnes', phone: '672578007', state: 'Deer' },
  { first_name: 'Adelaide FT', phone: '691972520', state: 'First Timer' },
  { first_name: 'Kerron FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Arthur FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Clarence FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Vianey FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Prosper FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Kemy FT', phone: '690050831', state: 'First Timer' },
  { first_name: 'Wilfried FT 2', phone: '000000000', state: 'First Timer' },
  { first_name: 'Fidele FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Aimee', phone: '000000000', state: 'Deer' },
  { first_name: 'Ndfor Junior FT', phone: '655796550', state: 'First Timer' },
  { first_name: 'Samuel FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Jacob FT', phone: '000000000', state: 'First Timer' },
  { first_name: 'Rihana', phone: '694000781', state: 'Deer' },
  { first_name: 'Prety', phone: '000000000', state: 'Deer' },
  { first_name: 'Sandra 3', phone: '697466675', state: 'Deer' },
  { first_name: 'Michel', phone: '000000000', state: 'Deer' },
  { first_name: 'Abarom', phone: '000000000', state: 'Deer' },
  { first_name: 'Francois', phone: '000000000', state: 'Deer' }
];

async function importAimeMembers(aimeId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Gouverneur n a pas de area_id (zone) assignée. Impossible de créer des membres.' };
  }

  // Delete all existing members for Aime
  try {
    const deletedCount = await Member.destroy({ where: { leader_id: aimeId } });
    console.log(`Deleted ${deletedCount} existing members for Aime.`);
  } catch (err) {
    return { error: 'Erreur lors de la suppression des anciens membres: ' + err.message };
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
        leader_id: aimeId,
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

module.exports = { importAimeMembers };
