const mysql = require('mysql2/promise');

async function createGovernorUser() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'state_of_the_flock'
    });

    console.log('🔌 Connexion à la base de données établie');

    // Supprimer l'utilisateur gouverneur existant
    await connection.execute('DELETE FROM users WHERE email = ?', ['governor@test.com']);
    console.log('🗑️ Utilisateur gouverneur existant supprimé');

    // Créer l'utilisateur gouverneur de test
    await connection.execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, area_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['user-governor-123', 'governor@test.com', 'password123', 'Governor', 'Test', 'Governor', '+237698765432', null, 1]
    );
    console.log('✅ Utilisateur gouverneur créé avec succès');

    // Vérifier
    const [users] = await connection.execute('SELECT id, email, first_name, last_name, role FROM users WHERE email = ?', ['governor@test.com']);
    console.log('👤 Utilisateur créé :', users[0]);

    await connection.end();
    console.log('🎉 Opération terminée !');

    console.log('\n📋 IDENTIFIANTS DE CONNEXION GOUVERNEUR :');
    console.log('📧 Email : governor@test.com');
    console.log('🔑 Mot de passe : password123 (ou n\'importe quel mot de passe)');
    console.log('👤 Rôle : Governor');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur gouverneur :', error.message);
  }
}

createGovernorUser();