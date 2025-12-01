// controllers/dashboardController.js
const { Area, Member, Attendance, User, CallLog, BacentaMeeting, BacentaOffering, BacentaAttendance, sequelize } = require('../models');

const dashboardController = {
  // Tableau de bord du leader
  getLeaderDashboard: async (req, res) => {
    try {
      console.log('Dashboard request for user:', req.user);
      const userRole = req.user.role;
      const userId = req.user.userId;

      if (userRole === 'Bishop' || userRole === 'Assisting_Overseer' || userRole === 'Governor') {
        // Statistiques générales pour les administrateurs
        const totalMembers = await Member.count({ where: { is_active: true } });
        const totalLeaders = await User.count({
          where: {
            role: 'Bacenta_Leader',
            is_active: true
          }
        });
        const totalAreas = await Area.count();

        // Présence de cette semaine
        const today = new Date();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay());

        const weekAttendance = await Attendance.findAll({
          where: {
            sunday_date: {
              [sequelize.Op.gte]: sunday.toISOString().split('T')[0]
            }
          }
        });

        const totalAttendanceRecords = weekAttendance.length;
        const presentCount = weekAttendance.filter(a => a.present === true).length;
        const attendancePercentage = totalAttendanceRecords > 0 ?
          Math.round((presentCount / totalAttendanceRecords) * 100) : 0;

        res.json({
          user_role: userRole,
          last_updated: new Date(),
          summary: {
            total_members: totalMembers,
            total_leaders: totalLeaders,
            total_areas: totalAreas,
            current_week_attendance: attendancePercentage,
            attendance_change: 5, // TODO: Calculer le changement réel
            recent_call_logs: await CallLog.count({
              where: {
                created_at: {
                  [sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              }
            }),
            recent_bacenta_meetings: await BacentaMeeting.count({
              where: {
                created_at: {
                  [sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              }
            })
          }
        });
      } else if (userRole === 'Bacenta_Leader') {
        // Statistiques spécifiques au Bacenta Leader
        const totalMembers = await Member.count({
          where: {
            leader_id: userId,
            is_active: true
          }
        });

        // Présence récente (dernière semaine) - corrigé pour utiliser sunday_date
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recentAttendance = await Attendance.findAll({
          where: {
            sunday_date: {
              [sequelize.Op.gte]: lastWeek.toISOString().split('T')[0]
            }
          },
          include: [{
            model: Member,
            as: 'member',
            where: { leader_id: userId },
            required: true
          }]
        });

        const attendanceRecords = recentAttendance.length;
        const presentCount = recentAttendance.filter(a => a.present).length;
        const attendancePercentage = attendanceRecords > 0 ?
          Math.round((presentCount / attendanceRecords) * 100) : 0;

        // Statistiques des réunions Bacenta
        const recentMeetings = await BacentaMeeting.count({
          where: {
            leader_id: userId,
            created_at: { [sequelize.Op.gte]: lastWeek }
          }
        });

        // Offrandes totales des réunions récentes
        const meetingsWithOfferings = await BacentaMeeting.findAll({
          where: {
            leader_id: userId,
            created_at: { [sequelize.Op.gte]: lastWeek }
          },
          include: [{
            model: BacentaOffering,
            as: 'offerings'
          }]
        });

        const totalOffering = meetingsWithOfferings.reduce((total, meeting) => {
          return total + meeting.offerings.reduce((sum, offering) => sum + (offering.amount || 0), 0);
        }, 0);

        // Présence moyenne aux réunions
        const meetingsWithAttendance = await BacentaMeeting.findAll({
          where: {
            leader_id: userId,
            created_at: { [sequelize.Op.gte]: lastWeek }
          },
          include: [{
            model: BacentaAttendance,
            as: 'attendances'
          }]
        });

        const totalAttendanceInMeetings = meetingsWithAttendance.reduce((total, meeting) => {
          return total + meeting.attendances.filter(a => a.present === true).length;
        }, 0);

        const averageAttendance = meetingsWithAttendance.length > 0 ?
          Math.round(totalAttendanceInMeetings / meetingsWithAttendance.length) : 0;

        res.json({
          user_role: userRole,
          last_updated: new Date(),
          summary: {
            total_members: totalMembers,
            last_attendance_percentage: attendancePercentage,
            pending_follow_ups: await CallLog.count({
              where: {
                caller_id: userId,
                status: 'pending'
              }
            }),
            recent_bacenta_meetings: recentMeetings
          },
          bacenta_stats: {
            recent_meetings: recentMeetings,
            total_offering: totalOffering,
            average_attendance: averageAttendance
          },
          quick_actions: [
            { action: 'mark_attendance', label: 'Marquer présence', icon: 'check' },
            { action: 'view_call_list', label: 'Liste d\'appels', icon: 'phone' },
            { action: 'create_bacenta', label: 'Nouvelle réunion', icon: 'users' }
          ]
        });
      } else {
        // Pour les autres rôles (Area Pastor, Data Clerk, etc.)
        res.json({
          user_role: userRole,
          last_updated: new Date(),
          summary: {
            total_members: 0,
            last_attendance_percentage: 0,
            pending_follow_ups: 0,
            recent_bacenta_meetings: 0
          },
          message: 'Tableau de bord en développement pour ce rôle'
        });
      }

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
},

};

module.exports = dashboardController;