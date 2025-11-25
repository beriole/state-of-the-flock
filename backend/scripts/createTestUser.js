const mysql = require('mysql2/promise');

async function createTestUser() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'state_of_the_flock'
    });

    console.log('🔌 Connexion à la base de données établie');

    // Supprimer l'utilisateur existant
    await connection.execute('DELETE FROM users WHERE email = ?', ['test@test.com']);
    console.log('🗑️ Utilisateur existant supprimé');

    // Créer l'utilisateur de test
    await connection.execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, area_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['user-test-123', 'test@test.com', 'password123', 'Test', 'User', 'Bacenta_Leader', '+237612345678', '7b1e677d-913c-412b-a625-25b58036bc19', 1]
    );
    console.log('✅ Utilisateur de test créé avec succès');

    // Vérifier
    const [users] = await connection.execute('SELECT id, email, first_name, last_name, role FROM users WHERE email = ?', ['test@test.com']);
    console.log('👤 Utilisateur créé :', users[0]);

    await connection.end();
    console.log('🎉 Opération terminée !');

    console.log('\n📋 IDENTIFIANTS DE CONNEXION :');
    console.log('📧 Email : test@test.com');
    console.log('🔑 Mot de passe : password123');
    console.log('👤 Rôle : Bacenta_Leader');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur :', error.message);
  }
}

createTestUser();