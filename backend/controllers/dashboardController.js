// controllers/dashboardController.js
const { Area, Region, Member, Attendance, User, CallLog, BacentaMeeting, BacentaOffering, BacentaAttendance, sequelize } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  // Tableau de bord du leader - VERSION AVEC CALCULS RÉELS
  getLeaderDashboard: async (req, res) => {
    try {
      const userRole = req.user.role;
      const role = userRole ? userRole.toLowerCase() : '';
      const userId = req.user.userId;

      console.log(`📊 Dashboard request for role: ${userRole}, user: ${userId}`);

      if (role === 'bishop' || role === 'assisting_overseer' || role === 'governor' || role === 'area_pastor') {
        try {
          let areaIds = null;
          if (userRole === 'Governor') {
            const region = await require('../models').Region.findOne({
              where: { governor_id: userId },
              include: [{ model: Area, as: 'areas', attributes: ['id'] }]
            });
            if (!region) return res.status(404).json({ error: 'Région introuvable pour ce gouverneur' });
            areaIds = region.areas.map(a => a.id);
          } else if (userRole === 'Area_Pastor') {
            // L'Area_Pastor est restreint à sa propre zone (area_id)
            if (req.user.area_id) {
              areaIds = [req.user.area_id];
            } else {
              // Si pas de zone assignée, pas de membres (ou tous ? Généralement on restreint)
              areaIds = ['00000000-0000-0000-0000-000000000000'];
            }
          } else if (userRole === 'Assisting_Overseer') {
            // L'Assisting_Overseer a souvent accès à une zone spécifique aussi
            if (req.user.area_id) {
              areaIds = [req.user.area_id];
            }
          }
          // Note: Bishop and Assisting_Overseer (global) leave areaIds as null

          // Récupérer le filtre de zone optionnel
          const { area_id } = req.query;

          // Si un area_id est demandé
          if (area_id) {
            // Pour le Gouverneur, on vérifie que c'est dans sa région
            if (userRole === 'Governor') {
              if (areaIds.includes(area_id)) {
                // On remplace la liste complète par cette seule zone
                areaIds = [area_id];
              } else {
                // Tentative d'accès hors zone : on ignore ou on rejette (ici on ignore pour fallback sur toute la région)
                // areaIds reste inchangé (toute la région)
              }
            } else {
              // Bishop/Overseer : on applique le filtre directement
              areaIds = [area_id];
            }
          }

          const memberWhere = areaIds ? { area_id: { [Op.in]: areaIds } } : {};
          const userWhere = { role: 'Bacenta_Leader', is_active: true };
          if (areaIds) userWhere.area_id = { [Op.in]: areaIds };
          const areaWhere = areaIds ? { id: { [Op.in]: areaIds } } : {};

          // Test basique de connexion DB
          await sequelize.authenticate();

          // Statistiques
          const totalMembers = await Member.count({ where: memberWhere });
          const totalLeaders = await User.count({ where: userWhere });
          const totalAreas = await Area.count({ where: areaWhere });

          let totalRegions = 0;
          let totalGovernors = 0;
          let totalAreaPastors = 0;

          if (role === 'bishop' || role === 'assisting_overseer') {
            totalRegions = await Region.count();
            totalGovernors = await User.count({ where: { role: 'Governor', is_active: true } });
            totalAreaPastors = await User.count({ where: { role: 'Area_Pastor', is_active: true } });
          } else if (role === 'governor') {
            totalRegions = 1;
          }

          console.log(`✅ Stats calculated: members=${totalMembers}, areas=${totalAreas}, regions=${totalRegions}`);

          // Présence de cette semaine
          const today = new Date();
          const sunday = new Date(today);
          sunday.setDate(today.getDate() - today.getDay());
          const sundayStr = sunday.toISOString().split('T')[0];

          const weekAttendance = await Attendance.findAll({
            where: {
              sunday_date: { [Op.gte]: sundayStr }
            },
            include: [{
              model: Member,
              as: 'member',
              where: memberWhere,
              attributes: ['id']
            }]
          });

          const totalAttendanceRecords = weekAttendance.length;
          const presentCount = weekAttendance.filter(a => a.present === true).length;
          const attendancePercentage = totalAttendanceRecords > 0 ?
            Math.round((presentCount / totalAttendanceRecords) * 100) : 0;

          const recentCallLogs = await CallLog.count({
            where: {
              created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            include: [{
              model: Member,
              as: 'member',
              where: memberWhere,
              attributes: ['id']
            }]
          });

          const recentBacentaMeetings = await BacentaMeeting.count({
            where: {
              created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            include: [{
              model: User,
              as: 'leader',
              where: userWhere,
              attributes: ['id']
            }]
          });

          const recentMeetings = await BacentaMeeting.findAll({
            where: {
              created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            include: [{
              model: User,
              as: 'leader',
              where: userWhere,
              attributes: ['id', 'first_name', 'last_name']
            }],
            order: [['date', 'DESC']],
            limit: 5
          });

          res.json({
            user_role: userRole,
            last_updated: new Date(),
            summary: {
              total_members: totalMembers || 0,
              total_leaders: totalLeaders || 0,
              total_areas: totalAreas || 0,
              total_regions: totalRegions || 0,
              total_governors: totalGovernors || 0,
              total_area_pastors: totalAreaPastors || 0,
              last_attendance_percentage: attendancePercentage || 0,
              present_members: presentCount || 0,
              total_attendance_records: totalAttendanceRecords || 0,
              attendance_change: 0,
              pending_follow_ups: recentCallLogs || 0,
              recent_bacenta_meetings: recentBacentaMeetings || 0
            },
            recent_meetings: recentMeetings.map(m => ({
              id: m.id,
              title: m.title,
              date: m.date,
              attendance: m.attendance_count || 0, // This might need actual count logic
              leader_name: m.leader ? `${m.leader.first_name} ${m.leader.last_name}` : 'Inconnu'
            }))
          });
        } catch (dbError) {
          console.error('Database error in dashboard:', dbError);
          res.status(500).json({ error: 'Erreur lors de la récupération des données du tableau de bord' });
        }
      }
      else if (userRole === 'Bacenta_Leader') {
        try {
          // 1. Membres
          const totalMembers = await Member.count({
            where: { leader_id: userId, is_active: true }
          });

          // 2. Présence (Dernier Dimanche)
          const today = new Date();
          const lastSunday = new Date(today);
          lastSunday.setDate(today.getDate() - today.getDay());
          const sundayStr = lastSunday.toISOString().split('T')[0];

          const attendanceRecords = await Attendance.findAll({
            where: { sunday_date: sundayStr },
            include: [{
              model: Member,
              as: 'member',
              where: { leader_id: userId },
              attributes: ['id']
            }]
          });

          const presentCount = attendanceRecords.filter(a => a.present).length;
          const attendancePercentage = attendanceRecords.length > 0 ?
            Math.round((presentCount / attendanceRecords.length) * 100) : 0;

          // 3. Réunions Bacenta (30 derniers jours)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);

          const recentMeetingsCount = await BacentaMeeting.count({
            where: {
              leader_id: userId,
              date: { [Op.gte]: thirtyDaysAgo }
            }
          });

          // 4. Appels à faire (Simplification: Membres non contactés cette semaine)
          const pendingFollowUps = await Member.count({
            where: {
              leader_id: userId,
              is_active: true
            }
            // On pourrait filtrer sur les CallLogs, mais restons sur une métrique utile
          });

          res.json({
            user_role: userRole,
            last_updated: new Date(),
            summary: {
              total_members: totalMembers,
              last_attendance_percentage: attendancePercentage,
              pending_follow_ups: pendingFollowUps,
              recent_bacenta_meetings: recentMeetingsCount
            },
            bacenta_stats: {
              recent_meetings: recentMeetingsCount,
              total_offering: 0,
              average_attendance: 0
            },
            quick_actions: [
              { action: 'mark_attendance', label: 'Marquer présence', icon: 'check' },
              { action: 'view_call_list', label: 'Liste d\'appels', icon: 'phone' },
              { action: 'create_bacenta', label: 'Nouvelle réunion', icon: 'users' }
            ]
          });
        } catch (dbError) {
          console.error('Database error in Bacenta Leader dashboard:', dbError);
          // Retourner des données avec le nombre de membres connu
          res.json({
            user_role: userRole,
            last_updated: new Date(),
            summary: {
              total_members: 0, // Fallback to 0 if DB error
              last_attendance_percentage: 0,
              pending_follow_ups: 0,
              recent_bacenta_meetings: 0
            },
            bacenta_stats: {
              recent_meetings: 0,
              total_offering: 0,
              average_attendance: 0
            },
            quick_actions: [
              { action: 'mark_attendance', label: 'Marquer présence', icon: 'check' },
              { action: 'view_call_list', label: 'Liste d\'appels', icon: 'phone' },
              { action: 'create_bacenta', label: 'Nouvelle réunion', icon: 'users' }
            ],
            warning: 'Certaines statistiques temporairement indisponibles'
          });
        }
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
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        sql: error.sql,
        parameters: error.parameters
      });
      res.status(500).json({
        error: 'Erreur lors de la récupération du tableau de bord',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Statistiques par zone
  getAreaStats: async (req, res) => {
    try {
      const { area_id } = req.params;

      if (req.user.role !== 'Bishop' && req.user.role !== 'Governor') {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const area = await Area.findByPk(area_id);

      if (!area) {
        return res.status(404).json({ error: 'Zone non trouvée' });
      }

      // Sécurité Gouverneur: Vérifier si la zone appartient à sa région
      if (req.user.role === 'Governor') {
        const governorRegion = await require('../models').Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        if (!governorRegion || !governorRegion.areas.some(a => a.id === area.id)) {
          return res.status(403).json({ error: 'Accès interdit à cette zone' });
        }
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

      // Sécurité Gouverneur: Vérifier si le leader appartient à sa région
      if (req.user.role === 'Governor') {
        const governorRegion = await require('../models').Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        const areaIds = governorRegion ? governorRegion.areas.map(a => a.id) : [];
        if (!areaIds.includes(leader.area_id)) {
          return res.status(403).json({ error: 'Accès interdit à ce leader' });
        }
      }
      // Note: Bishop has no restriction (global access)
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

  // Statistiques financières (Offrandes)
  getFinancialStats: async (req, res) => {
    try {
      if (req.user.role !== 'Bishop' && req.user.role !== 'Governor') {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      // Déterminer la période (Défaut: ce mois)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const whereClause = {
        meeting_date: { [Op.gte]: startOfMonth }
      };

      // Si Governor, restreindre à sa région
      // Note: Cela suppose une relation correcte ou un filtrage ID
      let areaInclude = {
        model: Area,
        as: 'area',
        attributes: ['id', 'name']
      };

      if (req.user.role === 'Governor') {
        // Filtrage plus robuste: Récupérer d'abord les zones de la région du gouverneur
        // (Optimisation possible via join direct, mais restons sûrs)
        const governorRegion = await require('../models').Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });

        if (!governorRegion) return res.status(404).json({ error: 'Région introuvable' });

        const areaIds = governorRegion.areas.map(a => a.id);

        // On modifie l'include pour filtrer
        areaInclude = {
          model: Area,
          as: 'area',
          attributes: ['id', 'name'],
          where: { id: { [Op.in]: areaIds } }
        };
      }

      // Récupérer les meetings avec offrandes
      const meetings = await BacentaMeeting.findAll({
        where: whereClause,
        attributes: ['id', 'offering_amount', 'meeting_date'],
        include: [
          {
            model: User,
            as: 'leader',
            attributes: ['id', 'first_name', 'last_name'],
            include: [areaInclude] // Area est lié au User (Leader)
          }
        ]
      });

      // Agréger par Zone
      const offeringsByZone = {};
      let totalRegion = 0;

      meetings.forEach(meeting => {
        const amount = parseFloat(meeting.offering_amount || 0);
        totalRegion += amount;

        const areaName = meeting.leader?.area?.name || 'Inconnu';
        const areaId = meeting.leader?.area?.id || 'unknown';

        if (!offeringsByZone[areaId]) {
          offeringsByZone[areaId] = {
            id: areaId,
            name: areaName,
            total: 0,
            meeting_count: 0
          };
        }
        offeringsByZone[areaId].total += amount;
        offeringsByZone[areaId].meeting_count += 1;
      });

      res.json({
        total_offerings: totalRegion,
        period: { start: startOfMonth },
        by_zone: Object.values(offeringsByZone).sort((a, b) => b.total - a.total)
      });

    } catch (error) {
      console.error('Get financial stats error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques financières' });
    }
  },

  // Classements (Gamification)
  getPerformanceRankings: async (req, res) => {
    try {
      if (req.user.role !== 'Bishop' && req.user.role !== 'Governor') {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      // Configuration de la portée (Governor vs Global)
      const userWhere = { role: 'Bacenta_Leader', is_active: true };

      if (req.user.role === 'Governor') {
        // Filtrer les leaders par région du gouverneur
        const governorRegion = await require('../models').Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        const areaIds = governorRegion ? governorRegion.areas.map(a => a.id) : [];
        userWhere.area_id = { [Op.in]: areaIds };
      }
      // Note: Bishop has no restriction (global access)

      // 1. Top Leaders (Croissance Membres ce mois)
      // Note: Une métrique simple est le nombre de NOUVEAUX membres ajoutés ce mois-ci
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const topRecruiters = await User.findAll({
        where: userWhere,
        attributes: [
          'id', 'first_name', 'last_name', 'photo_url',
          [sequelize.literal(`(
                SELECT COUNT(*)
                FROM members AS member
                WHERE
                    member.leader_id = User.id
                    AND member.created_at >= '${startOfMonth.toISOString().slice(0, 10)}'
            )`), 'new_members_count']
        ],
        include: [{ model: Area, as: 'area', attributes: ['name'] }],
        order: [[sequelize.literal('new_members_count'), 'DESC']],
        limit: 5
      });

      // 2. Top Zones (Taux de présence dimanche dernier)
      // Pour simplifier, on prend juste le nombre absolu de présents pour l'instant, ou on agrège.
      // Une requête complexe serait nécessaire pour le taux exact.
      // Alternative: Utiliser le nombre total de membres présents (Attendance Sum) groupé par Zone

      const lastSunday = new Date();
      lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
      const lastSundayStr = lastSunday.toISOString().split('T')[0];

      // Récupérer toutes les zones pertinentes
      const areaWhere = {};
      if (req.user.role === 'Governor') {
        // On réutilise areaIds
        const governorRegion = await require('../models').Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        if (governorRegion) areaWhere.id = { [Op.in]: governorRegion.areas.map(a => a.id) };
      }

      const topZones = await Area.findAll({
        where: areaWhere,
        attributes: [
          'id', 'name',
          [sequelize.literal(`(
                SELECT COUNT(*)
                FROM attendances AS att
                INNER JOIN members AS m ON att.member_id = m.id
                WHERE
                    m.area_id = Area.id
                    AND att.sunday_date = '${lastSundayStr}'
                    AND att.present = true
            )`), 'total_present']
        ],
        include: [{
          model: Region,
          as: 'region',
          attributes: ['name']
        }],
        order: [[sequelize.literal('total_present'), 'DESC']],
        limit: 3
      });
      res.json({
        top_recruiters: topRecruiters,
        top_zones: topZones
      });

    } catch (error) {
      console.error('Get rankings error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des classements' });
    }
  },

};

module.exports = dashboardController;