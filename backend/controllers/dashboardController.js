// controllers/dashboardController.js
const { Member, Attendance, CallLog, BacentaMeeting, User, Area, sequelize } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  // Tableau de bord du leader
  getLeaderDashboard: async (req, res) => {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      // Allow Governors/Bishops to view stats for a specific leader
      const targetUserId = (req.query.user_id && ['Governor', 'Bishop', 'Assisting_Overseer'].includes(userRole))
        ? req.query.user_id
        : req.user.userId;

      const today = new Date();

      // Dernier dimanche
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - today.getDay()); // dimanche courant ou précédent
      const lastSundayStr = lastSunday.toISOString().split('T')[0];

      // Dimanche précédent
      const previousSunday = new Date(lastSunday);
      previousSunday.setDate(lastSunday.getDate() - 7);
      const previousSundayStr = previousSunday.toISOString().split('T')[0];

      let dashboardData = {};

      // If viewing specific leader stats (Bacenta Leader role or viewing another user as Governor/Bishop)
      if (userRole === 'Bacenta_Leader' || (targetUserId !== req.user.userId)) {
        // 1️⃣ Statistiques de base du leader (targetUserId)
        const totalMembers = await Member.count({
          where: { leader_id: targetUserId, is_active: true }
        });

        const lastAttendance = await Attendance.findOne({
          where: { sunday_date: lastSundayStr },
          include: [{
            model: Member,
            as: 'member',
            where: { leader_id: targetUserId }
          }],
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'total'],
            [sequelize.fn('SUM', sequelize.col('present')), 'present_count']
          ],
          raw: true
        });

        const totalPresent = Number(lastAttendance?.present_count || 0);
        const totalRecords = Number(lastAttendance?.total || 0);
        const attendancePercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

        // 2️⃣ Appels en attente
        const pendingCalls = await CallLog.count({
          where: { next_followup_date: { [Op.lte]: today } },
          include: [{
            model: Member,
            as: 'member',
            where: { leader_id: targetUserId }
          }]
        });

        // 3️⃣ Réunions Bacenta récentes (7 derniers jours)
        const recentBacentaMeetings = await BacentaMeeting.count({
          where: {
            leader_id: targetUserId,
            meeting_date: { [Op.gte]: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        });

        // 4️⃣ Statistiques des 30 derniers jours
        const recentBacentaStats = await BacentaMeeting.findOne({
          where: {
            leader_id: targetUserId,
            meeting_date: { [Op.gte]: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
          },
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_meetings'],
            [sequelize.fn('SUM', sequelize.col('offering_amount')), 'total_offering'],
            [sequelize.fn('AVG', sequelize.col('total_members_present')), 'avg_attendance']
          ],
          raw: true
        });

        dashboardData = {
          summary: {
            total_members: totalMembers,
            last_attendance_percentage: attendancePercentage,
            pending_follow_ups: pendingCalls,
            recent_bacenta_meetings: recentBacentaMeetings
          },
          bacenta_stats: {
            recent_meetings: Number(recentBacentaStats?.total_meetings || 0),
            total_offering: parseFloat(recentBacentaStats?.total_offering || 0),
            average_attendance: Math.round(Number(recentBacentaStats?.avg_attendance || 0))
          },
          quick_actions: [
            { action: 'mark_attendance', label: 'Marquer présence', icon: 'check' },
            { action: 'view_call_list', label: 'Liste d\'appels', icon: 'phone' },
            { action: 'create_bacenta', label: 'Nouvelle réunion', icon: 'users' }
          ]
        };

      } else if (userRole === 'Bishop' || userRole === 'Assisting_Overseer' || userRole === 'Governor') {
        // 1️⃣ Statistiques globales complètes
        const totalMembers = await Member.count({ where: { is_active: true } });
        const totalLeaders = await User.count({ where: { role: 'Bacenta_Leader', is_active: true } });
        const totalAreas = await Area.count();

        // Statistiques de présence (dernière semaine)
        const weeklyAttendance = await Attendance.findAll({
          where: {
            sunday_date: { [Op.in]: [lastSundayStr, previousSundayStr] }
          },
          attributes: [
            'sunday_date',
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_records'],
            [sequelize.fn('SUM', sequelize.col('present')), 'present_count']
          ],
          group: ['sunday_date'],
          raw: true
        });

        const lastWeekStats = weeklyAttendance.find(stat => stat.sunday_date === lastSundayStr);
        const prevWeekStats = weeklyAttendance.find(stat => stat.sunday_date === previousSundayStr);

        const currentWeekAttendance = lastWeekStats ? Math.round((Number(lastWeekStats.present_count) / Number(lastWeekStats.total_records)) * 100) : 0;
        const previousWeekAttendance = prevWeekStats ? Math.round((Number(prevWeekStats.present_count) / Number(prevWeekStats.total_records)) * 100) : 0;

        // Évolution de la présence
        const attendanceChange = currentWeekAttendance - previousWeekAttendance;

        // 2️⃣ Statistiques des appels de suivi (30 derniers jours)
        const recentCallLogs = await CallLog.count({
          where: {
            createdAt: { [Op.gte]: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) }
          }
        });

        // 3️⃣ Réunions Bacenta récentes (7 derniers jours)
        const recentBacentaMeetings = await BacentaMeeting.count({
          where: { meeting_date: { [Op.gte]: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } }
        });

        // 4️⃣ Statistiques par zone (simplifiées)
        const areas = await Area.findAll({
          include: [{
            model: User,
            as: 'leaders',
            where: { role: 'Bacenta_Leader', is_active: true },
            attributes: ['id'],
            required: false
          }]
        });

        const areasStats = await Promise.all(areas.map(async (area) => {
          const membersCount = await Member.count({
            where: { area_id: area.id, is_active: true }
          });

          return {
            id: area.id,
            name: area.name,
            number: area.number,
            leaders_count: area.leaders?.length || 0,
            members_count: membersCount
          };
        }));

        // 5️⃣ Leaders avec statistiques (simplifiées)
        const leaders = await User.findAll({
          where: { role: 'Bacenta_Leader', is_active: true },
          include: [{ model: Area, as: 'area', attributes: ['name'] }]
        });

        const leadersStats = await Promise.all(leaders.map(async (leader) => {
          const membersCount = await Member.count({
            where: { leader_id: leader.id, is_active: true }
          });

          return {
            id: leader.id,
            first_name: leader.first_name,
            last_name: leader.last_name,
            area_id: leader.area_id,
            area_name: leader.area?.name,
            members_count: membersCount
          };
        }));

        dashboardData = {
          summary: {
            total_members: totalMembers,
            total_leaders: totalLeaders,
            total_areas: totalAreas,
            current_week_attendance: currentWeekAttendance,
            previous_week_attendance: previousWeekAttendance,
            attendance_change: attendanceChange,
            recent_call_logs: recentCallLogs,
            recent_bacenta_meetings: recentBacentaMeetings
          },
          areas: areasStats,
          leaders: leadersStats
        };
      }

      res.json({
        user_role: userRole,
        last_updated: new Date(),
        ...dashboardData
      });

    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du tableau de bord' });
    }
  },

  // Statistiques par zone
  getAreaStats: async (req, res) => {
  try {
    const { area_id } = req.params;

    if (req.user.role !== 'Bishop' && req.user.role !== 'Governor') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const area = await Area.findByPk(area_id, {
      include: [{
        model: User,
        as: 'leaders',
        where: { role: 'Bacenta_Leader', is_active: true },
        attributes: ['id', 'first_name', 'last_name']
      }]
    });

    if (!area) {
      return res.status(404).json({ error: 'Zone non trouvée' });
    }

    // Statistiques de la zone
    const totalMembers = await Member.count({
      where: { area_id, is_active: true }
    });

    const totalLeaders = area.leaders?.length || 0;

    const recentAttendance = await Attendance.findOne({
      where: { sunday_date: new Date().toISOString().split('T')[0] },
      include: [{
        model: Member,
        as: 'member',
        where: { area_id }
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('present')), 'present_count']
      ],
      raw: true
    });

    const totalPresent = Number(recentAttendance?.present_count || 0);
    const totalRecords = Number(recentAttendance?.total || 0);
    const attendancePercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    res.json({
      area: {
        id: area.id,
        name: area.name,
        number: area.number
      },
      statistics: {
        total_members: totalMembers,
        total_leaders: totalLeaders,
        recent_attendance_percentage: attendancePercentage,
        leaders: area.leaders
      }
    });

  } catch (error) {
    console.error('Get area stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de zone' });
  }
},

