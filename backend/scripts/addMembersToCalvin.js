const axios = require('axios');

const API_URL = 'https://state-of-the-flock.onrender.com/api';

// Governor credentials
const GOVERNOR_EMAIL = 'calvin.rev@njangui.org';
const GOVERNOR_PASSWORD = 'Calvin@123';

// Members data organized by category
const membersData = [
  // LEADER
  { first_name: 'Rev Calvin', last_name: '', phone_primary: '677076584', gender: 'M', state: 'Sheep' },
  
  // SHEEP
  { first_name: 'Ivan', last_name: '', phone_primary: '676308840', gender: 'M', state: 'Sheep' },
  { first_name: 'Michelle', last_name: '', phone_primary: '+233559881204', gender: 'M', state: 'Sheep' },
  { first_name: 'Shalom', last_name: '', phone_primary: '678633563', gender: 'M', state: 'Sheep' },
  { first_name: 'Junior', last_name: '', phone_primary: '650359122', gender: 'M', state: 'Sheep' },
  { first_name: 'Leslie', last_name: '', phone_primary: '695997235', gender: 'M', state: 'Sheep' },
  { first_name: 'Joan', last_name: '', phone_primary: '651165610', gender: 'M', state: 'Sheep' },
  { first_name: 'Noah', last_name: '', phone_primary: '673750323', gender: 'M', state: 'Sheep' },
  { first_name: 'Beriol', last_name: '', phone_primary: '695466826', gender: 'M', state: 'Sheep' },
  { first_name: 'Négus', last_name: '', phone_primary: '683598132', gender: 'M', state: 'Sheep' },
  
  // GOAT
  { first_name: 'Nick 2', last_name: '', phone_primary: '687860945', gender: 'M', state: 'Goat' },
  { first_name: 'Jordan', last_name: '', phone_primary: '696587643', gender: 'M', state: 'Goat' },
  { first_name: 'Herman', last_name: '', phone_primary: '655742963', gender: 'M', state: 'Goat' },
  { first_name: 'Samson', last_name: '', phone_primary: '650750782', gender: 'M', state: 'Goat' },
  { first_name: 'Donald', last_name: '', phone_primary: '681141213', gender: 'M', state: 'Goat' },
  { first_name: 'Karis', last_name: '', phone_primary: '676362855', gender: 'M', state: 'Goat' },
  { first_name: 'Miguel', last_name: '', phone_primary: '690937466', gender: 'M', state: 'Goat' },
  
  // DEER
  { first_name: 'Pogba', last_name: '', phone_primary: '691691529', gender: 'M', state: 'Deer' },
  { first_name: 'Sandra', last_name: '', phone_primary: '657048687', gender: 'M', state: 'Deer' },
  { first_name: 'Adélaïde', last_name: '', phone_primary: '680733444', gender: 'M', state: 'Deer' },
  { first_name: 'Clara', last_name: '', phone_primary: '690822532', gender: 'M', state: 'Deer' },
  { first_name: 'Flora', last_name: '', phone_primary: '658278385', gender: 'M', state: 'Deer' },
  { first_name: 'Lewis', last_name: '', phone_primary: '655858498', gender: 'M', state: 'Deer' },
  { first_name: 'Pablo Jordan', last_name: '', phone_primary: '697238627', gender: 'M', state: 'Deer' },
  { first_name: 'Théodore', last_name: '', phone_primary: '659262548', gender: 'M', state: 'Deer' },
  { first_name: 'Hollande', last_name: '', phone_primary: '676886121', gender: 'M', state: 'Deer' },
  { first_name: 'Nova', last_name: '', phone_primary: '696144947', gender: 'M', state: 'Deer' },
  { first_name: 'Alex', last_name: '', phone_primary: '687546240', gender: 'M', state: 'Deer' },
  { first_name: 'Louange', last_name: '', phone_primary: '698711706', gender: 'M', state: 'Deer' },
  { first_name: 'Calep', last_name: '', phone_primary: '657016883', gender: 'M', state: 'Deer' },
  { first_name: 'Florence', last_name: '', phone_primary: '672476061', gender: 'M', state: 'Deer' },
  { first_name: 'Godwill', last_name: '', phone_primary: '680736947', gender: 'M', state: 'Deer' },
  { first_name: 'Arnold', last_name: '', phone_primary: '698304329', gender: 'M', state: 'Deer' },
  { first_name: 'Godwill brother', last_name: '', phone_primary: '680736947', gender: 'M', state: 'Deer' },
  { first_name: 'Andi', last_name: '', phone_primary: '678578195', gender: 'M', state: 'Deer' },
  { first_name: 'Therese', last_name: '', phone_primary: '680024368', gender: 'M', state: 'Deer' },
  { first_name: 'Cedric', last_name: '', phone_primary: '655677926', gender: 'M', state: 'Deer' },
  { first_name: 'Christian', last_name: '', phone_primary: '658515662', gender: 'M', state: 'Deer' },
  
  // FTs
  { first_name: 'Blondin', last_name: '', phone_primary: '696151720', gender: 'M', state: 'Sheep' },
  { first_name: 'Blanche', last_name: '', phone_primary: '696151720', gender: 'M', state: 'Sheep' },
  { first_name: 'Eurechia', last_name: '', phone_primary: '683498497', gender: 'M', state: 'Sheep' },
  { first_name: 'Gaston', last_name: '', phone_primary: '655624229', gender: 'M', state: 'Sheep' },
  { first_name: 'Stéphane', last_name: '', phone_primary: '692853243', gender: 'M', state: 'Sheep' },
  { first_name: 'Jordan', last_name: '', phone_primary: '696587643', gender: 'M', state: 'Sheep' },
  { first_name: 'Caleb', last_name: '', phone_primary: '657016883', gender: 'M', state: 'Sheep' },
  { first_name: 'Allan', last_name: '', phone_primary: '69219385', gender: 'M', state: 'Sheep' },
  { first_name: 'Ralf', last_name: '', phone_primary: '691627438', gender: 'M', state: 'Sheep' },
  { first_name: 'Joyceline', last_name: '', phone_primary: '694687354', gender: 'M', state: 'Sheep' },
  { first_name: 'John', last_name: '', phone_primary: '689255396', gender: 'M', state: 'Sheep' },
  { first_name: 'Alima Joséphine', last_name: '', phone_primary: '694590640', gender: 'M', state: 'Sheep' },
  { first_name: 'Djuikui Miranda', last_name: '', phone_primary: '674005367', gender: 'M', state: 'Sheep' },
  { first_name: 'Darline Billy', last_name: '', phone_primary: '689465045', gender: 'M', state: 'Sheep' },
  { first_name: 'Wilfried', last_name: '', phone_primary: '687363387', gender: 'M', state: 'Sheep' },
  { first_name: 'Andy', last_name: '', phone_primary: '678578195', gender: 'M', state: 'Sheep' },
  { first_name: 'René', last_name: '', phone_primary: '683050840', gender: 'M', state: 'Sheep' },
  { first_name: 'Brayan', last_name: '', phone_primary: '698822004', gender: 'M', state: 'Sheep' },
  { first_name: 'Richie', last_name: '', phone_primary: '676196718', gender: 'M', state: 'Sheep' },
  { first_name: 'Alain', last_name: '', phone_primary: '698822004', gender: 'M', state: 'Sheep' },
  { first_name: 'Wilfrid', last_name: '', phone_primary: '6922766', gender: 'M', state: 'Sheep' },
  { first_name: 'DANIEL', last_name: '', phone_primary: '690234470', gender: 'M', state: 'Sheep' },
  { first_name: 'Steve', last_name: '', phone_primary: '690228795', gender: 'M', state: 'Sheep' },
  { first_name: 'Simon', last_name: '', phone_primary: '656711818', gender: 'M', state: 'Sheep' },
  { first_name: 'Korean', last_name: '', phone_primary: '689646467', gender: 'M', state: 'Sheep' },
  { first_name: 'Karim', last_name: '', phone_primary: '691079219', gender: 'M', state: 'Sheep' },
  { first_name: 'Thierry', last_name: '', phone_primary: '683222511', gender: 'M', state: 'Sheep' },
  { first_name: 'Raphael', last_name: '', phone_primary: '688147299', gender: 'M', state: 'Sheep' },
  { first_name: 'Giresse', last_name: '', phone_primary: '656966582', gender: 'M', state: 'Sheep' },
  { first_name: 'Farel', last_name: '', phone_primary: '694137650', gender: 'M', state: 'Sheep' },
  { first_name: 'Nehemie', last_name: '', phone_primary: '691267154', gender: 'M', state: 'Sheep' },
  { first_name: 'Arsene', last_name: '', phone_primary: '654164082', gender: 'M', state: 'Sheep' },
  { first_name: 'Loïc', last_name: '', phone_primary: '658016828', gender: 'M', state: 'Sheep' },
  { first_name: 'Landry', last_name: '', phone_primary: '672766888', gender: 'M', state: 'Sheep' },
  { first_name: 'Prince', last_name: '', phone_primary: '69386217', gender: 'M', state: 'Sheep' },
  
  // NORA GROUP
  { first_name: 'Nora', last_name: '', phone_primary: '653236669', gender: 'M', state: 'Sheep' },
  { first_name: 'Loretta', last_name: '', phone_primary: '651244196', gender: 'M', state: 'Sheep' },
  { first_name: 'Stephane', last_name: '', phone_primary: '678340860', gender: 'M', state: 'Sheep' },
  { first_name: 'Garbin', last_name: '', phone_primary: '692971936', gender: 'M', state: 'Sheep' },
  { first_name: 'Bruno', last_name: '', phone_primary: '693572486', gender: 'M', state: 'Sheep' },
  { first_name: 'Junior Mvogo', last_name: '', phone_primary: '659826058', gender: 'M', state: 'Sheep' },
  { first_name: 'Christ', last_name: '', phone_primary: '686368906', gender: 'M', state: 'Sheep' },
  { first_name: 'Benjamin', last_name: '', phone_primary: '686931343', gender: 'M', state: 'Sheep' },
  
  // FTS (2)
  { first_name: 'Mr Meve Lesly', last_name: '', phone_primary: '670135113', gender: 'M', state: 'Sheep' },
  { first_name: 'Steven', last_name: '', phone_primary: '673901525', gender: 'M', state: 'Sheep' },
  { first_name: 'Emmanuel', last_name: '', phone_primary: '658126927', gender: 'M', state: 'Sheep' },
  { first_name: 'Ntozoa', last_name: '', phone_primary: '640703079', gender: 'M', state: 'Sheep' },
  { first_name: 'Mirise', last_name: '', phone_primary: '640703079', gender: 'M', state: 'Sheep' },
  { first_name: 'Joel', last_name: '', phone_primary: '675584741', gender: 'M', state: 'Sheep' },
  
  // KARL GROUP
  { first_name: 'Karl', last_name: '', phone_primary: '680262690', gender: 'M', state: 'Sheep' },
  
  // SHEEP (additional)
  { first_name: 'Serge', last_name: '', phone_primary: '652910726', gender: 'M', state: 'Sheep' },
  { first_name: 'Nathan', last_name: '', phone_primary: '653939457', gender: 'M', state: 'Sheep' },
  { first_name: 'Anita', last_name: '', phone_primary: '677894682', gender: 'M', state: 'Sheep' },
  { first_name: 'Jenifer', last_name: '', phone_primary: '699018638', gender: 'M', state: 'Sheep' },
];

