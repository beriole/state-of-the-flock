const axios = require('axios');

const API_URL = 'https://state-of-the-flock.onrender.com/api';

// Données des gouverneurs Area 3 et Area 4
const governorsData = [
  // AREA 3 - Choir
  {
    first_name: 'Stella',
    last_name: 'Lp',
    email: 'stella.lp@njangui.org',
    phone: '681001122',
    password: 'Stella@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'Choir'
  },
  {
    first_name: 'Nora',
    last_name: 'Lp',
    email: 'nora.lp@njangui.org',
    phone: '681112233',
    password: 'Nora@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'Choir'
  },
  {
    first_name: 'Maxi',
    last_name: 'Leader',
    email: 'maxi@njangui.org',
    phone: '681223344',
    password: 'Maxi@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'FES Choir'
  },
  {
    first_name: 'Shalom',
    last_name: 'Leader',
    email: 'shalom@njangui.org',
    phone: '681334455',
    password: 'Shalom@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'GES Choir'
  },
  // AREA 3 - Dancing Stars
  {
    first_name: 'Jacobson',
    last_name: 'Leader',
    email: 'jacobson@njangui.org',
    phone: '681445566',
    password: 'Jacobson@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'Doves'
  },
  {
    first_name: 'Rawlings',
    last_name: 'Leader',
    email: 'rawlings@njangui.org',
    phone: '681556677',
    password: 'Rawlings@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'Spiders'
  },
  {
    first_name: 'Cimon',
    last_name: 'Leader',
    email: 'cimon@njangui.org',
    phone: '681667788',
    password: 'Cimon@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'Unicorn'
  },
  {
    first_name: 'Ricardo',
    last_name: 'Leader',
    email: 'ricardo.ds@njangui.org',
    phone: '681778899',
    password: 'Ricardo@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'FES DS'
  },
  // AREA 3 - Film Stars
  {
    first_name: 'Kevine',
    last_name: 'Leader',
    email: 'kevine@njangui.org',
    phone: '682001122',
    password: 'Kevine@123',
    role: 'Governor',
    regionName: 'Area 3',
    zoneName: 'Film Stars'
  },
  // AREA 4 - Ushers
  {
    first_name: 'Karl',
    last_name: 'Leader',
    email: 'karl@njangui.org',
    phone: '682112233',
    password: 'Karl@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Ushers'
  },
  {
    first_name: 'Smith',
    last_name: 'Leader',
    email: 'smith@njangui.org',
    phone: '682223344',
    password: 'Smith@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Ushers'
  },
  {
    first_name: 'Chris',
    last_name: 'Leader',
    email: 'chris@njangui.org',
    phone: '682334455',
    password: 'Chris@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Ushers'
  },
  // AREA 4 - Airport Stars
  {
    first_name: 'Claris',
    last_name: 'Leader',
    email: 'claris@njangui.org',
    phone: '682445566',
    password: 'Claris@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Airport Stars'
  },
  {
    first_name: 'GES',
    last_name: 'Leader',
    email: 'ges.airport@njangui.org',
    phone: '682556677',
    password: 'Ges@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Airport GES'
  },
  {
    first_name: 'FES',
    last_name: 'Leader',
    email: 'fes.airport@njangui.org',
    phone: '682667788',
    password: 'Fes@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Airport FES'
  },
  // AREA 4 - Projection
  {
    first_name: 'Elysee',
    last_name: 'Dr',
    email: 'elysee.dr@njangui.org',
    phone: '682778899',
    password: 'Elysee@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Projection'
  },
  // AREA 4 - Perfect Sound
  {
    first_name: 'Rudolph',
    last_name: 'Leader',
    email: 'rudolph@njangui.org',
    phone: '683001122',
    password: 'Rudolph@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Perfect Sound'
  },
  // AREA 4 - Photography
  {
    first_name: 'Cathy',
    last_name: 'Leader',
    email: 'cathy@njangui.org',
    phone: '683112233',
    password: 'Cathy@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Photography'
  },
  // AREA 4 - Communion Stars
  {
    first_name: 'Leena',
    last_name: 'Leader',
    email: 'leena@njangui.org',
    phone: '683223344',
    password: 'Leena@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Communion Stars'
  },
  // AREA 4 - Instrumentalist
  {
    first_name: 'Mike',
    last_name: 'Ps',
    email: 'mike.ps@njangui.org',
    phone: '683334455',
    password: 'Mike@123',
    role: 'Governor',
    regionName: 'Area 4',
    zoneName: 'Instrumentalist'
  }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function loginAsBishop() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`🔄 Tentative de connexion ${attempt}/5...`);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'berioletsague@gmail.com',
        password: 'Beriole'
      });
      console.log('✅ Connecté en tant que Bishop');
      return response.data.token;
    } catch (error) {
      console.log(`❌ Tentative ${attempt} échouée: ${error.response?.status}`);
      if (attempt < 5) {
        const waitTime = 30000; // 30 seconds
        console.log(`⏳ Attente de ${waitTime/1000} secondes avant la prochaine tentative...`);
        await delay(waitTime);
      }
    }
  }
  throw new Error('Impossible de se connecter après 5 tentatives');
}

