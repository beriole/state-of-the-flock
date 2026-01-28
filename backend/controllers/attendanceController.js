// controllers/attendanceController.js
const { Attendance, Member, User, Area } = require('../models');
const { Op } = require('sequelize');

const attendanceController = {
  // Lister les présences
  getAttendance: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        member_id,
        leader_id,
        area_id,
        sunday_date,
        start_date,
        end_date
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause['$member.leader_id$'] = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        whereClause['$member.area_id$'] = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause['$member.area_id$'] = req.user.area_id;
      }

      // Filtres de date
      if (sunday_date) {
        whereClause.sunday_date = sunday_date;
      } else if (start_date && end_date) {
        whereClause.sunday_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      if (member_id) whereClause.member_id = member_id;

      const attendance = await Attendance.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Member,
            as: 'member',
            include: [
              { model: Area, as: 'area' },
              { model: User, as: 'leader' }
            ]
          },
          { model: User, as: 'marked_by' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['sunday_date', 'DESC']]
      });

      res.json({
        attendance: attendance.rows,
        total: attendance.count,
        page: parseInt(page),
        totalPages: Math.ceil(attendance.count / limit)
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des présences' });
    }
  },

  // Marquer la présence en lot
  bulkAttendance: async (req, res) => {
    try {
      const { sunday_date, attendances } = req.body;

      if (!sunday_date || !attendances || !Array.isArray(attendances)) {
        return res.status(400).json({ error: 'Date et liste de présence requises' });
      }

      const results = [];
      const errors = [];

      for (const att of attendances) {
        try {
          const member = await Member.findByPk(att.member_id);
          if (!member) {
            errors.push(`Membre ${att.member_id} non trouvé`);
            continue;
          }

          if (req.user.role === 'Bacenta_Leader' && member.leader_id !== req.user.userId) {
            errors.push(`Accès non autorisé pour le membre ${member.first_name} ${member.last_name}`);
            continue;
          }

          if (req.user.role === 'Governor') {
            const governorRegion = await require('../models').Region.findOne({
              where: { governor_id: req.user.userId },
              include: [{ model: Area, as: 'areas', attributes: ['id'] }]
            });
            const areaIds = governorRegion ? governorRegion.areas.map(a => a.id) : [];
            if (!areaIds.includes(member.area_id)) {
              errors.push(`Accès non autorisé (Hors région) pour le membre ${member.first_name} ${member.last_name}`);
              continue;
            }
          }
          const existing = await Attendance.findOne({
            where: {
              member_id: att.member_id,
              sunday_date: sunday_date
            }
          });

          let attendanceRecord;
          if (existing) {
            attendanceRecord = await existing.update({
              present: att.present,
              notes: att.notes,
              marked_by_user_id: req.user.userId
            });
          } else {
            attendanceRecord = await Attendance.create({
              member_id: att.member_id,
              sunday_date: sunday_date,
              present: att.present,
              notes: att.notes,
              marked_by_user_id: req.user.userId
            });
          }

          results.push(attendanceRecord);
        } catch (error) {
          errors.push(`Erreur pour le membre ${att.member_id}: ${error.message}`);
        }
      }

      res.json({
        message: `Présence marquée pour ${results.length} membres`,
        successes: results.length,
        errors: errors.length,
        details: errors
      });
    } catch (error) {
      console.error('Bulk attendance error:', error);
      res.status(500).json({ error: 'Erreur lors du marquage de présence en lot' });
    }
  },

  // Statistiques de présence
  getAttendanceStats: async (req, res) => {
    try {
      const { area_id, leader_id, start_date, end_date } = req.query;

      const whereClause = {};

      if (req.user.role === 'Bacenta_Leader') {
        whereClause['$member.leader_id$'] = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        whereClause['$member.area_id$'] = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause['$member.area_id$'] = req.user.area_id;
      }

      if (area_id) whereClause['$member.area_id$'] = area_id;
      if (leader_id) whereClause['$member.leader_id$'] = leader_id;

      if (start_date && end_date) {
        whereClause.sunday_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const stats = await Attendance.findAll({
        where: whereClause,
        attributes: [
          'sunday_date',
          [Attendance.sequelize.fn('COUNT', Attendance.sequelize.col('id')), 'total'],
          [Attendance.sequelize.fn('SUM', Attendance.sequelize.col('present')), 'present_count']
        ],
        include: [{
          model: Member,
          as: 'member',
          attributes: []
        }],
        group: ['sunday_date'],
        order: [['sunday_date', 'DESC']],
        raw: true
      });

      const formattedStats = stats.map(stat => ({
        sunday_date: stat.sunday_date,
        total: parseInt(stat.total),
        present_count: parseInt(stat.present_count || 0),
        absent_count: parseInt(stat.total) - parseInt(stat.present_count || 0),
        percentage: parseInt(stat.total) > 0 ?
          Math.round((parseInt(stat.present_count || 0) / parseInt(stat.total)) * 100) : 0
      }));

      res.json(formattedStats);
    } catch (error) {
      console.error('Get attendance stats error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
  },

  // Générer la liste d'appels
  generateCallList: async (req, res) => {
    try {
      const { weeks_back = 2 } = req.query;

      const today = new Date();
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - today.getDay() - 7 * (weeks_back - 1));

      const previousSunday = new Date(lastSunday);
      previousSunday.setDate(lastSunday.getDate() - 7);

      const whereClause = {
        '$member.leader_id$': req.user.userId
      };

      const membersToCall = await Member.findAll({
        include: [
          {
            model: Attendance,
            as: 'attendances',
            where: {
              sunday_date: {
                [Op.in]: [
                  previousSunday.toISOString().split('T')[0],
                  lastSunday.toISOString().split('T')[0]
                ]
              }
            },
            required: true
          },
          { model: Area, as: 'area' }
        ]
      });

      const callList = membersToCall.filter(member => {
        const attendances = member.attendances;
        const prevWeek = attendances.find(a => a.sunday_date === previousSunday.toISOString().split('T')[0]);
        const lastWeek = attendances.find(a => a.sunday_date === lastSunday.toISOString().split('T')[0]);

        return prevWeek && prevWeek.present && lastWeek && !lastWeek.present;
      });

      res.json({
        generated_at: new Date(),
        date_range: {
          previous_sunday: previousSunday.toISOString().split('T')[0],
          last_sunday: lastSunday.toISOString().split('T')[0]
        },
        call_list: callList.map(member => ({
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          phone_primary: member.phone_primary,
          phone_secondary: member.phone_secondary,
          area: member.area?.name,
          last_attendance_date: member.last_attendance_date
        }))
      });
    } catch (error) {
      console.error('Generate call list error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération de la liste d\'appels' });
    }
  }
};

module.exports = attendanceController;