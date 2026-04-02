require('dotenv').config();
const express = require('express'); // Triggering re-deployment
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const {
  sequelize,
  setupAssociations
} = require('./models');

// Import des routeurs
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const memberRoutes = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const bacentaRoutes = require('./routes/bacenta');
const callLogRoutes = require('./routes/callLogs');
const reportRoutes = require('./routes/reports');
const syncRoutes = require('./routes/sync');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const areaRoutes = require('./routes/areas');
const ministryRoutes = require('./routes/ministryRoutes');
const regionRoutes = require('./routes/regionRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// Configuration CORS plus permissive pour le développement local
app.use(cors({
  origin: true, // Autoriser temporairement toutes les origines pour débloquer
  credentials: true
}));

// Activer trust proxy pour Render (proxy inverse)
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes santé
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Temporary seed route for testing
app.get('/seed', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const { User } = require('./models');

    // First, try to update existing user
    const existingUser = await User.findOne({ where: { email: 'berioletsague@gmail.com' } });
    if (existingUser) {
      const password_hash = await bcrypt.hash('Beriole', 12);
      await existingUser.update({
        role: 'Bishop',
        password_hash: password_hash
      });
      res.json({ message: 'User berioletsague@gmail.com updated with password Beriole and role Bishop' });
      return;
    }

    // If user doesn't exist, create test users
    const usersData = [
      { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'Bishop', password: 'Password123' },
      { first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', role: 'Assisting_Overseer', password: 'Password123' },
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
    }
    res.json({ message: 'Test users seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route temporaire pour l'importation des membres de Calvin
const { importCalvinMembers } = require('./utils/importCalvin');
app.get('/api/members/seed-calvin', async (req, res) => {
  try {
    const result = await importCalvinMembers();
    res.json({
      message: 'Importation des membres de Calvin terminée',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route temporaire pour nettoyer les doublons de Calvin
const { cleanupCalvinDuplicates } = require('./utils/cleanupCalvin');
app.get('/api/members/cleanup-calvin', async (req, res) => {
  try {
    const result = await cleanupCalvinDuplicates();
    res.json({
      message: 'Nettoyage des doublons terminé',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de debug pour diagnostiquer le problème de Calvin
app.get('/api/debug/calvin', async (req, res) => {
  try {
    const { User, Region, Area, Member } = require('./models');
    const GOVERNOR_EMAIL = 'calvin.rev@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Calvin introuvable' });

    const region = await Region.findOne({ 
      where: { governor_id: user.id },
      include: [{ model: Area, as: 'areas' }]
    });

    const directMemberCount = await Member.count({ where: { leader_id: user.id } });
    
    // Si pas de région, on cherche toutes les régions pour voir s'il y en a une orpheline ou pour comprendre la structure
    const allRegions = await Region.findAll({ include: [{ model: User, as: 'governor', attributes: ['email'] }] });

    res.json({
      calvin: {
        id: user.id,
        email: user.email,
        role: user.role,
        area_id: user.area_id
      },
      region_assigned: region ? {
        id: region.id,
        name: region.name,
        area_count: region.areas.length,
        area_ids: region.areas.map(a => a.id)
      } : null,
      direct_member_count: directMemberCount,
      all_regions: allRegions.map(r => ({ id: r.id, name: r.name, governor: r.governor?.email }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Route de correction pour Mukete
app.get('/api/fix/mukete', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'mukete@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Mukete introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 9' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Mukete',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Mukete',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Mukete
const { importMuketeMembers } = require('./utils/importMukete');
app.get('/api/members/seed-mukete', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'mukete@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importMuketeMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-mukete', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'mukete@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Daline
app.get('/api/fix/daline', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'daline@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Daline introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 10' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Daline',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Daline',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Daline
const { importDalineMembers } = require('./utils/importDaline');
app.get('/api/members/seed-daline', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'daline@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importDalineMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-daline', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'daline@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Vera
app.get('/api/fix/vera', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'vera@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Vera introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 11' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Vera',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Vera',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Vera
const { importVeraMembers } = require('./utils/importVera');
app.get('/api/members/seed-vera', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'vera@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importVeraMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-vera', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'vera@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Clifford
app.get('/api/fix/clifford', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'clifford@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Clifford introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 12' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Clifford',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Clifford',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Clifford
const { importCliffordMembers } = require('./utils/importClifford');
app.get('/api/members/seed-clifford', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'clifford@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importCliffordMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-clifford', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'clifford@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Cynthia
app.get('/api/fix/cynthia', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'cynthia.lp@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Cynthia introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 13' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Cynthia',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Cynthia',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Cynthia
const { importCynthiaMembers } = require('./utils/importCynthia');
app.get('/api/members/seed-cynthia', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'cynthia.lp@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importCynthiaMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-cynthia', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'cynthia.lp@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Reward
app.get('/api/fix/reward', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'reward@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Reward introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 14' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Reward',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Reward',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Reward
const { importRewardMembers } = require('./utils/importReward');
app.get('/api/members/seed-reward', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'reward@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importRewardMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-reward', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'reward@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Clovis
app.get('/api/fix/clovis', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'clovis.ps@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Clovis introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 15' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Clovis',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Clovis',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Clovis
const { importClovisMembers } = require('./utils/importClovis');
app.get('/api/members/seed-clovis', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'clovis.ps@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importClovisMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/members/cleanup-clovis', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'clovis.ps@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Route de correction pour Sandrine
app.get('/api/fix/sandrine', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const GOVERNOR_EMAIL = 'sandrine.lp@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Sandrine introuvable' });

    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 16' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Sandrine',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Ecole de Poste') {
      area = await Area.findOne({ where: { name: 'Ecole de Poste' } });
      if (!area) {
        area = await Area.create({ name: 'Ecole de Poste', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Correction effectuée pour Sandrine',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Importation des membres pour Sandrine
const { importSandrineMembers } = require('./utils/importSandrine');
app.get('/api/members/seed-sandrine', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'sandrine.lp@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importSandrineMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Nettoyage des doublons pour Sandrine
app.get('/api/members/cleanup-sandrine', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'sandrine.lp@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const members = await Member.findAll({ where: { leader_id: user.id } });
    const seen = new Set();
    const duplicates = [];

    for (const m of members) {
      const key = `${m.first_name}-${m.last_name}-${m.phone_primary}`.toLowerCase();
      if (seen.has(key)) {
        duplicates.push(m.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await Member.destroy({ where: { id: duplicates } });
    }

    res.json({ message: 'Cleanup complete', removed: duplicates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Debugging : compte réel des membres
app.get('/api/debug/sandrine', async (req, res) => {
  try {
    const { Member, User } = require('./models');
    const user = await User.findOne({ where: { email: 'sandrine.lp@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const count = await Member.count({ 
      where: { 
        leader_id: user.id,
        area_id: user.area_id 
      } 
    });
    
    const sample = await Member.findAll({ 
      where: { leader_id: user.id },
      limit: 5,
      attributes: ['id', 'first_name', 'phone_primary', 'state']
    });

    res.json({ 
      user: { id: user.id, email: user.email, area_id: user.area_id },
      member_count: count,
      sample_members: sample
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------

// ---------------------------------------------------------
// BONGEH ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/bongeh', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'bongeh@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Bongeh@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Bongeh',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Bongeh' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Bongeh',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Bongeh') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Bongeh' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Bongeh', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Bongeh',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importBongehMembers } = require('./utils/importBongeh');
app.get('/api/members/seed-bongeh', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'bongeh@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importBongehMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// MERCEDES ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/mercedes', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'mercedes.ps@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Mercedes@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Mercedes',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Mercedes' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Mercedes',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Mercedes') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Mercedes' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Mercedes', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Mercedes',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importMercedesMembers } = require('./utils/importMercedes');
app.get('/api/members/seed-mercedes', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'mercedes.ps@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importMercedesMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// EMMANUEL ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/emmanuel', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'emmanuel.glory@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Emmanuel@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Emmanuel',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Emmanuel' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Emmanuel',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Emmanuel') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Emmanuel' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Emmanuel', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Emmanuel',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importEmmanuelMembers } = require('./utils/importEmmanuel');
app.get('/api/members/seed-emmanuel', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'emmanuel.glory@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importEmmanuelMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// PRISCILLA ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/priscilla', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'priscilla.lp@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Priscilla@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Priscilla',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Priscilla' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Priscilla',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Priscilla') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Priscilla' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Priscilla', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Priscilla',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importPriscillaMembers } = require('./utils/importPriscilla');
app.get('/api/members/seed-priscilla', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'priscilla.lp@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importPriscillaMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// ESTHER ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/esther', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'esther@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Esther@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Esther',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Esther' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Esther',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Esther') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Esther' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Esther', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Esther',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importEstherMembers } = require('./utils/importEsther');
app.get('/api/members/seed-esther', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'esther@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importEstherMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// DEXTER ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/dexter', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'dexter.ps@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Dexter@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Dexter',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Dexter' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Dexter',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Dexter') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Dexter' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Dexter', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Dexter',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importDexterMembers } = require('./utils/importDexter');
app.get('/api/members/seed-dexter', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'dexter.ps@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importDexterMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// AIME ONBOARDING ROUTES
// ---------------------------------------------------------

app.get('/api/fix/aime', async (req, res) => {
  try {
    const { User, Region, Area } = require('./models');
    const bcrypt = require('bcrypt');
    const EMAIL = 'aime.ps@njangui.org';
    
    let user = await User.findOne({ where: { email: EMAIL } });
    if (!user) {
      const password_hash = await bcrypt.hash('Aime@123', 12);
      user = await User.create({
        email: EMAIL,
        password_hash,
        role: 'Governor',
        church_role: 'Governor',
        permissions: ['READ_ALL', 'WRITE_OWN', 'DELETE_OWN'],
        first_name: 'Aime',
        last_name: 'Governor',
        account_status: 'Active'
      });
    }

    let region = await Region.findOne({ where: { name: 'Région Gouverneur Aime' } });
    if (!region) {
      region = await Region.create({
        name: 'Région Gouverneur Aime',
        governor_id: user.id
      });
    } else {
      await region.update({ governor_id: user.id });
    }

    let area;
    if (user.area_id) {
      area = await Area.findByPk(user.area_id);
    }
    
    if (!area || area.name !== 'Zone Gouverneur Aime') {
      area = await Area.findOne({ where: { name: 'Zone Gouverneur Aime' } });
      if (!area) {
        area = await Area.create({ name: 'Zone Gouverneur Aime', region_id: region.id });
      }
      await user.update({ area_id: area.id });
    }
    
    if (area) {
      await area.update({ region_id: region.id });
    }

    res.json({
      message: 'Onboarding (création/correction) effectué pour Aime',
      user_id: user.id,
      area_id: user.area_id,
      assigned_region: region.name,
      area_linked: area.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importAimeMembers } = require('./utils/importAime');
app.get('/api/members/seed-aime', async (req, res) => {
  try {
     const { User } = require('./models');
     const user = await User.findOne({ where: { email: 'aime.ps@njangui.org' } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     const result = await importAimeMembers(user.id, user.area_id);
     res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de correction pour Calvin













app.get('/api/fix/calvin', async (req, res) => {
  try {
    const { User, Region, Area, Member } = require('./models');
    const GOVERNOR_EMAIL = 'calvin.rev@njangui.org';
    
    const user = await User.findOne({ where: { email: GOVERNOR_EMAIL } });
    if (!user) return res.json({ error: 'Calvin introuvable' });

    // 1. Trouver une région sans gouverneur ou en créer une
    let region = await Region.findOne({ where: { governor_id: null, name: 'Région 3' } });
    if (!region) {
       region = await Region.findOne({ where: { governor_id: null } });
    }
    
    if (!region) {
      // Créer une nouvelle région si aucune n'est libre
      region = await Region.create({
        name: 'Région Gouverneur Calvin',
        governor_id: user.id
      });
    } else {
      // Assigner Calvin à la région trouvée
      await region.update({ governor_id: user.id });
    }

    // 2. S'assurer que la zone de Calvin appartient à cette région
    const area = await Area.findByPk(user.area_id);
    if (area) {
      await area.update({ region_id: region.id });
    }

    // 3. (Optionnel) Vérifier et corriger les membres si nécessaire
    // Mais s'ils sont déjà dans user.area_id, et que area est dans la région, ça devrait marcher.

    res.json({
      message: 'Correction effectuée',
      governor: user.email,
      assigned_region: region.name,
      area_linked: area ? area.name : 'Aucune zone trouvée pour le user'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes API - Version avec zones
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/bacenta', bacentaRoutes);
app.use('/api/call-logs', callLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/ministries', ministryRoutes);
app.use('/api/regions', regionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'FirstLove Church API is running' });
});

// Final fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});
// Erreurs globales
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Démarrage serveur et DB
(async () => {
  try {
    console.log('📡 Tentative de connexion à la base de données...');
    console.log(`📡 DB Config: Host=${process.env.DB_HOST || 'DATABASE_URL detected'}, Port=${process.env.DB_PORT || 'N/A'}`);

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données OK');

    // Init des associations
    setupAssociations();

    // Démarrage immédiat du serveur pour éviter les timeouts Render
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT}`);
      console.log(`--- 🚀 BACKEND VERSION: 1.2.1 (FIXED CORS) ---`);

      // Synchronisation en arrière-plan
      console.log('🔄 Synchronisation de la base de données en cours...');
      sequelize.sync()
        .then(async () => {
          console.log('✅ Base de données synchronisée');
          const { BacentaMeeting } = require('./models');
          const count = await BacentaMeeting.count();
          console.log(`--- 📊 TOTAL MEETINGS IN DB: ${count} ---`);
        })
        .catch(err => {
          console.error('❌ Erreur de synchronisation DB:', err.message);
          // On ne quitte pas forcément si sync échoue mais que la connexion est OK
        });
    });

    server.on('error', (err) => {
      console.error('❌ Erreur critique sur le serveur HTTP:', err);
    });

  } catch (error) {
    console.error('❌ Erreur fatale au démarrage:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
})();
