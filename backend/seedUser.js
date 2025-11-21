// seedUsers.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const initUser = require('./models/User');

// Connexion à la base MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
});

// Initialisation du modèle
const User = initUser(sequelize);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base OK');

    // Synchronisation (n'ajoute pas de { force: true } pour ne pas supprimer les tables)
    await sequelize.sync();

    const usersData = [
      { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'Bishop', password: 'Password123' },
      { first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', role: 'Assisting_Overseer', password: 'Password123' },
      { first_name: 'Alice', last_name: 'Brown', email: 'alice.brown@example.com', role: 'Area_Pastor', password: 'Password123' },
      { first_name: 'Bob', last_name: 'Johnson', email: 'bob.johnson@example.com', role: 'Bacenta_Leader', password: 'Password123' },
      { first_name: 'Charlie', last_name: 'Davis', email: 'charlie.davis@example.com', role: 'Data_Clerk', password: 'Password123' },
      { first_name: 'Eve', last_name: 'Miller', email: 'eve.miller@example.com', role: 'Volunteer', password: 'Password123' },
      { first_name: 'Frank', last_name: 'Wilson', email: 'frank.wilson@example.com', role: 'Area_Pastor', password: 'Password123' },
      { first_name: 'Grace', last_name: 'Taylor', email: 'grace.taylor@example.com', role: 'Bacenta_Leader', password: 'Password123' },
      { first_name: 'Hank', last_name: 'Anderson', email: 'hank.anderson@example.com', role: 'Data_Clerk', password: 'Password123' },
      { first_name: 'Ivy', last_name: 'Thomas', email: 'ivy.thomas@example.com', role: 'Volunteer', password: 'Password123' },
    ];

    for (const u of usersData) {
      const password_hash = await bcrypt.hash(u.password, 10);
      await User.create({ 
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        role: u.role,
        password_hash
      });
      console.log(`✅ Utilisateur créé : ${u.email}`);
    }

    console.log('🎉 10 utilisateurs créés avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la création des utilisateurs:', err);
    process.exit(1);
  }
})();
