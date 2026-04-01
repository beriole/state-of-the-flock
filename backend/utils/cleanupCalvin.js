const { User, Member, sequelize } = require('../models');
const { Op } = require('sequelize');

async function cleanupCalvinDuplicates() {
  const GOVERNOR_EMAIL = 'calvin.rev@njangui.org';
  
  const calvin = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
  if (!calvin) {
    throw new Error(`Gouverneur ${GOVERNOR_EMAIL} introuvable.`);
  }

  // Tous les membres liés à Calvin, ordonnés par date de création (le plus ancien en premier)
  const members = await Member.findAll({
    where: { 
      leader_id: calvin.id,
      notes: { [Op.like]: 'Importé via script%' } // Cibler uniquement les membres importés
    },
    order: [['created_at', 'ASC']]
  });

  const seen = new Set();
  const toDelete = [];
  const report = {
    totalChecked: members.length,
    kept: 0,
    toBeDeleted: 0,
    deletedNames: []
  };

  for (const m of members) {
    // Clé unique pour identifier un membre (nom + prénom + téléphone)
    const key = `${m.first_name.trim().toLowerCase()}|${m.last_name.trim().toLowerCase()}|${m.phone_primary}`;
    
    if (seen.has(key)) {
      toDelete.push(m.id);
      report.deletedNames.push(`${m.first_name} ${m.last_name} (${m.phone_primary})`);
    } else {
      seen.add(key);
      report.kept++;
    }
  }

  report.toBeDeleted = toDelete.length;

  if (toDelete.length > 0) {
    await Member.destroy({
      where: {
        id: { [Op.in]: toDelete }
      }
    });
  }

  return report;
}

module.exports = { cleanupCalvinDuplicates };
