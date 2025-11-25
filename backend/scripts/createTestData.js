const { User, Area, Member, CallLog } = require('../models');
const bcrypt = require('bcrypt');

async function createTestData() {
  try {
    console.log('Création des données de test...');

    // Créer une zone
    const area = await Area.create({
      name: 'Zone Centre',
      number: 1,
      description: 'Zone centrale de Yaoundé'
    });
    console.log('✅ Zone créée');

    // Créer un utilisateur Bacenta Leader
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await User.create({
      email: 'leader@test.com',
      password_hash: hashedPassword,
      first_name: 'Jean',
      last_name: 'Dupont',
      role: 'Bacenta_Leader',
      area_id: area.id,
      phone: '+237612345678',
      is_active: true
    });
    console.log('✅ Utilisateur créé');

    // Créer des membres
    const members = [];
    for (let i = 1; i <= 10; i++) {
      const member = await Member.create({
        first_name: `Membre${i}`,
        last_name: `Test${i}`,
        phone_primary: `+23761234567${i}`,
        gender: i % 2 === 0 ? 'F' : 'M',
        area_id: area.id,
        leader_id: user.id,
        state: 'Sheep',
        is_active: true
      });
      members.push(member);
    }
    console.log('✅ Membres créés');

    // Créer des call logs
    for (const member of members) {
      for (let j = 0; j < 2; j++) {
        await CallLog.create({
          member_id: member.id,
          caller_id: user.id,
          outcome: j === 0 ? 'Contacted' : 'No_Answer',
          notes: `Appel ${j + 1} pour ${member.first_name}`,
          contact_method: 'Phone',
          is_completed: true
        });
      }
    }
    console.log('✅ Call logs créés');

    console.log('\n🎉 Données de test créées avec succès!');
    console.log('📧 Email: leader@test.com');
    console.log('🔑 Mot de passe: password123');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
  } finally {
    process.exit(0);
  }
}

createTestData();