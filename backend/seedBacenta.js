require('dotenv').config();
const { sequelize, User, Area, Member, Attendance, CallLog, BacentaMeeting, BacentaAttendance, BacentaOffering } = require('./models');
const bcrypt = require('bcrypt');

async function seedCompleteBacenta() {
  try {
    console.log('🌱 Création d\'un Bacenta complet avec toutes les données...');

    // 1. Créer une Area
    const area = await Area.create({
      name: 'Area Centre Ville',
      number: 10,
      description: 'Zone urbaine centrale'
    });
    console.log('✅ Area créée:', area.name);

    // 2. Créer un Bacenta Leader
    const leaderPassword = await bcrypt.hash('Password123', 12);
    const leader = await User.create({
      email: 'marie.dupont@church.org',
      password_hash: leaderPassword,
      first_name: 'Marie',
      last_name: 'Dupont',
      role: 'Bacenta_Leader',
      area_id: area.id,
      phone: '+2250102030405',
      is_active: true
    });
    console.log('✅ Leader Bacenta créé:', leader.first_name, leader.last_name);

    // 3. Créer des Membres
    const membersData = [
      { first_name: 'Jean', last_name: 'Kouassi', phone_primary: '+2250102030406', gender: 'M', state: 'Sheep' },
      { first_name: 'Marie', last_name: 'Traoré', phone_primary: '+2250102030407', gender: 'F', state: 'Sheep' },
      { first_name: 'Paul', last_name: 'Konan', phone_primary: '+2250102030408', gender: 'M', state: 'Goat' },
      { first_name: 'Anne', last_name: 'Brou', phone_primary: '+2250102030409', gender: 'F', state: 'Sheep' },
      { first_name: 'Pierre', last_name: 'Dosso', phone_primary: '+2250102030410', gender: 'M', state: 'Deer' },
      { first_name: 'Sophie', last_name: 'Koffi', phone_primary: '+2250102030411', gender: 'F', state: 'Sheep' },
      { first_name: 'Michel', last_name: 'Yao', phone_primary: '+2250102030412', gender: 'M', state: 'Sheep' },
      { first_name: 'Fatou', last_name: 'Diallo', phone_primary: '+2250102030413', gender: 'F', state: 'Goat' }
    ];

    const members = [];
    for (const memberData of membersData) {
      const member = await Member.create({
        ...memberData,
        area_id: area.id,
        leader_id: leader.id,
        is_registered: true,
        is_active: true
      });
      members.push(member);
    }
    console.log(`✅ ${members.length} membres créés`);

    // 4. Créer des présences pour les 4 dernières semaines
    const attendanceRecords = [];
    const today = new Date();
    const sundays = [];

    // Générer les 4 derniers dimanches
    for (let i = 0; i < 4; i++) {
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - today.getDay() - (7 * i));
      sundays.push(sunday);
    }

    for (const sunday of sundays) {
      const sundayStr = sunday.toISOString().split('T')[0];

      for (const member of members) {
        // 80% de chance d'être présent
        const isPresent = Math.random() < 0.8;

        const attendance = await Attendance.create({
          member_id: member.id,
          sunday_date: sundayStr,
          present: isPresent,
          marked_by_user_id: leader.id,
          service_type: 'Experience',
          notes: isPresent ? null : 'Absent justifié'
        });
        attendanceRecords.push(attendance);
      }
    }
    console.log(`✅ ${attendanceRecords.length} présences créées`);

    // 5. Créer des logs d'appels
    const callLogs = [];
    const callOutcomes = ['Contacted', 'No_Answer', 'Callback_Requested', 'Wrong_Number'];

    for (const member of members) {
      // 2-3 appels par membre
      const numCalls = Math.floor(Math.random() * 2) + 2;

      for (let i = 0; i < numCalls; i++) {
        const callDate = new Date();
        callDate.setDate(callDate.getDate() - Math.floor(Math.random() * 30)); // Derniers 30 jours

        const outcome = callOutcomes[Math.floor(Math.random() * callOutcomes.length)];
        const needsFollowup = ['No_Answer', 'Callback_Requested'].includes(outcome);

        const callLog = await CallLog.create({
          member_id: member.id,
          caller_id: leader.id,
          call_date: callDate,
          outcome: outcome,
          notes: `Appel ${outcome.toLowerCase()}`,
          next_followup_date: needsFollowup ? new Date(callDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
          call_duration: Math.floor(Math.random() * 300) + 30, // 30-330 secondes
          contact_method: 'Phone',
          is_completed: true
        });
        callLogs.push(callLog);
      }
    }
    console.log(`✅ ${callLogs.length} logs d'appels créés`);

    // 6. Créer des réunions Bacenta
    const bacentaMeetings = [];
    const meetingTypes = ['Weekly_Sharing', 'Prayer_Meeting', 'Bible_Study'];

    for (let i = 0; i < 3; i++) {
      const meetingDate = new Date();
      meetingDate.setDate(meetingDate.getDate() - (7 * i)); // Toutes les semaines

      const meeting = await BacentaMeeting.create({
        leader_id: leader.id,
        meeting_date: meetingDate.toISOString().split('T')[0],
        meeting_time: '18:00:00',
        meeting_type: meetingTypes[Math.floor(Math.random() * meetingTypes.length)],
        location: 'Salle paroissiale',
        offering_amount: 0, // Sera mis à jour avec les offrandes
        total_members_present: 0, // Sera mis à jour avec les présences
        notes: `Réunion ${meetingTypes[Math.floor(Math.random() * meetingTypes.length)].replace('_', ' ')}`,
        meeting_duration: 90,
        is_verified: i === 0 // Dernière réunion vérifiée
      });
      bacentaMeetings.push(meeting);
    }
    console.log(`✅ ${bacentaMeetings.length} réunions Bacenta créées`);

    // 7. Créer des présences aux réunions Bacenta
    const bacentaAttendances = [];
    for (const meeting of bacentaMeetings) {
      let presentCount = 0;

      for (const member of members) {
        // 70% de chance d'être présent
        const isPresent = Math.random() < 0.7;

        if (isPresent) presentCount++;

        const bacentaAttendance = await BacentaAttendance.create({
          bacenta_meeting_id: meeting.id,
          member_id: member.id,
          present: isPresent,
          arrival_time: isPresent ? '18:00:00' : null,
          offering_contribution: isPresent ? Math.floor(Math.random() * 2000) + 500 : 0, // 500-2500 FCFA
          special_notes: isPresent ? null : 'Absent',
          marked_by_user_id: leader.id
        });
        bacentaAttendances.push(bacentaAttendance);
      }

      // Mettre à jour le nombre de présents
      await meeting.update({ total_members_present: presentCount });
    }
    console.log(`✅ ${bacentaAttendances.length} présences Bacenta créées`);

    // 8. Créer des offrandes Bacenta
    const bacentaOfferings = [];
    const offeringTypes = ['Tithe', 'Offering', 'Seed', 'Thanksgiving'];

    for (const meeting of bacentaMeetings) {
      // 3-5 offrandes par réunion
      const numOfferings = Math.floor(Math.random() * 3) + 3;
      let totalOffering = 0;

      for (let i = 0; i < numOfferings; i++) {
        const amount = Math.floor(Math.random() * 50000) + 10000; // 10k-60k FCFA
        totalOffering += amount;

        const offering = await BacentaOffering.create({
          bacenta_meeting_id: meeting.id,
          offering_type: offeringTypes[Math.floor(Math.random() * offeringTypes.length)],
          amount: amount,
          currency: 'XAF',
          collected_by: leader.id,
          verification_notes: 'Offrande collectée',
          is_verified: meeting.is_verified
        });
        bacentaOfferings.push(offering);
      }

      // Mettre à jour le montant total
      await meeting.update({ offering_amount: totalOffering });
    }
    console.log(`✅ ${bacentaOfferings.length} offrandes Bacenta créées`);

    console.log('\n🎉 Bacenta complet créé avec succès !');
    console.log('📊 Résumé :');
    console.log(`   - 1 Area: ${area.name}`);
    console.log(`   - 1 Leader: ${leader.first_name} ${leader.last_name}`);
    console.log(`   - ${members.length} Membres`);
    console.log(`   - ${attendanceRecords.length} Présences dominicales`);
    console.log(`   - ${callLogs.length} Logs d'appels`);
    console.log(`   - ${bacentaMeetings.length} Réunions Bacenta`);
    console.log(`   - ${bacentaAttendances.length} Présences Bacenta`);
    console.log(`   - ${bacentaOfferings.length} Offrandes Bacenta`);

    console.log('\n🔑 Identifiants de connexion :');
    console.log(`   Email: ${leader.email}`);
    console.log('   Mot de passe: Password123');

  } catch (error) {
    console.error('❌ Erreur lors de la création du Bacenta:', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le script
seedCompleteBacenta();