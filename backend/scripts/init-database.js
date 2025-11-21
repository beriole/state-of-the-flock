// scripts/init-database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Connexion sans base de données spécifiée (pour pouvoir créer la DB)
    const sequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: console.log
    });

    // Créer la base de données si elle n'existe pas
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log('✅ Base de données créée ou déjà existante');

    // Fermer la connexion
    await sequelize.close();

    // Maintenant se connecter à la base créée
    const sequelizeWithDB = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: console.log
      }
    );

    // Tester la connexion
    await sequelizeWithDB.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès');

    await sequelizeWithDB.close();
    console.log('✅ Initialisation de la base de données terminée');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

initializeDatabase();