async function getRegions(token) {
  try {
    await delay(3000);
    const response = await axios.get(`${API_URL}/regions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return [];
  }
}

async function getAreas(token) {
  try {
    await delay(3000);
    const response = await axios.get(`${API_URL}/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.areas || response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return [];
  }
}

async function createRegion(token, name) {
  try {
    await delay(3000);
    const response = await axios.post(`${API_URL}/regions`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

async function createArea(token, name, number, regionId) {
  try {
    await delay(3000);
    const response = await axios.post(`${API_URL}/areas`, {
      name,
      number,
      region_id: regionId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.log(`   ❌ Error creating area ${name}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function createUser(token, userData) {
  try {
    await delay(3000);
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.log(`⚠️ User ${userData.email}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Création des gouverneurs Area 3 et Area 4...\n');

  const token = await loginAsBishop();
  if (!token) return;

  // Get regions
  let regions = await getRegions(token);
  
  // Create Area 3 and Area 4 if they don't exist
  const regionNames = ['Area 3', 'Area 4'];
  const regionMap = {};

  for (const name of regionNames) {
    let region = regions.find(r => r.name === name);
    if (!region) {
      console.log(`➕ Création de la region: ${name}`);
      region = await createRegion(token, name);
      regions = await getRegions(token);
      region = regions.find(r => r.name === name);
    }
    if (region) {
      regionMap[name] = region.id;
      console.log(`✅ Region ${name}: ${region.id}`);
    }
  }

  // Get areas
  let areas = await getAreas(token);
  
  // Group by zone
  const zoneMap = {};
  governorsData.forEach(g => {
    if (!zoneMap[g.zoneName]) {
      zoneMap[g.zoneName] = g.regionName;
    }
  });

  // Create areas - need to find available numbers
  const areaMap = {};
  
  console.log('\n📋 Recherche des areas existantes...');
  areas = await getAreas(token);
  console.log(`Areas existantes (${areas.length}):`, areas.map(a => `${a.name} (#${a.number})`).join(', '));
  
  // Find max number used
  const maxNumber = areas.reduce((max, a) => Math.max(max, a.number || 0), 0);
  console.log(`Numéro max utilisé: ${maxNumber}`);
  
  // Try to create areas with higher numbers
  let areaCounter = maxNumber + 1;
  
  for (const [zoneName, regionName] of Object.entries(zoneMap)) {
    // Try different case variations
    let area = areas.find(a => 
      a.name.toLowerCase() === zoneName.toLowerCase() ||
      a.name.toUpperCase() === zoneName.toUpperCase()
    );
    
    if (!area && regionMap[regionName]) {
      console.log(`➕ Creating area: ${zoneName} (#${areaCounter})...`);
      area = await createArea(token, zoneName, areaCounter, regionMap[regionName]);
      await delay(2000);
      areas = await getAreas(token);
      area = areas.find(a => a.name.toLowerCase() === zoneName.toLowerCase());
      areaCounter++;
    }
    
    if (area) {
      areaMap[zoneName] = area.id;
      console.log(`✅ Area ${zoneName}: ${area.id}`);
    }
  }

  // Create governors
  console.log('\n📋 Création des gouverneurs...');
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
