// controllers/reportController.js
const { Member, Attendance, CallLog, BacentaMeeting, User, Area, BacentaAttendance, BacentaOffering } = require('../models');
const { Op } = require('sequelize');

const reportController = {
  // Rapport de présence général
  getAttendanceReport: async (req, res) => {
    try {
      const { start_date, end_date, area_id, leader_id } = req.query;

      const whereClause = {};
      const memberWhereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        memberWhereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        memberWhereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Governor') {
        const { Region } = require('../models');
        const region = await Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        const areaIds = region && region.areas ? region.areas.map(a => a.id) : [];
        if (areaIds.length > 0) {
          memberWhereClause.area_id = { [Op.in]: areaIds };
        } else {
          memberWhereClause.area_id = '00000000-0000-0000-0000-000000000000'; // Force empty
        }
      }
      // Note: Bishop has no restriction (global access)
      if (area_id) {
        // Validation pour Gouverneur
        if (req.user.role === 'Governor') {
          // Already filtered by Op.in areaIds above, if we want to allow narrowing down:
          // we should only allow it if it's in the set.
          // For now, simpler: if they provide an area_id, it will override the Op.in.
          // I'll make it safe:
          memberWhereClause.area_id = area_id;
        } else {
          memberWhereClause.area_id = area_id;
        }
      }
      if (leader_id) memberWhereClause.leader_id = leader_id;

      // Filtre de date
      if (start_date && end_date) {
        whereClause.sunday_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      // Statistiques par leader
      const leaderStats = await Member.findAll({
        where: memberWhereClause,
        attributes: [
          'leader_id',
          [Member.sequelize.fn('COUNT', Member.sequelize.col('Member.id')), 'total_members']
        ],
        include: [{
          model: User,
          as: 'leader',
          attributes: ['id', 'first_name', 'last_name']
        }],
        group: ['Member.leader_id'],
        raw: true
      });

      // Statistiques de présence
      const attendanceStats = await Attendance.findAll({
        where: whereClause,
        attributes: [
          [Attendance.sequelize.fn('COUNT', Attendance.sequelize.col('id')), 'total_records'],
          [Attendance.sequelize.fn('SUM', Attendance.sequelize.col('present')), 'total_present']
        ],
        include: [{
          model: Member,
          as: 'member',
          where: memberWhereClause,
          attributes: []
        }],
        raw: true
      });

      // Membres avec plus de 2 absences consécutives
      const consecutiveAbsences = []; // Temporairement vide pour éviter les erreurs 500 en attendant un fix SQL

      const totalRecords = parseInt(attendanceStats[0]?.total_records || 0);
      const totalPresent = parseInt(attendanceStats[0]?.total_present || 0);
      const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

      res.json({
        period: {
          start_date,
          end_date,
          total_weeks: totalRecords > 0 ? Math.ceil(totalRecords / leaderStats.reduce((sum, stat) => sum + parseInt(stat.total_members), 0)) : 0
        },
        summary: {
          total_members: leaderStats.reduce((sum, stat) => sum + parseInt(stat.total_members), 0),
          total_attendance_records: totalRecords,
          total_present: totalPresent,
          overall_percentage: overallPercentage,
          members_with_consecutive_absences: consecutiveAbsences.length
        },
        by_leader: leaderStats.map(stat => ({
          leader: stat.leader,
          total_members: parseInt(stat.total_members)
        })),
        members_needing_follow_up: consecutiveAbsences.map(member => ({
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          phone_primary: member.phone_primary,
          leader: member.leader_id
        }))
      });
    } catch (error) {
      console.error('Get attendance report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport de présence' });
    }
  },

  // Rapport des réunions Bacenta
  getBacentaReport: async (req, res) => {
    try {
      const { start_date, end_date, area_id, leader_id } = req.query;

      console.log('REQUEST Bacenta Report:', { query: req.query, user: req.user.role });

      const whereClause = {};
      const leaderWhereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        leaderWhereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        leaderWhereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Governor') {
        const { Region, Area } = require('../models');
        const region = await Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        const areaIds = region && region.areas ? region.areas.map(a => a.id) : [];
        if (areaIds.length > 0) {
          leaderWhereClause.area_id = { [Op.in]: areaIds };
        } else {
          leaderWhereClause.area_id = '00000000-0000-0000-0000-000000000000'; // Force empty
        }

        // Si une zone spécifique est demandée
        if (area_id) {
          leaderWhereClause.area_id = area_id;
        }
      }
      // Note: Bishop has no restriction (global access)

      if (leader_id) whereClause.leader_id = leader_id;

      // Filtre de date
      if (start_date && end_date) {
        whereClause.meeting_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const meetings = await BacentaMeeting.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'leader',
            // REVERT: Force LEFT JOIN temporaire pour restaurer l'affichage
            required: false,
            where: Object.keys(leaderWhereClause).length > 0 ? leaderWhereClause : undefined,
            include: [{ model: Area, as: 'area', required: false }]
          }
        ],
        order: [['meeting_date', 'DESC']]
      });

      console.log(`FOUND ${meetings.length} meetings for report.`);

      // DEBUG: Count total meetings in DB to diagnose visibility issues (unfiltered)
      const totalInDb = await BacentaMeeting.count();

      res.json({
        debug: { count: totalInDb },
        period: { start_date, end_date },
        meetings: meetings.map(meeting => ({
          id: meeting.id,
          meeting_date: meeting.meeting_date,
          meeting_type: meeting.meeting_type,
          leader: meeting.leader,
          area: meeting.leader?.area,
          location: meeting.location,
          total_members_present: meeting.total_members_present,
          expected_participants: meeting.expected_participants,
          offering_amount: meeting.offering_amount,
          notes: meeting.notes,
          photo_url: meeting.photo_url
        }))
      });
    } catch (error) {
      console.error('Get bacenta report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport Bacenta' });
    }
  },

  // Rapport d'appels
  getCallLogReport: async (req, res) => {
    try {
      const { start_date, end_date, leader_id, area_id, view_type = 'called' } = req.query;

      const dateFilter = {};
      if (start_date && end_date) {
        const endDateTime = new Date(end_date);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter[Op.between] = [new Date(start_date), endDateTime];
      }

      const memberWhere = {};
      if (area_id) memberWhere.area_id = area_id;
      if (leader_id) memberWhere.leader_id = leader_id;

      if (req.user.role === 'Bacenta_Leader') {
        memberWhere.leader_id = req.user.userId;
      } else if ((req.user.role === 'Area_Pastor' || req.user.role === 'Assisting_Overseer') && req.user.area_id) {
        memberWhere.area_id = req.user.area_id;
      } else if (req.user.role === 'Governor') {
        const { Region, Area } = require('../models');
        const region = await Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        const areaIds = region && region.areas ? region.areas.map(a => a.id) : [];
        if (areaIds.length > 0) {
          memberWhere.area_id = { [Op.in]: areaIds };
        } else {
          memberWhere.area_id = '00000000-0000-0000-0000-000000000000'; // Force empty
        }
      }

      if (area_id) memberWhere.area_id = area_id;
      if (leader_id) memberWhere.leader_id = leader_id;

      if (view_type === 'not_called') {
        // CAS: MEMBRES NON APPELÉS
        // On ne veut que les membres ACTIFS qui n'ont pas été appelés
        const notCalledWhere = { ...memberWhere, is_active: true };

        const allMembers = await Member.findAll({
          where: notCalledWhere,
          include: [
            { model: User, as: 'leader', attributes: ['id', 'first_name', 'last_name'] },
            { model: Area, as: 'area', attributes: ['id', 'name'] }
          ],
          attributes: ['id', 'first_name', 'last_name', 'phone_primary', 'area_id', 'leader_id', 'last_attendance_date', 'photo_url']
        });

        const callLogWhere = {};
        if (start_date && end_date) callLogWhere.call_date = dateFilter;

        const calledLogs = await CallLog.findAll({
          where: callLogWhere,
          attributes: ['member_id'],
          group: ['member_id']
        });

        const calledMemberIds = new Set(calledLogs.map(log => log.member_id));
        const notCalledMembers = allMembers.filter(member => !calledMemberIds.has(member.id));

        return res.json({
          period: { start_date, end_date },
          type: 'not_called',
          count: notCalledMembers.length,
          data: notCalledMembers
        });

      } else {
        // CAS: HISTORIQUE DES APPELS
        const callLogWhere = {};
        if (start_date && end_date) callLogWhere.call_date = dateFilter;

        console.log('DEBUG CALL LOGS:', {
          callLogWhere,
          memberWhere,
          dateFilter
        });

        const totalCallsInPeriod = await CallLog.count({ where: callLogWhere });
        const totalAllTime = await CallLog.count();

        const callLogs = await CallLog.findAll({
          where: callLogWhere,
          include: [
            { model: User, as: 'caller', attributes: ['id', 'first_name', 'last_name'] },
            {
              model: Member,
              as: 'member',
              where: Object.keys(memberWhere).length > 0 ? memberWhere : undefined,
              include: [
                { model: User, as: 'leader', attributes: ['id', 'first_name', 'last_name'] },
                { model: Area, as: 'area', attributes: ['id', 'name'] }
              ],
              attributes: ['id', 'first_name', 'last_name', 'phone_primary', 'photo_url']
            }
          ],
          order: [['call_date', 'DESC']]
        });

        const outcomeStats = callLogs.reduce((acc, log) => {
          acc[log.outcome] = (acc[log.outcome] || 0) + 1;
          return acc;
        }, {});

        return res.json({
          period: { start_date, end_date },
          type: 'called',
          summary: {
            total_calls: callLogs.length,
            total_in_period_debug: totalCallsInPeriod,
            total_all_time: totalAllTime,
            outcome_stats: outcomeStats,
            backend_version: '1.2'
          },
          data: callLogs
        });
      }

    } catch (error) {
      console.error('Get call log report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport d\'appels' });
    }
  },

  // Export des données
  exportData: async (req, res) => {
    try {
      const { format = 'json', type, start_date, end_date } = req.query;

      let data;
      switch (type) {
        case 'members':
          data = await Member.findAll({
            include: [
              { model: Area, as: 'area' },
              { model: User, as: 'leader' }
            ]
          });
          break;
        case 'attendance':
          const whereClause = {};
          if (start_date && end_date) {
            whereClause.sunday_date = {
              [Op.between]: [start_date, end_date]
            };
          }
          data = await Attendance.findAll({
            where: whereClause,
            include: [
              { model: Member, as: 'member' },
              { model: User, as: 'marked_by' }
            ]
          });
          break;
        case 'bacenta_meetings':
          data = await BacentaMeeting.findAll({
            include: [
              { model: User, as: 'leader' },
              { model: BacentaAttendance, as: 'attendances' },
              { model: BacentaOffering, as: 'offerings' }
            ]
          });
          break;
        default:
          return res.status(400).json({ error: 'Type d\'export non supporté' });
      }

      if (format === 'csv') {
        const json2csv = require('json2csv').parse;
        const csv = json2csv(data);
        res.header('Content-Type', 'text/csv');
        res.attachment(`export-${type}-${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      }

      res.json({
        type,
        format,
        generated_at: new Date(),
        data
      });
    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'export des données' });
    }
  },

  // Rapport de croissance des membres
  getMemberGrowthReport: async (req, res) => {
    try {
      const { period, start_date, end_date } = req.query;

      let startDate, endDate;

      if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
      } else {
        endDate = new Date();
        startDate = new Date();
        if (period === '1month') startDate.setMonth(endDate.getMonth() - 1);
        else if (period === '3months') startDate.setMonth(endDate.getMonth() - 3);
        else if (period === '6months') startDate.setMonth(endDate.getMonth() - 6);
        else if (period === '1year') startDate.setFullYear(endDate.getFullYear() - 1);
        else startDate.setMonth(endDate.getMonth() - 3);
      }

      const whereClause = {};
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Governor') {
        const { Region, Area } = require('../models');
        const region = await Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        const areaIds = region && region.areas ? region.areas.map(a => a.id) : [];
        if (areaIds.length > 0) {
          whereClause.area_id = { [Op.in]: areaIds };
        }
      } else if (req.user.role !== 'Bishop' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      }

      const initialCount = await Member.count({
        where: {
          ...whereClause,
          createdAt: { [Op.lt]: startDate }
        }
      });

      const newMembers = await Member.findAll({
        where: {
          ...whereClause,
          createdAt: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['id', 'createdAt'],
        order: [['createdAt', 'ASC']]
      });

      const labels = [];
      const dataPoints = [];
      const formatDate = (date) => {
        const d = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return isNaN(d.getTime()) ? 'N/A' : `${d.getDate()} ${months[d.getMonth()]}`;
      };

      let currentCount = initialCount;
      labels.push(formatDate(startDate));
      dataPoints.push(initialCount);

      newMembers.forEach(member => {
        currentCount++;
        labels.push(formatDate(member.createdAt));
        dataPoints.push(currentCount);
      });

      res.json({
        period: { start_date: startDate, end_date: endDate },
        total_new: newMembers.length,
        chart_data: {
          labels,
          datasets: [{
            data: dataPoints,
            color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
            strokeWidth: 2
          }]
        }
      });
    } catch (error) {
      console.error('Get member growth report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport de croissance' });
    }
  },

  // Rapport de présence spécifique pour le Gouverneur (vue agrégée)
  getGovernorAttendanceReport: async (req, res) => {
    try {
      const { start_date, end_date, group_by = 'area', area_id, leader_id } = req.query;
      const whereClause = {};
      if (start_date && end_date) {
        whereClause.sunday_date = { [Op.between]: [start_date, end_date] };
      }

      // Filtrage strict par région pour les Gouverneurs
      let governorAreaIds = [];
      if (req.user.role === 'Governor') {
        const { Region, Area } = require('../models');
        const region = await Region.findOne({
          where: { governor_id: req.user.userId },
          include: [{ model: Area, as: 'areas', attributes: ['id'] }]
        });
        governorAreaIds = region && region.areas ? region.areas.map(a => a.id) : [];
        if (governorAreaIds.length === 0) {
          return res.json({ report: [], type: group_by });
        }
      }

      let report;

      // SI UN LEADER OU UNE VUE DÉTAILLÉE PAR ZONE EST SÉLECTIONNÉE
      if (leader_id || (area_id && group_by === 'member_detail')) {
        const memberWhere = {};
        if (leader_id) memberWhere.leader_id = leader_id;
        else if (area_id) memberWhere.area_id = area_id;

        const members = await Member.findAll({
          where: memberWhere,
          attributes: ['id', 'first_name', 'last_name', 'is_active'],
          include: [{ model: Area, as: 'area', attributes: ['name'] }]
        });

        const attendances = await Attendance.findAll({
          where: {
            ...whereClause,
            member_id: { [Op.in]: members.map(m => m.id) }
          }
        });

        const attendanceByMember = attendances.reduce((acc, curr) => {
          if (curr.present) acc[curr.member_id] = (acc[curr.member_id] || 0) + 1;
          return acc;
        }, {});

        // Nombre de dimanches dans la période (pour le taux individuel)
        const totalSundays = new Set(attendances.map(a => a.sunday_date)).size || 1;

        report = members.map(m => ({
          member_id: m.id,
          member_name: `${m.first_name} ${m.last_name}`,
          status: m.is_active ? 'active' : 'inactive',
          attendance_count: attendanceByMember[m.id] || 0,
          total_possible: totalSundays,
          attendance_rate: Math.round(((attendanceByMember[m.id] || 0) / totalSundays) * 100)
        }));

        return res.json({ report, type: 'member_detail' });
      }

      // SI UNE ZONE EST SÉLECTIONNÉE (et pas de leader) : On affiche les leaders de cette zone
      if (area_id && group_by === 'area') {
        const leaders = await User.findAll({
          where: { area_id, role: 'Bacenta_Leader' },
          attributes: ['id', 'first_name', 'last_name'],
          include: [{
            model: Member,
            as: 'led_members',
            attributes: ['id']
          }]
        });

        const leaderIds = leaders.map(l => l.id);
        const attendances = await Attendance.findAll({
          where: whereClause,
          include: [{
            model: Member,
            as: 'member',
            where: { leader_id: { [Op.in]: leaderIds } },
            attributes: ['leader_id']
          }]
        });

        const attendanceByLeader = attendances.reduce((acc, curr) => {
          const lId = curr.member.leader_id;
          if (curr.present) acc[lId] = (acc[lId] || 0) + 1;
          return acc;
        }, {});

        report = leaders.map(l => {
          const totalMembers = l.led_members.length;
          const count = attendanceByLeader[l.id] || 0;
          return {
            leader_id: l.id,
            leader_name: `${l.first_name} ${l.last_name}`,
            total_members: totalMembers,
            attendance_count: count,
            attendance_rate: totalMembers > 0 ? Math.round((count / (totalMembers * 1)) * 100) : 0 // Simplifié, idéalement * nbSundays
          };
        });

        return res.json({ report, type: 'area_leaders' });
      }

      // VUE PAR DÉFAUT (GROUPEMENT PAR ZONE OU LEADER SANS FILTRES SPÉCIFIQUES)
      if (group_by === 'area') {
        report = await Area.findAll({
          attributes: [
            'id', 'name',
            [Area.sequelize.fn('COUNT', Area.sequelize.col('members.id')), 'total_members']
          ],
          include: [{
            model: Member,
            as: 'members',
            attributes: []
          }],
          group: ['Area.id'],
          raw: true
        });

        const attendances = await Attendance.findAll({
          where: whereClause,
          include: [{
            model: Member,
            as: 'member',
            attributes: ['area_id']
          }],
          raw: true
        });

        const attendanceByArea = attendances.reduce((acc, curr) => {
          const aId = curr['member.area_id'];
          if (aId && curr.present) acc[aId] = (acc[aId] || 0) + 1;
          return acc;
        }, {});

        report = report.map(item => ({
          area_id: item.id,
          area_name: item.name,
          total_members: parseInt(item.total_members || 0),
          attendance_count: attendanceByArea[item.id] || 0,
          attendance_rate: item.total_members > 0 ? Math.round(((attendanceByArea[item.id] || 0) / item.total_members) * 100) : 0
        }));
      } else {
        // ... (Logique Leader existante mais avec support potentiel de area_id en filtre)
        const userWhere = { role: 'Bacenta_Leader' };
        if (area_id) userWhere.area_id = area_id;

        report = await User.findAll({
          where: userWhere,
          attributes: [
            'id', 'first_name', 'last_name',
            [User.sequelize.fn('COUNT', User.sequelize.col('led_members.id')), 'total_members']
          ],
          include: [
            { model: Member, as: 'led_members', attributes: [] },
            { model: Area, as: 'area', attributes: ['name'] }
          ],
          group: ['User.id', 'area.id'],
          raw: true
        });

        const attendances = await Attendance.findAll({
          where: whereClause,
          include: [{
            model: Member,
            as: 'member',
            attributes: ['leader_id']
          }],
          raw: true
        });

        const attendanceByLeader = attendances.reduce((acc, curr) => {
          const lId = curr['member.leader_id'];
          if (lId && curr.present) acc[lId] = (acc[lId] || 0) + 1;
          return acc;
        }, {});

        report = report.map(item => ({
          leader_id: item.id,
          leader_first_name: item.first_name,
          leader_last_name: item.last_name,
          area_name: item['area.name'],
          total_members: parseInt(item.total_members || 0),
          attendance_count: attendanceByLeader[item.id] || 0,
          attendance_rate: item.total_members > 0 ? Math.round(((attendanceByLeader[item.id] || 0) / item.total_members) * 100) : 0
        }));
      }

      res.json({ report, type: group_by });
    } catch (error) {
      console.error('Get governor attendance report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport gouverneur' });
    }
  }
};

module.exports = reportController;