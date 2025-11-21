// controllers/callLogController.js
const { CallLog, Member, User, Area } = require('../models');
const { Op } = require('sequelize');

const callLogController = {
  // Lister les appels
  getCallLogs: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        member_id, 
        caller_id, 
        outcome,
        start_date,
        end_date 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause['$member.leader_id$'] = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.areaId) {
        whereClause['$member.area_id$'] = req.user.areaId;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.areaId) {
        whereClause['$member.area_id$'] = req.user.areaId;
      }

      // Filtres supplémentaires
      if (member_id) whereClause.member_id = member_id;
      if (caller_id) whereClause.caller_id = caller_id;
      if (outcome) whereClause.outcome = outcome;

      // Filtre de date
      if (start_date && end_date) {
        whereClause.call_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const callLogs = await CallLog.findAndCountAll({
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
          { model: User, as: 'caller' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['call_date', 'DESC']]
      });

      res.json({
        callLogs: callLogs.rows,
        total: callLogs.count,
        page: parseInt(page),
        totalPages: Math.ceil(callLogs.count / limit)
      });
    } catch (error) {
      console.error('Get call logs error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des appels' });
    }
  },

  // Créer un log d'appel
  createCallLog: async (req, res) => {
    try {
      const {
        member_id,
        outcome,
        notes,
        followup_notes,
        next_followup_date,
        call_duration,
        contact_method
      } = req.body;

      if (!member_id || !outcome) {
        return res.status(400).json({ error: 'ID du membre et résultat requis' });
      }

      // Vérifier que le membre existe et appartient au leader
      const member = await Member.findByPk(member_id);
      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader' && member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé à ce membre' });
      }

      const callLog = await CallLog.create({
        member_id,
        caller_id: req.user.userId,
        outcome,
        notes,
        followup_notes,
        next_followup_date,
        call_duration,
        contact_method: contact_method || 'Phone',
        is_completed: true
      });

      const newCallLog = await CallLog.findByPk(callLog.id, {
        include: [
          { 
            model: Member, 
            as: 'member',
            include: [
              { model: Area, as: 'area' },
              { model: User, as: 'leader' }
            ]
          },
          { model: User, as: 'caller' }
        ]
      });

      res.status(201).json(newCallLog);
    } catch (error) {
      console.error('Create call log error:', error);
      res.status(500).json({ error: 'Erreur lors de la création du log d\'appel' });
    }
  },

  // Obtenir un log d'appel par ID
  getCallLogById: async (req, res) => {
    try {
      const callLogId = req.params.id;

      const callLog = await CallLog.findByPk(callLogId, {
        include: [
          { 
            model: Member, 
            as: 'member',
            include: [
              { model: Area, as: 'area' },
              { model: User, as: 'leader' }
            ]
          },
          { model: User, as: 'caller' }
        ]
      });

      if (!callLog) {
        return res.status(404).json({ error: 'Log d\'appel non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader' && callLog.member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé à ce log d\'appel' });
      }

      res.json(callLog);
    } catch (error) {
      console.error('Get call log error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du log d\'appel' });
    }
  },

  // Mettre à jour un log d'appel
  updateCallLog: async (req, res) => {
    try {
      const callLogId = req.params.id;
      const updateData = req.body;

      const callLog = await CallLog.findByPk(callLogId, {
        include: [{ model: Member, as: 'member' }]
      });

      if (!callLog) {
        return res.status(404).json({ error: 'Log d\'appel non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader' && callLog.member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await callLog.update(updateData);

      const updatedCallLog = await CallLog.findByPk(callLogId, {
        include: [
          { 
            model: Member, 
            as: 'member',
            include: [
              { model: Area, as: 'area' },
              { model: User, as: 'leader' }
            ]
          },
          { model: User, as: 'caller' }
        ]
      });

      res.json(updatedCallLog);
    } catch (error) {
      console.error('Update call log error:', error);
      res.status(500).json({ error: 'Erreur lors de la modification du log d\'appel' });
    }
  },

  // Supprimer un log d'appel
  deleteCallLog: async (req, res) => {
    try {
      const callLogId = req.params.id;

      const callLog = await CallLog.findByPk(callLogId, {
        include: [{ model: Member, as: 'member' }]
      });

      if (!callLog) {
        return res.status(404).json({ error: 'Log d\'appel non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader' && callLog.member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await callLog.destroy();
      res.json({ message: 'Log d\'appel supprimé avec succès' });
    } catch (error) {
      console.error('Delete call log error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du log d\'appel' });
    }
  }
};

module.exports = callLogController;