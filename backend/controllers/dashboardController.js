// controllers/dashboardController.js
const { Member, Attendance, CallLog, BacentaMeeting, User, Area, sequelize } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  // Tableau de bord du leader
  getLeaderDashboard: async (req, res) => {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

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

      if (userRole === 'Bacenta_Leader') {
        // 1️⃣ Statistiques de base du leader
        const totalMembers = await Member.count({
          where: { leader_id: userId, is_active: true }
        });

        const lastAttendance = await Attendance.findOne({
          where: { sunday_date: lastSundayStr },
          include: [{
            model: Member,
            as: 'member',
            where: { leader_id: userId }
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
            where: { leader_id: userId }
          }]
        });

        // 3️⃣ Réunions Bacenta récentes (7 derniers jours)
        const recentBacentaMeetings = await BacentaMeeting.count({
          where: {
            leader_id: userId,
            meeting_date: { [Op.gte]: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        });

        // 4️⃣ Statistiques des 30 derniers jours
        const recentBacentaStats = await BacentaMeeting.findOne({
          where: {
            leader_id: userId,
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

      } else if (userRole === 'Bishop' || userRole === 'Assisting_Overseer') {
        // 1️⃣ Statistiques globales
        const totalMembers = await Member.count({ where: { is_active: true } });
        const totalLeaders = await User.count({ where: { role: 'Bacenta_Leader', is_active: true } });

        const recentAttendance = await Attendance.findOne({
          where: { sunday_date: lastSundayStr },
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            [sequelize.fn('SUM', sequelize.col('present')), 'present_count']
          ],
          raw: true
        });

        const totalPresent = Number(recentAttendance?.present_count || 0);
        const totalRecords = Number(recentAttendance?.total || 0);
        const attendancePercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

        const recentBacentaMeetings = await BacentaMeeting.count({
          where: { meeting_date: { [Op.gte]: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } }
        });

        // 2️⃣ Liste des areas avec leurs leaders
        const areas = await Area.findAll({
          include: [{
            model: User,
            as: 'leaders',
            where: { role: 'Bacenta_Leader', is_active: true },
            attributes: ['id', 'first_name', 'last_name', 'email']
          }]
        });

        dashboardData = {
          summary: {
            total_members: totalMembers,
            total_leaders: totalLeaders,
            overall_attendance_percentage: attendancePercentage,
            recent_bacenta_meetings: recentBacentaMeetings
          },
          areas
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
  }
};


module.exports = dashboardController;