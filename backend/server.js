require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes santé
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Temporary route to create test user with data
app.get('/create-test-user', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const { User, Member, Area, Attendance } = require('./models');

    // Create area first
    const area = await Area.create({
      name: 'Test Area',
      number: 1
    });

    // Create Bacenta Leader
    const passwordHash = await bcrypt.hash('Test123', 12);
    const leader = await User.create({
      email: 'test.leader@example.com',
      password_hash: passwordHash,
      first_name: 'Test',
      last_name: 'Leader',
      role: 'Bacenta_Leader',
      area_id: area.id,
      is_active: true
    });

    // Create some members
    const members = [];
    for (let i = 1; i <= 5; i++) {
      const member = await Member.create({
        first_name: `Member${i}`,
        last_name: 'Test',
        phone_primary: `+2250100000${i}`,
        gender: i % 2 === 0 ? 'F' : 'M',
        leader_id: leader.id,
        area_id: area.id,
        is_active: true,
        state: 'Sheep'
      });
      members.push(member);
    }

    // Create some attendance records
    for (const member of members) {
      await Attendance.create({
        member_id: member.id,
        sunday_date: new Date().toISOString().split('T')[0],
        present: Math.random() > 0.3, // 70% present
        marked_by_user_id: leader.id
      });
    }

    res.json({
      message: 'Test user created successfully',
      user: {
        email: 'test.leader@example.com',
        password: 'Test123',
        role: 'Bacenta_Leader',
        members_count: members.length
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
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

    // Init des associations
    setupAssociations();

    // Synchronisation désactivée - tables déjà créées manuellement
    await sequelize.sync({ alter: true });

    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT} (accessible sur http://${require('os').networkInterfaces().eth0?.[0]?.address || 'votre-ip'}:${PORT})`));
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
})();
