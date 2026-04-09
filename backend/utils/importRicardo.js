const { Member } = require('../models');

const membersData = [
  { first_name: 'Mr Richard', phone: '677606277' },
  { first_name: 'Raul', phone: '' },
  { first_name: 'VALDO', phone: '673684829' },
  { first_name: 'Parfait', phone: '' },
  { first_name: 'Princess', phone: '' },
  { first_name: 'Mr Duke', phone: '' },
  { first_name: 'Jerry', phone: '678506489' },
  { first_name: 'Balbine', phone: '691167196' },
  { first_name: 'Magellan', phone: '688345146' },
  { first_name: 'Efficient', phone: '670412870' },
  { first_name: 'Aimé', phone: '699217563' },
  { first_name: 'Mama Marie', phone: '697642327' },
  { first_name: 'David', phone: '' },
  { first_name: 'Naomy', phone: '' },
  { first_name: 'Kamani Jerry', phone: '653261729' },
  { first_name: 'Bryan Cheka', phone: '654438540' },
  { first_name: 'JULIE', phone: '' },
  { first_name: 'DANIEL', phone: '' },
  { first_name: 'LEOCARDY', phone: '' },
  { first_name: 'MR MANGA', phone: '' },
  { first_name: 'JESSICA', phone: '' },
  { first_name: 'PARFAIT ', phone: '' },
  { first_name: 'DOUGLAS', phone: '' },
  { first_name: 'MARIE', phone: '' },
  { first_name: 'SOFIA', phone: '' },
  { first_name: 'ANGELA', phone: '' },
  { first_name: 'MR MICHEL', phone: '' },
  { first_name: 'Mather', phone: '' },
  { first_name: 'Mr Tabaku', phone: '' },
  { first_name: 'Naomy ', phone: '' },
  { first_name: 'Bertrand', phone: '672163992' },
  { first_name: 'Severen', phone: '' },
  { first_name: 'Giro', phone: '' },
  { first_name: 'Leonard', phone: '652301713' },
  { first_name: 'Lulu', phone: '' },
  { first_name: 'Diane', phone: '' },
  { first_name: 'Korine', phone: '640292899' },
  { first_name: 'Dadila', phone: '' },
  { first_name: 'Kuku', phone: '' },

  { first_name: 'Maxmine:', phone: '681913256' },
  { first_name: 'Lydia', phone: '683437838' },
  { first_name: 'Giselle', phone: '657678462' },
  { first_name: 'Aimé ', phone: '697671420' },
  { first_name: 'Junior.', phone: '' },
  { first_name: 'Alfredo', phone: '' },

  { first_name: 'Lucress', phone: '691747145' },
  { first_name: 'Gerald', phone: '' },
  { first_name: 'Morice', phone: '' },

  { first_name: 'Fortuna', phone: '656272435' },
  { first_name: 'Dominic', phone: '' }
];

async function importRicardoMembers(ricardoId, areaId) {
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
        leader_id: ricardoId,
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

module.exports = { importRicardoMembers };
