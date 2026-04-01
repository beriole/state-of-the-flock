const axios = require('axios');

const API_URL = 'https://state-of-the-flock.onrender.com/api';

async function loginAsBishop() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'berioletsague@gmail.com',
      password: 'Beriole'
    });
    console.log('✅ Connecté en tant que Bishop');
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

async function getAreas(token) {
  try {
    const response = await axios.get(`${API_URL}/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.areas || response.data;
  } catch (error) {
    console.error('❌ Error getting areas:', error.response?.data || error.message);
    return [];
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
    console.log(`⚠️ User creation error:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function getRegions(token) {
  try {
    const response = await axios.get(`${API_URL}/regions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error getting regions:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Fix Camp Sonel area...\n');

  const token = await loginAsBishop();
  
  // Get regions
  const regions = await getRegions(token);
  const area1Region = regions.find(r => r.name === 'Area 1');
  console.log('Area 1 region:', area1Region);
  
  // Get areas
  let areas = await getAreas(token);
  console.log('Current areas:', areas.map(a => a.name));
  
  let campSonelArea = areas.find(a => a.name.toLowerCase() === 'camp sonel');
  
  if (!campSonelArea && area1Region) {
    console.log('\n➕ Creating Camp Sonel area...');
    campSonelArea = await createArea(token, 'Camp Sonel', 1, area1Region.id);
    areas = await getAreas(token);
    campSonelArea = areas.find(a => a.name.toLowerCase() === 'camp sonel');
  }
  
  if (campSonelArea) {
    console.log(`✅ Camp Sonel area found: ${campSonelArea.id}`);
    
    // Create Marcel Ps
    const userData = {
      email: 'marcel.ps@njangui.org',
      password: 'Marcel@123',
      first_name: 'Marcel',
      last_name: 'Ps',
      role: 'Governor',
      phone: '677001122',
      area_id: campSonelArea.id
    };
    
    const result = await createUser(token, userData);
    if (result) {
      console.log('✅ Marcel Ps created successfully!');
    } else {
      console.log('❌ Marcel Ps already exists or failed');
    }
  } else {
    console.log('❌ Could not create or find Camp Sonel area');
  }
  
  console.log('\n🎉 Opération terminée!');
}

main().catch(console.error);
