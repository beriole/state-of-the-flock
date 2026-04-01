const { User, Member } = require('../models');

async function importCalvinMembers() {
  const GOVERNOR_EMAIL = 'calvin.rev@njangui.org';
  
  const calvin = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
  if (!calvin) {
    throw new Error(`Gouverneur ${GOVERNOR_EMAIL} introuvable.`);
  }

  if (!calvin.area_id) {
    throw new Error(`Le gouverneur ${GOVERNOR_EMAIL} n'a pas d'area_id défini.`);
  }

  const rawData = [
    // SHEEP
    { category: 'SHEEP', name: "Ivan", phone: "676308840", state: "Sheep" },
    { category: 'SHEEP', name: "Michelle", phone: "+233559881204", state: "Sheep" },
    { category: 'SHEEP', name: "Shalom", phone: "678633563", state: "Sheep" },
    { category: 'SHEEP', name: "Junior", phone: "650359122", state: "Sheep" },
    { category: 'SHEEP', name: "Leslie", phone: "695997235", state: "Sheep" },
    { category: 'SHEEP', name: "Joan", phone: "651165610", state: "Sheep" },
    { category: 'SHEEP', name: "Noah", phone: "673750323", state: "Sheep" },
    { category: 'SHEEP', name: "Beriol", phone: "695466826", state: "Sheep" },
    { category: 'SHEEP', name: "Négus", phone: "683598132", state: "Sheep" },
    
    // GOAT
    { category: 'GOAT', name: "Nick 2", phone: "687860945", state: "Goat" },
    { category: 'GOAT', name: "Jordan", phone: "696587643", state: "Goat" },
    { category: 'GOAT', name: "Herman", phone: "655742963", state: "Goat" },
    { category: 'GOAT', name: "Samson", phone: "650750782", state: "Goat" },
    { category: 'GOAT', name: "Donald", phone: "681141213", state: "Goat" },
    { category: 'GOAT', name: "Karis", phone: "676362855", state: "Goat" },
    { category: 'GOAT', name: "Miguel", phone: "690937466", state: "Goat" },

    // DEER
    { category: 'DEER', name: "Pogba", phone: "691691529", state: "Deer" },
    { category: 'DEER', name: "Sandra", phone: "657048687", state: "Deer" },
    { category: 'DEER', name: "Adélaïde", phone: "680733444", state: "Deer" },
    { category: 'DEER', name: "Clara", phone: "690822532", state: "Deer" },
    { category: 'DEER', name: "Flora", phone: "658278385", state: "Deer" },
    { category: 'DEER', name: "Lewis", phone: "655858498", state: "Deer" },
    { category: 'DEER', name: "Pablo Jordan", phone: "697238627", state: "Deer" },
    { category: 'DEER', name: "Théodore", phone: "659262548", state: "Deer" },
    { category: 'DEER', name: "Hollande", phone: "676886121", state: "Deer" },
    { category: 'DEER', name: "Nova", phone: "696144947", state: "Deer" },
    { category: 'DEER', name: "Alex", phone: "687546240", state: "Deer" },
    { category: 'DEER', name: "Louange", phone: "698711706", state: "Deer" },
    { category: 'DEER', name: "Calep", phone: "657016883", state: "Deer" },
    { category: 'DEER', name: "Florence", phone: "672476061", state: "Deer" },
    { category: 'DEER', name: "Godwill", phone: "680736947", state: "Deer" },
    { category: 'DEER', name: "Arnold", phone: "698304329", state: "Deer" },
    { category: 'DEER', name: "Godwill brother", phone: "680736947", state: "Deer" },
    { category: 'DEER', name: "Andi", phone: "678578195", state: "Deer" },
    { category: 'DEER', name: "Therese", phone: "680024368", state: "Deer" },
    { category: 'DEER', name: "Cedric", phone: "655677926", state: "Deer" },
    { category: 'DEER', name: "Christian", phone: "658515662", state: "Deer" },

    // FTs
    { category: 'FTs', name: "Blondin", phone: "696151720", state: "Sheep" },
    { category: 'FTs', name: "Blanche", phone: "696151720", state: "Sheep" },
    { category: 'FTs', name: "Eurechia", phone: "683498497", state: "Sheep" },
    { category: 'FTs', name: "Gaston", phone: "655624229", state: "Sheep" },
    { category: 'FTs', name: "Stéphane", phone: "692853243", state: "Sheep" },
    { category: 'FTs', name: "Jordan", phone: "696587643", state: "Sheep" },
    { category: 'FTs', name: "Caleb", phone: "657016883", state: "Sheep" },
    { category: 'FTs', name: "Allan", phone: "69219385", state: "Sheep", incomplet: true },
    { category: 'FTs', name: "Ralf", phone: "691627438", state: "Sheep" },
    { category: 'FTs', name: "Joyceline", phone: "694687354", state: "Sheep" },
    { category: 'FTs', name: "John", phone: "689255396", state: "Sheep" },
    { category: 'FTs', name: "Alima Joséphine", phone: "694590640", state: "Sheep" },
    { category: 'FTs', name: "Djuikui Miranda", phone: "674005367", state: "Sheep" },
    { category: 'FTs', name: "Darline Billy", phone: "689465045", state: "Sheep" },
    { category: 'FTs', name: "Wilfried", phone: "687363387", state: "Sheep" },
    { category: 'FTs', name: "Andy", phone: "678578195", state: "Sheep" },
    { category: 'FTs', name: "René", phone: "683050840", state: "Sheep" },
    { category: 'FTs', name: "Brayan", phone: "698822004", state: "Sheep" },
    { category: 'FTs', name: "Richie", phone: "676196718", state: "Sheep" },
    { category: 'FTs', name: "Alain", phone: "698822004", state: "Sheep" },
    { category: 'FTs', name: "Wilfrid", phone: "6922766", state: "Sheep", incomplet: true },
    { category: 'FTs', name: "DANIEL", phone: "690234470", state: "Sheep" },
    { category: 'FTs', name: "Steve", phone: "690228795", state: "Sheep" },
    { category: 'FTs', name: "Simon", phone: "656711818", state: "Sheep" },
    { category: 'FTs', name: "Korean", phone: "689646467", state: "Sheep" },
    { category: 'FTs', name: "Karim", phone: "691079219", state: "Sheep" },
    { category: 'FTs', name: "Thierry", phone: "683222511", state: "Sheep" },
    { category: 'FTs', name: "Raphael", phone: "688147299", state: "Sheep" },
    { category: 'FTs', name: "Giresse", phone: "656966582", state: "Sheep" },
    { category: 'FTs', name: "Farel", phone: "694137650", state: "Sheep" },
    { category: 'FTs', name: "Nehemie", phone: "691267154", state: "Sheep" },
    { category: 'FTs', name: "Arsene", phone: "654164082", state: "Sheep" },
    { category: 'FTs', name: "Loïc", phone: "658016828", state: "Sheep" },
    { category: 'FTs', name: "Landry", phone: "672766888", state: "Sheep" },
    { category: 'FTs', name: "Prince", phone: "69386217", state: "Sheep", incomplet: true },

    // NORA GROUP
    { category: 'NORA GROUP', name: "Nora", phone: "653236669", state: "Sheep" },
    { category: 'NORA GROUP', name: "Loretta", phone: "651244196", state: "Sheep" },
    { category: 'NORA GROUP', name: "Stephane", phone: "678340860", state: "Sheep" },
    { category: 'NORA GROUP', name: "Garbin", phone: "692971936", state: "Sheep" },
    { category: 'NORA GROUP', name: "Bruno", phone: "693572486", state: "Sheep" },
    { category: 'NORA GROUP', name: "Junior Mvogo", phone: "659826058", state: "Sheep" },
    { category: 'NORA GROUP', name: "Christ", phone: "686368906", state: "Sheep" },
    { category: 'NORA GROUP', name: "Benjamin", phone: "686931343", state: "Sheep" },

    // FTs (2)
    { category: 'FTs (2)', name: "Mr Meve Lesly", phone: "670135113", state: "Sheep" },
    { category: 'FTs (2)', name: "Steven", phone: "673901525", state: "Sheep" },
    { category: 'FTs (2)', name: "Emmanuel", phone: "658126927", state: "Sheep" },
    { category: 'FTs (2)', name: "Ntozoa", phone: "640703079", state: "Sheep" },
    { category: 'FTs (2)', name: "Mirise", phone: "640703079", state: "Sheep" },
    { category: 'FTs (2)', name: "Joel", phone: "675584741", state: "Sheep" },

    // KARL GROUP
    { category: 'KARL GROUP', name: "Karl", phone: "680262690", state: "Sheep" },

    // LAST SHEEP
    { category: 'SHEEP', name: "Serge", phone: "652910726", state: "Sheep" },
    { category: 'SHEEP', name: "Nathan", phone: "653939457", state: "Sheep" },
    { category: 'SHEEP', name: "Anita", phone: "677894682", state: "Sheep" },
    { category: 'SHEEP', name: "Jenifer", phone: "699018638", state: "Sheep" },
  ];

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (const item of rawData) {
    try {
      const nameParts = item.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '.';
      
      await Member.create({
        first_name: firstName,
        last_name: lastName,
        phone_primary: item.phone,
        gender: 'M',
        state: item.state,
        area_id: calvin.area_id,
        leader_id: calvin.id,
        notes: `Importé via script. Catégorie: ${item.category}${item.incomplet ? ' (Incomplet)' : ''}`,
        is_active: true
      });
      successCount++;
    } catch (err) {
      failCount++;
      errors.push({ name: item.name, error: err.message });
    }
  }

  return { successCount, failCount, errors };
}

module.exports = { importCalvinMembers };
