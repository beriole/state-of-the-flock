const { Sequelize } = require('sequelize');
const UserModel = require('./User');
const AreaModel = require('./Area');
const RegionModel = require('./Region');
const MinistryModel = require('./Ministry');
const MinistryAttendanceModel = require('./MinistryAttendance');
const MemberModel = require('./Member');
const AttendanceModel = require('./Attendance');
const CallLogModel = require('./callLog');
const BacentaMeetingModel = require('./BacentaMeeting');
const BacentaAttendanceModel = require('./BacentaAttendance');
const BacentaOfferingModel = require('./BacentaOffering');
const NotificationModel = require('./Notification');
const MinistryHeadcountModel = require('./MinistryHeadcount');

let sequelize;

if (!sequelize) {
  if (process.env.DATABASE_URL) {
    // Pour Railway et autres plateformes avec DATABASE_URL
    const dialect = process.env.DATABASE_URL.startsWith('postgres') ? 'postgres' : 'mysql';
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: dialect,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: dialect === 'postgres' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        ...(dialect === 'mysql' && {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci'
        })
      },
      timezone: '+00:00' // UTC
    });
  } else {
    // Configuration locale (MySQL)
    sequelize = new Sequelize(
      process.env.DB_NAME || 'state_of_the_flock',
      process.env.DB_USER || 'root',
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true,
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci'
        },
        timezone: '+00:00' // UTC
      }
    );
  }
}

// Initialisation des modèles
const User = UserModel(sequelize);
const Region = RegionModel(sequelize);
const Area = AreaModel(sequelize);
const Ministry = MinistryModel(sequelize);
const MinistryAttendance = MinistryAttendanceModel(sequelize);
const Member = MemberModel(sequelize);
const Attendance = AttendanceModel(sequelize);
const CallLog = CallLogModel(sequelize);
const BacentaMeeting = BacentaMeetingModel(sequelize);
const BacentaAttendance = BacentaAttendanceModel(sequelize);
const BacentaOffering = BacentaOfferingModel(sequelize);
const Notification = NotificationModel(sequelize);
const MinistryHeadcount = MinistryHeadcountModel(sequelize);

// Associations
function setupAssociations() {
  // User
  User.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });
  User.hasMany(Member, { foreignKey: 'leader_id', as: 'members' });
  User.hasMany(Attendance, { foreignKey: 'marked_by_user_id', as: 'marked_attendances' });
  User.hasMany(CallLog, { foreignKey: 'caller_id', as: 'call_logs' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

  // Bacenta
  User.hasMany(BacentaMeeting, { foreignKey: 'leader_id', as: 'bacenta_meetings' });
  User.hasMany(BacentaAttendance, { foreignKey: 'marked_by_user_id', as: 'marked_bacenta_attendances' });
  User.hasMany(BacentaOffering, { foreignKey: 'collected_by', as: 'collected_offerings' });
  User.hasMany(BacentaOffering, { foreignKey: 'verified_by', as: 'verified_offerings' });
  User.hasMany(BacentaMeeting, { foreignKey: 'verified_by', as: 'verified_bacenta_meetings' });

  // Region
  Region.hasMany(Area, { foreignKey: 'region_id', as: 'areas' });
  Region.belongsTo(User, { foreignKey: 'governor_id', as: 'governor' });

  // Area
  Area.hasMany(User, { foreignKey: 'area_id', as: 'leaders' });
  Area.hasMany(Member, { foreignKey: 'area_id', as: 'members' });
  Area.belongsTo(User, { foreignKey: 'overseer_id', as: 'overseer' });
  // New associations for Area
  Area.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });
  Area.belongsTo(User, { foreignKey: 'leader_id', as: 'leader_user' }); // Renamed to avoid confusion with potential existing 'leader' methods/mixins

  // User hasOne Area as overseer
  User.hasOne(Area, { foreignKey: 'overseer_id', as: 'overseen_area' });
  // User hasOne Area as leader (responsible)
  User.hasOne(Area, { foreignKey: 'leader_id', as: 'led_area' });
  // User hasOne Region as governor
  User.hasOne(Region, { foreignKey: 'governor_id', as: 'governed_region' });

  // Member
  Member.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });
  Member.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });
  Member.hasMany(Attendance, { foreignKey: 'member_id', as: 'attendances' });
  Member.hasMany(CallLog, { foreignKey: 'member_id', as: 'call_logs' });
  Member.hasMany(BacentaAttendance, { foreignKey: 'member_id', as: 'bacenta_attendances' });

  // Attendance
  Attendance.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
  Attendance.belongsTo(User, { foreignKey: 'marked_by_user_id', as: 'marked_by' });

  // CallLog
  CallLog.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
  CallLog.belongsTo(User, { foreignKey: 'caller_id', as: 'caller' });

  // BacentaMeeting
  BacentaMeeting.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });
  BacentaMeeting.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });
  BacentaMeeting.hasMany(BacentaAttendance, { foreignKey: 'bacenta_meeting_id', as: 'attendances' });
  BacentaMeeting.hasMany(BacentaOffering, { foreignKey: 'bacenta_meeting_id', as: 'offerings' });

  // BacentaAttendance
  BacentaAttendance.belongsTo(BacentaMeeting, { foreignKey: 'bacenta_meeting_id', as: 'meeting' });
  BacentaAttendance.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
  BacentaAttendance.belongsTo(User, { foreignKey: 'marked_by_user_id', as: 'marked_by' });

  // BacentaOffering
  BacentaOffering.belongsTo(BacentaMeeting, { foreignKey: 'bacenta_meeting_id', as: 'meeting' });
  BacentaOffering.belongsTo(User, { foreignKey: 'collected_by', as: 'collector' });
  BacentaOffering.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

  // Notification
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Ministry and MinistryAttendance
  Ministry.hasMany(Member, { foreignKey: 'ministry_id', as: 'members' });
  Ministry.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });
  Ministry.hasMany(MinistryAttendance, { foreignKey: 'ministry_id', as: 'attendance_records' });

  Member.belongsTo(Ministry, { foreignKey: 'ministry_id', as: 'ministry_association' }); // Renaming to distinguish from 'ministry' string field if needed, or just 'ministry_details'

  MinistryAttendance.belongsTo(Ministry, { foreignKey: 'ministry_id', as: 'ministry' });
  MinistryAttendance.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
  MinistryAttendance.belongsTo(User, { foreignKey: 'marked_by_user_id', as: 'marked_by' });

  User.hasOne(Ministry, { foreignKey: 'leader_id', as: 'led_ministry' });

  // MinistryHeadcount
  MinistryHeadcount.belongsTo(Ministry, { foreignKey: 'ministry_id', as: 'ministry' });
  MinistryHeadcount.belongsTo(User, { foreignKey: 'marked_by_user_id', as: 'marked_by' });
  Ministry.hasMany(MinistryHeadcount, { foreignKey: 'ministry_id', as: 'headcounts' });
}

module.exports = {
  sequelize,
  User,
  Region,
  Area,
  Ministry,
  MinistryAttendance,
  Member,
  Attendance,
  CallLog,
  BacentaMeeting,
  BacentaAttendance,
  BacentaOffering,
  Notification,
  MinistryHeadcount,
  setupAssociations
};
