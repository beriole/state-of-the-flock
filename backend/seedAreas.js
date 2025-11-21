require('dotenv').config();
const { sequelize } = require('./models'); // Assure-toi que models/index.js exporte sequelize
const AreaModel = require('./models/Area');

const Area = AreaModel(sequelize);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL OK');

    // Synchroniser la table (alter: true pour mettre à jour la structure si besoin)
    await Area.sync({ alter: true });

    const areasData = [
      { name: 'Area 1', number: 1 },
      { name: 'Area 2', number: 22 },
      { name: 'Area 3', number: 3 },
      { name: 'Area 4', number: 4 },
      { name: 'Area 5', number: 11 },
      { name: 'Area 6', number: 23 },
      { name: 'Area 7', number: 38 },
      { name: 'Area 8', number: 40 },
      { name: 'Area 9', number: 46 },
      { name: 'Area 10', number: 27 }
    ];

    for (const data of areasData) {
      const [area, created] = await Area.findOrCreate({
        where: { number: data.number },
        defaults: data
      });

      console.log(created
        ? `✅ Area créée: ${area.name} (${area.number})`
        : `ℹ️ Area déjà existante: ${area.name} (${area.number})`);
    }

    console.log('🎉 Toutes les areas ont été traitées !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la création des areas:', err);
    process.exit(1);
  }
})();
