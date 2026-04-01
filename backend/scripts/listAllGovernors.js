const axios = require('axios');

const API_URL = 'https://state-of-the-flock.onrender.com/api';

async function loginAsBishop() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'berioletsague@gmail.com',
      password: 'Beriole'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

async function getAllUsers(token) {
  try {
    const response = await axios.get(`${API_URL}/users?limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.users || response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return [];
  }
}

async function getAreas(token) {
  try {
    const response = await axios.get(`${API_URL}/areas?limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.areas || response.data;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🔐 Connexion...');
  const token = await loginAsBishop();
  console.log('✅ Connecté\n');
  
  const users = await getAllUsers(token);
  const areas = await getAreas(token);
  
  // Create area name lookup
  const areaMap = {};
  areas.forEach(a => {
    areaMap[a.id] = a.name;
  });
  
  // Filter governors
  const governors = users.filter(u => u.role === 'Governor');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📋 LISTE COMPLÈTE DES GOUVERNEURS CRÉÉS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Group by area
  const byArea = {};
  governors.forEach(g => {
    const areaName = g.area_id ? areaMap[g.area_id] || 'N/A' : 'N/A';
    if (!byArea[areaName]) byArea[areaName] = [];
    byArea[areaName].push(g);
  });
  
  // Print by area
  const sortedAreas = Object.keys(byArea).sort();
  let count = 0;
  
  for (const areaName of sortedAreas) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 ${areaName}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    for (const g of byArea[areaName]) {
      count++;
      console.log(`  ${count}. ${g.first_name} ${g.last_name}`);
      console.log(`     📧 Email: ${g.email}`);
      console.log(`     📱 Téléphone: ${g.phone || 'N/A'}`);
      console.log(`     🔑 Mot de passe: [mot de passe défini lors de la création]`);
      console.log();
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total: ${governors.length} gouverneurs`);
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);
