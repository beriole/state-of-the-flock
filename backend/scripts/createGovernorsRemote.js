const axios = require('axios');

const API_URL = 'https://state-of-the-flock.onrender.com/api';

// Données des gouverneurs à créer
const governorsData = [
  // AREA 1 - Region "Area 1"
  {
    first_name: 'Marcel',
    last_name: 'Ps',
    email: 'marcel.ps@njangui.org',
    phone: '677001122',
    password: 'Marcel@123',
    role: 'Governor',
    regionName: 'Area 1',
    zoneName: 'Camp Sonel'
  },
  {
    first_name: 'Yvette',
    last_name: 'Lp',
    email: 'yvette.lp@njangui.org',
    phone: '677112233',
    password: 'Yvette@123',
    role: 'Governor',
    regionName: 'Area 1',
    zoneName: 'Afanayo'
  },
  {
    first_name: 'Akongnwi',
    last_name: 'Leader',
    email: 'akongnwi@njangui.org',
    phone: '677223344',
    password: 'Akongnwi@123',
    role: 'Governor',
    regionName: 'Area 1',
    zoneName: 'Cimencam'
  },
  // AREA 2
  {
    first_name: 'Vera',
    last_name: 'Overseer',
    email: 'vera@njangui.org',
    phone: '677334455',
    password: 'Vera@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Mendong'
  },
  {
    first_name: 'Clovis',
    last_name: 'Ps',
    email: 'clovis.ps@njangui.org',
    phone: '677445566',
    password: 'Clovis@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Simbock / Eloumdem'
  },
  {
    first_name: 'Daline',
    last_name: 'Leader',
    email: 'daline@njangui.org',
    phone: '677556677',
    password: 'Daline@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Mbalgon'
  },
  {
    first_name: 'Noella',
    last_name: 'Leader',
    email: 'noella@njangui.org',
    phone: '677667788',
    password: 'Noella@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Damas'
  },
  {
    first_name: 'Rayon',
    last_name: 'Leader',
    email: 'rayon@njangui.org',
    phone: '677778899',
    password: 'Rayon@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Efoulan'
  },
  {
    first_name: 'Marco',
    last_name: 'Leader',
    email: 'marco@njangui.org',
    phone: '678001122',
    password: 'Marco@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Bandoumou'
  },
  // Ps Aimé
  {
    first_name: 'Aimé',
    last_name: 'Ps',
    email: 'aime.ps@njangui.org',
    phone: '678112233',
    password: 'Aime@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Nkonfulu'
  },
  {
    first_name: 'Emmanuel',
    last_name: 'Glory',
    email: 'emmanuel.glory@njangui.org',
    phone: '678223344',
    password: 'Emmanuel@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Soa 1'
  },
  // Rev Calvin
  {
    first_name: 'Calvin',
    last_name: 'Rev',
    email: 'calvin.rev@njangui.org',
    phone: '678334455',
    password: 'Calvin@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'IAI'
  },
  {
    first_name: 'Esther',
    last_name: 'Leader',
    email: 'esther@njangui.org',
    phone: '678445566',
    password: 'Esther@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'ODZA'
  },
  {
    first_name: 'Annie',
    last_name: 'Grace',
    email: 'annie.grace@njangui.org',
    phone: '678556677',
    password: 'Annie@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Ekounou'
  },
  {
    first_name: 'Reward',
    last_name: 'Leader',
    email: 'reward@njangui.org',
    phone: '678667788',
    password: 'Reward@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Nsam'
  },
  {
    first_name: 'Mercedes',
    last_name: 'Ps',
    email: 'mercedes.ps@njangui.org',
    phone: '678778899',
    password: 'Mercedes@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Siantou / Coron'
  },
  // Lp Sandrine
  {
    first_name: 'Sandrine',
    last_name: 'Lp',
    email: 'sandrine.lp@njangui.org',
    phone: '679001122',
    password: 'Sandrine@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Ecole de Poste'
  },
  {
    first_name: 'Mukete',
    last_name: 'Leader',
    email: 'mukete@njangui.org',
    phone: '679112233',
    password: 'Mukete@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Etoug-Ebe'
  },
  {
    first_name: 'Cynthia',
    last_name: 'Lp',
    email: 'cynthia.lp@njangui.org',
    phone: '679223344',
    password: 'Cynthia@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Nkolbison'
  },
  {
    first_name: 'Priscilla',
    last_name: 'Lp',
    email: 'priscilla.lp@njangui.org',
    phone: '679334455',
    password: 'Priscilla@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Obili'
  },
  {
    first_name: 'Bongeh',
    last_name: 'Leader',
    email: 'bongeh@njangui.org',
    phone: '679445566',
    password: 'Bongeh@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Mvog-Betsi'
  },
  // Pastor Tracey
  {
    first_name: 'Tracey',
    last_name: 'Rev',
    email: 'tracey.rev@njangui.org',
    phone: '679556677',
    password: 'Tracey@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Bonas'
  },
  {
    first_name: 'Clifford',
    last_name: 'Leader',
    email: 'clifford@njangui.org',
    phone: '679667788',
    password: 'Clifford@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Mimboman 2'
  },
  // Ps Samuel
  {
    first_name: 'Samuel',
    last_name: 'Ps',
    email: 'samuel.ps@njangui.org',
    phone: '679778899',
    password: 'Samuel@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Eloumdem / Damas / Simbock'
  },
  {
    first_name: 'Lydia',
    last_name: 'Lp',
    email: 'lydia.lp@njangui.org',
    phone: '680001122',
    password: 'Lydia@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'Tropicana'
  },
  // Ps Dexter
  {
    first_name: 'Dexter',
    last_name: 'Ps',
    email: 'dexter.ps@njangui.org',
    phone: '680112233',
    password: 'Dexter@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'FLES'
  },
  // Ps Akime
  {
    first_name: 'Akime',
    last_name: 'Rev',
    email: 'akime.rev@njangui.org',
    phone: '680223344',
    password: 'Akime@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'General'
  },
  {
    first_name: 'Rosa',
    last_name: 'Joy',
    email: 'rosa.joy@njangui.org',
    phone: '680334455',
    password: 'Rosa@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'General'
  },
  {
    first_name: 'Ricardo',
    last_name: 'Leader',
    email: 'ricardo@njangui.org',
    phone: '680445566',
    password: 'Ricardo@123',
    role: 'Governor',
    regionName: 'Area 2',
    zoneName: 'General'
  }
];

