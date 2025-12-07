// controllers/reportController.js
const { Member, Attendance, CallLog, BacentaMeeting, BacentaAttendance, User, Area } = require('../models');
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
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        memberWhereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        memberWhereClause.area_id = req.user.area_id;
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
        group: ['leader_id', 'leader.id', 'leader.first_name', 'leader.last_name']
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
      // TODO: Fix this query - it's causing 500 errors
      const consecutiveAbsences = [];
      // const consecutiveAbsences = await Member.findAll({
      //   where: memberWhereClause,
      //   include: [{
      //     model: Attendance,
      //     as: 'attendances',
      //     where: whereClause,
      //     required: true
      //   }],
      //   having: Member.sequelize.literal('COUNT(CASE WHEN attendances.present = 0 THEN 1 END) >= 2')
      // });

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
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        whereClause['$leader.area_id$'] = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause['$leader.area_id$'] = req.user.area_id;
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
      }));

      // Statistiques
      const totalMeetings = meetings.length;
      const totalAttendance = meetings.reduce((sum, meeting) => sum + (meeting.total_members_present || 0), 0);
      const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0;
      const totalOffering = meetings.reduce((sum, meeting) => sum + (meeting.total_offering || 0), 0);

      res.json({
        period: { start_date, end_date },
        summary: {
          total_meetings: totalMeetings,
          average_attendance: averageAttendance,
          total_offering: totalOffering
        },
        meetings: report
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
  },

  // Rapport de croissance des membres
  getMemberGrowthReport: async (req, res) => {
    try {
      const { period = '3months', group_by = 'global' } = req.query; // period: 1month, 3months, 6months, 1year

      // Calculer la date de début
      const endDate = new Date();
      const startDate = new Date();
      if (period === '1month') startDate.setMonth(endDate.getMonth() - 1);
      else if (period === '3months') startDate.setMonth(endDate.getMonth() - 3);
      else if (period === '6months') startDate.setMonth(endDate.getMonth() - 6);
      else if (period === '1year') startDate.setFullYear(endDate.getFullYear() - 1);
      else startDate.setMonth(endDate.getMonth() - 3); // Default

      // Récupérer tous les membres créés avant la date de fin
      // Note: On a besoin de tous les membres pour calculer le cumulatif, pas juste ceux créés dans la période
      // Mais pour le graphique, on veut voir l'évolution DANS la période.
      // Donc on doit calculer le total initial au début de la période.

      const whereClause = {};

      // Filtrage par rôle (similaire aux autres rapports)
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      }

      // 1. Compter le total des membres AVANT la date de début
      const initialCount = await Member.count({
        where: {
          ...whereClause,
          created_at: { [Op.lt]: startDate }
        }
      });

      // 2. Récupérer les membres créés PENDANT la période
      const newMembers = await Member.findAll({
        where: {
          ...whereClause,
          created_at: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['id', 'created_at', 'area_id', 'leader_id'],
        include: [
          { model: Area, as: 'area', attributes: ['id', 'name'] },
          { model: User, as: 'leader', attributes: ['id', 'first_name', 'last_name'] }
        ],
        order: [['created_at', 'ASC']]
      });

      // 3. Organiser les données pour le graphique
      // On va grouper par semaine ou mois selon la période
      const labels = [];
      const datasets = [];

      // Fonction pour formater la date
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      };

      // Si group_by === 'global'
      if (group_by === 'global') {
        let currentCount = initialCount;
        const dataPoints = [];

        // Créer des points de données (simplifié : un point par membre ajouté)
        // Pour une vraie prod, il faudrait grouper par jour/semaine

        // Initial point
        labels.push(formatDate(startDate));
        dataPoints.push(initialCount);

        newMembers.forEach(member => {
          currentCount++;
          labels.push(formatDate(member.created_at));
          dataPoints.push(currentCount);
        });

        // Si trop de points, on échantillonne
        // TODO: Améliorer l'échantillonnage

        datasets.push({
          data: dataPoints,
          color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`, // Red
          strokeWidth: 2
        });
      }
      else if (group_by === 'region') {
        // Logique similaire mais groupée par region
        // C'est plus complexe car il faut un initialCount par région
        // Pour l'instant, on renvoie juste le global pour éviter la complexité excessive dans cette itération
        // TODO: Implémenter le breakdown par région

        // Fallback to global for now with a warning/note
        let currentCount = initialCount;
        const dataPoints = [];
        labels.push(formatDate(startDate));
        dataPoints.push(initialCount);
        newMembers.forEach(member => {
          currentCount++;
          labels.push(formatDate(member.created_at));
          dataPoints.push(currentCount);
        });
        datasets.push({
          data: dataPoints,
          color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
          strokeWidth: 2
        });
      }

      res.json({
        period: { start_date: startDate, end_date: endDate },
        initial_count: initialCount,
        total_new: newMembers.length,
        final_count: initialCount + newMembers.length,
        chart_data: {
          labels,
          datasets
        }
      });

    } catch (error) {
      console.error('Get member growth report error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du rapport de croissance' });
    }
  }
};

module.exports = reportController;