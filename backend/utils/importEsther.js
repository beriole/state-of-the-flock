const { Member } = require('../models');

const rawText = `
SHEEP
Mireille (Mimi-Rose)
Mireille
Francis 671243422
Armelle
Merveille 652098688
Marina 681878025
Melanie
Fiona
Grace
Etienne
Letitia
Arouna 671239780
Louise
Tamara
Esemuela
Flavien
Valérie
Flora
Marie
Isabelle
Célestin
Chloé
Christelle
Hervé
Christian M.
Victor
Maximilien M
Cyrielle
Larissa

GOAT
Laeticia Mv 697960132
Chancelle 657270216
Amélie 698188681
Francis 656158552
Alexandrine 673232810
Rachel
Sylvain
Aude
Laetitia
Céline
Marina
Licia
Florian
Pelagie
Rolande
Emmanuel 691763116
Maximilien D 694086475
Mlle Merveille (SDF)
Esther
Marc
Letitia
Mme Ndjembelle
Landry
Ida
Christiane

SHEEP
Maimouna 655455848
Ange 699292850
Carine
Yolande
Armand
Fidèle
Béatrice
Benjamin 679546051
Augustine 656628830
Constant 696229415
Anaïs 686738604
Christelle 676759528
Catherine 696766624
Francesca 696220816
Corine

GOAT
Cyril 697858005
Edouard
Stela
Louise 695328220
Marthe 696739956
Serge
Pélagie
Sébastien 698062840
Paule
Edith
Evina 696757523
Audrey 698188165
Paul
Sylvie 698725183
Valérie 693710813
Thierry
William
Christian
Sylvain
Michel 656401017
Charlotte
Janise

DEER
Marylys
Marthe
Quere
Serge
Laure
Janet
Cedric
Aristide 698062846
Paul
Ghislain
Claudine 691000284
Cathérine
Landry
Marthe

SHEEP
Florent 696225845
José 692842065
Michelle 696008541
Mme
Chantal
Marcelle
Joséphine
Mamadou 678825556
Alex
Franck
Maximilien
Yannick
Magelan
Grâce
Zénob 691845112

DEER
Guy
Serge
Christian
Augustine
Yolande
Landry
Maximilien
Alex
Gilles
Michelle
Ismael
Pascal 691253456
Serge
`;

function parseMembers(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const data = [];
  let currentState = 'Sheep';

  for (const line of lines) {
    if (['SHEEP', 'GOAT', 'DEER', 'FIRST TIMER'].includes(line.toUpperCase())) {
      currentState = line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
      if (currentState === 'First timer') currentState = 'First Timer';
      continue;
    }

    // Try to extract phone number at the end
    const match = line.match(/(.+?)\s*(\d{9})?\s*$/);
    if (match) {
      const name = match[1].trim();
      const phone = match[2] ? match[2].trim() : '000000000';
      data.push({ first_name: name, phone, state: currentState });
    }
  }
  return data;
}

const membersData = parseMembers(rawText);

async function importEstherMembers(estherId, areaId) {
  let imported = 0;
  let skipped = 0;
  let errors = [];
  
  if (!areaId) {
    return { error: 'Gouverneur n a pas de area_id (zone) assignée. Impossible de créer des membres.' };
  }

  // Delete all existing members for Esther
  try {
    const deletedCount = await Member.destroy({ where: { leader_id: estherId } });
    console.log(`Deleted ${deletedCount} existing members for Esther.`);
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
        leader_id: estherId,
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
  return { imported, skipped, total: membersData.length, errors, parsedData: membersData.length };
}

module.exports = { importEstherMembers };
