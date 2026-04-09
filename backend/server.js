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

app.get('/api/fix/leader-areas', async (req, res) => {
  try {
    const { User, Member } = require('./models');
    // Find all users who are leaders/governors but have NO area_id
    const usersWithoutArea = await User.findAll({ where: { area_id: null } });
    let fixedCount = 0;
    
    for (let u of usersWithoutArea) {
      // Check if they have members
      const member = await Member.findOne({ where: { leader_id: u.id } });
      if (member && member.area_id) {
        await u.update({ area_id: member.area_id });
        fixedCount++;
      }
    }
    res.json({ message: "Area fix applied successfully", fixedCount });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/fix/ricardo-exact', async (req, res) => {
  try {
    const { User, Region, Area, Member } = require('./models');
    
    // Ensure Region "Area 2" exists
    let region = await Region.findOne({ where: { name: 'Area 2' } });
    if (!region) {
      region = await Region.create({ name: 'Area 2' });
    }

    // Ensure Area "General" exists under "Area 2"
    let area = await Area.findOne({ where: { name: 'General', region_id: region.id } });
    if (!area) {
      area = await Area.create({ name: 'General', region_id: region.id });
    }

    // Update Ricardo
    const ricardo = await User.findOne({ where: { email: 'ricardo@njangui.org' } });
    if (ricardo) {
      await ricardo.update({
        first_name: 'Ricardo',
        last_name: 'Leader', // using exact data from user
        phone: '680445566',
        area_id: area.id,
        role: 'Governor'
      });

      // Move his members to the right Area
      const updatedMembers = await Member.update(
        { area_id: area.id },
        { where: { leader_id: ricardo.id } }
      );

      res.json({ message: "Ricardo & members fully migrated to Area 2 / General", membersMoved: updatedMembers[0] });
    } else {
      res.status(404).json({ error: "Ricardo not found" });
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

const { importRicardoMembers } = require('./utils/importRicardo');
app.get('/api/members/seed-ricardo', async (req, res) => {
  try {
    const { User, Area, Region } = require('./models');
    const bcrypt = require('bcrypt');

    // Make sure we have an area for him
    let area = await Area.findOne();
    if (!area) {
      let region = await Region.findOne();
      if (!region) {
         region = await Region.create({ name: 'Default Region' });
      }
      area = await Area.create({ name: 'Default Area', region_id: region.id });
    }

    // Find or create Ricardo
    let user = await User.findOne({ where: { email: 'ricardo@njangui.org' } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('Ricardo@123', 10);
      user = await User.create({
        first_name: 'Ricardo',
        last_name: '',
        email: 'ricardo@njangui.org',
        password: hashedPassword,
        role: 'Bacenta_Leader',
        phone: '',
        area_id: area.id,
        is_active: true
      });
    }

    const targetAreaId = user.area_id || area.id;
    const result = await importRicardoMembers(user.id, targetAreaId);
    res.json({ userCreated: false, importResult: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { importAkimeMembers } = require('./utils/importAkimeV2');
app.get('/api/members/seed-akime', async (req, res) => {
  try {
    const { User, Area, Region } = require('./models');
    const bcrypt = require('bcrypt');

    let area = await Area.findOne();
    if (!area) {
      let region = await Region.findOne();
      if (!region) {
         region = await Region.create({ name: 'Default Region' });
      }
      area = await Area.create({ name: 'Default Area', region_id: region.id });
    }

    let user = await User.findOne({ where: { email: 'akime.rev@njangui.org' } });
    let created = false;
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('Akime@123', 10);
      user = await User.create({
        first_name: 'Akime',
        last_name: '',
        email: 'akime.rev@njangui.org',
        password: hashedPassword,
        role: 'Governor',
        phone: '',
        area_id: area.id,
        is_active: true
      });
      created = true;
    }

    const targetAreaId = user.area_id || area.id;
    const result = await importAkimeMembers(user.id, targetAreaId);
    res.json({ userCreated: created, importResult: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mass Service Migration Route
app.get('/api/fix/services', async (req, res) => {
  try {
    const { User, Member } = require('./models');
    
    // 1. Update all members to the default service (if not already set correctly)
    const result1 = await Member.update(
      { service_type: 'L\' Expérience Service' },
      { where: { service_type: null } }
    );
    // Let's also ensure those that might be empty are set correctly
    await Member.update(
      { service_type: 'L\' Expérience Service' },
      { where: { service_type: '' } }
    );

    // 2. Find Dexter's User ID
    const dexterUser = await User.findOne({ where: { email: 'dexter.ps@njangui.org' } });
    let dexterUpdates = 0;
    
    // 3. If Dexter exists, update his members to FLES
    if (dexterUser) {
      const dbResult = await Member.update(
        { service_type: 'FLES' },
        { where: { leader_id: dexterUser.id } }
      );
      dexterUpdates = dbResult[0] || 0; // dbResult[0] contains the number of affected rows
    }

    res.json({
      message: 'Migration des services terminée',
      global_updates_count: result1[0] || 0,
      dexter_fles_updates_count: dexterUpdates
    });
  } catch (error) {
    console.error('Migration des services erreur:', error);
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
