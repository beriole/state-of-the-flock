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
app.use(cors({
  origin: true,
  credentials: true
}));
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes santé
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'FirstLove Church API is running' });
});

// Mapping All Regions Route
const { mapAllRegions } = require('./utils/mapRegions');
app.get('/api/fix/map-all-regions', async (req, res) => {
  try {
    const result = await mapAllRegions();
    res.json(result);
  } catch (error) {
    console.error('Mapping error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Existing Seed Routes (Keeping some for backward compatibility)
const { importSandrineMembers } = require('./utils/importSandrine');
app.get('/api/members/seed-sandrine', async (req, res) => {
  try {
    const { User, Member } = require('./models');
    const user = await User.findOne({ where: { email: 'sandrine.lp@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const result = await importSandrineMembers(user.id, user.area_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importMarcoMembers } = require('./utils/importMarco');
app.get('/api/members/seed-marco', async (req, res) => {
  try {
    const { User } = require('./models');
    const user = await User.findOne({ where: { email: 'marco@njangui.org' } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const result = await importMarcoMembers(user.id, user.area_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes API
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

// Fallback
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
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données OK');
    setupAssociations();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT}`);
      sequelize.sync({ alter: true }).then(() => console.log('✅ DB Synchronized'));
    });
  } catch (error) {
    console.error('❌ Erreur fatale au démarrage:', error.message);
    process.exit(1);
  }
})();
