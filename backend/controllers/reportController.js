// controllers/reportController.js
const { Member, Attendance, CallLog, BacentaMeeting, User, Area } = require('../models');
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
      } else if (req.user.role === 'Area_Pastor' && req.user.areaId) {
        memberWhereClause.area_id = req.user.areaId;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.areaId) {
        memberWhereClause.area_id = req.user.areaId;
      }

      if (area_id) memberWhereClause.area_id = area_id;
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
          [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'total_members']
        ],
        include: [{
          model: User,
          as: 'leader',
          attributes: ['id', 'first_name', 'last_name']
        }],
        group: ['leader_id'],
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
      const consecutiveAbsences = await Member.findAll({
        where: memberWhereClause,
        include: [{
          model: Attendance,
          as: 'attendances',
          where: whereClause,
          required: true
        }],
        having: Member.sequelize.literal('COUNT(CASE WHEN attendances.present = 0 THEN 1 END) >= 2')
      });

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

      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.areaId) {
        whereClause['$leader.area_id$'] = req.user.areaId;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.areaId) {
        whereClause['$leader.area_id$'] = req.user.areaId;
      }

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
          { model: User, as: 'leader' },
          {
            model: BacentaAttendance,
            as: 'attendances',
            where: { present: true },
            required: false
          }
        ],
        order: [['meeting_date', 'DESC']]
      });

      const report = meetings.map(meeting => ({
        id: meeting.id,
        meeting_date: meeting.meeting_date,
        meeting_type: meeting.meeting_type,
        leader: meeting.leader,
        location: meeting.location,
        total_members_present: meeting.total_members_present,
        offering_amount: meeting.offering_amount,
        is_verified: meeting.is_verified,
        average_attendance: meeting.total_members_present
      }));

      const summary = {
        total_meetings: meetings.length,
        total_offering: meetings.reduce((sum, meeting) => sum + parseFloat(meeting.offering_amount), 0),
        total_attendance: meetings.reduce((sum, meeting) => sum + meeting.total_members_present, 0),
        average_attendance: meetings.length > 0 ? Math.round(meetings.reduce((sum, meeting) => sum + meeting.total_members_present, 0) / meetings.length) : 0,
        verified_meetings: meetings.filter(meeting => meeting.is_verified).length
      };

      res.json({
        period: { start_date, end_date },
        summary,
        meetings: report
      });
    } catch (error) {
      console.error('Get bacenta report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport Bacenta' });
    }
  },

  // Rapport de présence pour le Gouverneur (avec agrégation)
  getGovernorAttendanceReport: async (req, res) => {
    try {
      const { start_date, end_date, group_by } = req.query; // group_by: 'region', 'leader', 'center_leader'

      const whereClause = {};

      // Filtre de date
      if (start_date && end_date) {
        whereClause.sunday_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      // Configuration de l'agrégation
      let groupAttribute;
      let includeModel;
      let includeAs;
      let includeAttributes;

      switch (group_by) {
        case 'region':
          groupAttribute = 'area_id';
          includeModel = Area;
          includeAs = 'area';
          includeAttributes = ['id', 'name'];
          break;
        case 'leader':
          groupAttribute = 'leader_id';
          includeModel = User;
          includeAs = 'leader';
          includeAttributes = ['id', 'first_name', 'last_name'];
          break;
        case 'center_leader':
          // Pour Center Leader, on suppose que c'est l'Overseer de l'Area
          // C'est plus complexe car il faut joindre Member -> Area -> User (Overseer)
          // Pour simplifier, on va grouper par Area et afficher l'Overseer de l'Area
          groupAttribute = 'area_id';
          includeModel = Area;
          includeAs = 'area';
          includeAttributes = ['id', 'name', 'overseer_id'];
          break;
        default:
          return res.status(400).json({ error: 'Paramètre group_by invalide (region, leader, center_leader)' });
      }

      // Récupération des données brutes pour agrégation manuelle (plus flexible)
      const attendances = await Attendance.findAll({
        where: whereClause,
        include: [{
          model: Member,
          as: 'member',
          include: [
            { model: Area, as: 'area', include: [{ model: User, as: 'overseer' }] },
            { model: User, as: 'leader' }
          ]
        }]
      });

      // Agrégation manuelle
      const aggregatedData = {};

      attendances.forEach(record => {
        const member = record.member;
        if (!member) return;

        let key;
        let label;
        let subLabel = '';

        if (group_by === 'region') {
          key = member.area?.id || 'unknown';
          label = member.area?.name || 'Inconnu';
        } else if (group_by === 'leader') {
          key = member.leader?.id || 'unknown';
          label = `${member.leader?.first_name || ''} ${member.leader?.last_name || ''}`.trim() || 'Inconnu';
        } else if (group_by === 'center_leader') {
          // Center Leader = Area Overseer
          key = member.area?.overseer?.id || 'unknown';
          label = `${member.area?.overseer?.first_name || ''} ${member.area?.overseer?.last_name || ''}`.trim() || 'Non assigné';
          subLabel = member.area?.name || '';
        }

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            id: key,
            label,
            subLabel,
            total_present: 0,
            attendees: new Set() // Pour compter les personnes uniques
          };
        }

        if (record.present) {
          aggregatedData[key].total_present++;
          aggregatedData[key].attendees.add(member.id);
        }
      });

      // Formatage de la réponse
      const report = Object.values(aggregatedData).map(item => ({
        id: item.id,
        label: item.label,
        subLabel: item.subLabel,
        total_present: item.total_present,
        unique_attendees: item.attendees.size
      }));

      // Tri par nombre de présents décroissant
      report.sort((a, b) => b.total_present - a.total_present);

      res.json({
        period: { start_date, end_date },
        group_by,
        data: report
      });

    } catch (error) {
      console.error('Get governor attendance report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport gouverneur' });
    }
  },

  // Rapport des appels de suivi
  getCallLogReport: async (req, res) => {
    try {
      const { start_date, end_date, area_id, leader_id, outcome } = req.query;

      const whereClause = {};
      const memberWhereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        memberWhereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.areaId) {
        memberWhereClause.area_id = req.user.areaId;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.areaId) {
        memberWhereClause.area_id = req.user.areaId;
      }

      if (area_id) memberWhereClause.area_id = area_id;
      if (leader_id) memberWhereClause.leader_id = leader_id;
      if (outcome) whereClause.outcome = outcome;

      // Filtre de date
      if (start_date && end_date) {
        whereClause.call_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const callLogs = await CallLog.findAll({
        where: whereClause,
        include: [
          {
            model: Member,
            as: 'member',
            where: memberWhereClause,
            include: [
              { model: Area, as: 'area' },
              { model: User, as: 'leader' }
            ]
          },
          { model: User, as: 'caller' }
        ],
        order: [['call_date', 'DESC']]
      });

      // Statistiques par résultat
      const outcomeStats = callLogs.reduce((acc, log) => {
        acc[log.outcome] = (acc[log.outcome] || 0) + 1;
        return acc;
      }, {});

      // Statistiques par appelant
      const callerStats = callLogs.reduce((acc, log) => {
        const callerName = `${log.caller.first_name} ${log.caller.last_name}`;
        acc[callerName] = (acc[callerName] || 0) + 1;
        return acc;
      }, {});

      res.json({
        period: { start_date, end_date },
        summary: {
          total_calls: callLogs.length,
          outcome_stats: outcomeStats,
          caller_stats: callerStats,
          average_calls_per_day: callLogs.length > 0 ? Math.round(callLogs.length / ((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24))) : 0
        },
        call_logs: callLogs.map(log => ({
          id: log.id,
          call_date: log.call_date,
          member: log.member,
          caller: log.caller,
          outcome: log.outcome,
          contact_method: log.contact_method,
          call_duration: log.call_duration,
          next_followup_date: log.next_followup_date
        }))
      });
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
        // Implémentation basique de conversion CSV
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
  }
};

module.exports = reportController;