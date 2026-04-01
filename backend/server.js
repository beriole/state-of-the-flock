require('dotenv').config();
const express = require('express');
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