async function loginAsGovernor(retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Tentative de connexion ${i + 1}/${retries}...`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: GOVERNOR_EMAIL,
        password: GOVERNOR_PASSWORD
      });
      console.log('✅ Connecté en tant que Governor');
      return response.data.token;
    } catch (error) {
      console.log(`❌ Tentative échouée: ${error.message}`);
      if (i < retries - 1) {
        console.log(`⏳ Nouvelle tentative dans ${delay/1000} secondes...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Impossible de se connecter après plusieurs tentatives');
}

async function getGovernorInfo(token) {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur获取Governor info:', error.response?.data || error.message);
    return null;
  }
}

async function createMember(token, memberData) {
  try {
    const response = await axios.post(`${API_URL}/members`, memberData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur création membre ${memberData.first_name}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Début de l\'ajout des membres au compte de Rev Calvin...\n');

  // 1. Connexion en tant que Governor
  const token = await loginAsGovernor();
  if (!token) {
    console.error('❌ Impossible de se connecter');
    return;
  }

  // 2. Récupérer les informations du Governor
  console.log('\n📋 Récupération des informations du Governor...');
  const governor = await getGovernorInfo(token);
  if (!governor) {
    console.error('❌ Impossible de récupérer les informations du Governor');
    return;
  }

  console.log(`✅ Governor: ${governor.first_name} ${governor.last_name}`);
  console.log(`📍 Area ID: ${governor.area_id}`);

  // 3. Créer les membres
  console.log('\n📋 Création des membres...');
  let successCount = 0;
  let failCount = 0;

  for (const member of membersData) {
    const memberData = {
      first_name: member.first_name,
      last_name: member.last_name || '',
      phone_primary: member.phone_primary,
      gender: member.gender,
      state: member.state,
      area_id: governor.area_id,
      leader_id: governor.id
    };

    const result = await createMember(token, memberData);
    if (result) {
      console.log(`✅ ${member.first_name} ${member.last_name} - ${member.state}`);
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n🎉 Opération terminée!');
  console.log(`✅ Membres créés: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
}

main().catch(console.error);