async function loginAsBishop(retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Tentative de connexion ${i + 1}/${retries}...`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'berioletsague@gmail.com',
        password: 'Beriole'
      });
      console.log('✅ Connecté en tant que Bishop');
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

async function getRegions(token) {
  try {
    const response = await axios.get(`${API_URL}/regions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur获取Regions:', error.response?.data || error.message);
    return [];
  }
}

async function getAreas(token) {
  try {
    const response = await axios.get(`${API_URL}/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.areas || response.data;
  } catch (error) {
    console.error('❌ Erreur获取Areas:', error.response?.data || error.message);
    return [];
  }
}

async function createRegion(token, name) {
  try {
    const response = await axios.post(`${API_URL}/regions`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    // Region might already exist
    console.log(`⚠️ Region ${name} might already exist`);
    return null;
  }
}

async function createArea(token, name, number, regionId) {
  try {
    const response = await axios.post(`${API_URL}/areas`, {
      name,
      number,
      region_id: regionId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.log(`⚠️ Area ${name} might already exist`);
    return null;
  }
}

async function createUser(token, userData) {
  try {
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.log(`⚠️ User ${userData.email} might already exist:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Début de la création des gouverneurs...\n');

  // 1. Connexion en tant que Bishop
  const token = await loginAsBishop();
  if (!token) {
    console.error('❌ Impossible de se connecter');
    return;
  }

  // 2. Récupérer les regions et areas existantes
  console.log('\n📋 Récupération des regions et areas existantes...');
  let regions = await getRegions(token);
  let areas = await getAreas(token);
  
  console.log(`📍 ${regions.length} regions trouvées`);
  console.log(`📍 ${areas.length} areas trouvées`);

  // 3. Créer les regions si elles n'existent pas
  const regionNames = ['Area 1', 'Area 2'];
  const regionMap = {};

  for (const name of regionNames) {
    let region = regions.find(r => r.name === name);
    if (!region) {
      console.log(`\n➕ Création de la region: ${name}`);
      region = await createRegion(token, name);
      if (region) {
        regions = await getRegions(token);
        region = regions.find(r => r.name === name);
      }
    }
    if (region) {
      regionMap[name] = region.id;
      console.log(`✅ Region ${name}: ${region.id}`);
    }
  }

  // 4. Créer les areas pour chaque governor
  console.log('\n📋 Création des areas...');
  
  // Grouper les gouverneurs par zone pour éviter les doublons
  const zoneMap = {};
  governorsData.forEach(g => {
    if (!zoneMap[g.zoneName]) {
      zoneMap[g.zoneName] = g.regionName;
    }
  });

  // Créer les areas
  let areaCounter = 1;
  const areaMap = {};
  
  for (const [zoneName, regionName] of Object.entries(zoneMap)) {
    let area = areas.find(a => a.name === zoneName);
    if (!area && regionMap[regionName]) {
      console.log(`➕ Création de l'area: ${zoneName} (Region: ${regionName})`);
      area = await createArea(token, zoneName, areaCounter, regionMap[regionName]);
      if (area) {
        areas = await getAreas(token);
        area = areas.find(a => a.name === zoneName);
      }
      areaCounter++;
    }
    if (area) {
      areaMap[zoneName] = area.id;
      console.log(`✅ Area ${zoneName}: ${area.id}`);
    }
  }

  // 5. Créer les gouverneurs
  console.log('\n📋 Création des gouvernaires...');
  let successCount = 0;
  let failCount = 0;

  for (const governor of governorsData) {
    const areaId = areaMap[governor.zoneName];
    
    if (!areaId) {
      console.log(`❌ Area non trouvée pour: ${governor.first_name} ${governor.last_name} (${governor.zoneName})`);
      failCount++;
      continue;
    }

    const userData = {
      email: governor.email,
      password: governor.password,
      first_name: governor.first_name,
      last_name: governor.last_name,
      role: governor.role,
      phone: governor.phone,
      area_id: areaId
    };

    const result = await createUser(token, userData);
    if (result) {
      console.log(`✅ ${governor.first_name} ${governor.last_name} - ${governor.zoneName}`);
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n🎉 Opération terminée!');
  console.log(`✅ Gouverneurs créés: ${successCount}`);
  console.log(`❌ Échecs: ${failCount}`);
}

main().catch(console.error);