// Statistiques par leader
getLeaderStats: async (req, res) => {
  try {
    const { leader_id } = req.params;

    if (req.user.role !== 'Bishop' && req.user.role !== 'Governor' && req.user.userId !== leader_id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const leader = await User.findByPk(leader_id, {
      include: [{ model: Area, as: 'area' }]
    });

    if (!leader) {
      return res.status(404).json({ error: 'Leader non trouvé' });
    }

    // Statistiques du leader
    const totalMembers = await Member.count({
      where: { leader_id, is_active: true }
    });

    const today = new Date();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay());

    const recentAttendance = await Attendance.findOne({
      where: { sunday_date: lastSunday.toISOString().split('T')[0] },
      include: [{
        model: Member,
        as: 'member',
        where: { leader_id }
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('present')), 'present_count']
      ],
      raw: true
    });

    const totalPresent = Number(recentAttendance?.present_count || 0);
    const totalRecords = Number(recentAttendance?.total || 0);
    const attendancePercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    // Membres du leader
    const members = await Member.findAll({
      where: { leader_id, is_active: true },
      include: [{ model: Area, as: 'area' }],
      attributes: ['id', 'first_name', 'last_name', 'phone_primary', 'gender', 'state', 'createdAt'],
      order: [['first_name', 'ASC']]
    });

    res.json({
      leader: {
        id: leader.id,
        first_name: leader.first_name,
        last_name: leader.last_name,
        area: leader.area
      },
      statistics: {
        total_members: totalMembers,
        recent_attendance_percentage: attendancePercentage
      },
      members: members
    });

  } catch (error) {
    console.error('Get leader stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques du leader' });
  }
}

};

module.exports = dashboardController;