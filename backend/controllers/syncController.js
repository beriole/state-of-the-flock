// controllers/syncController.js
const { SyncLog, Member, Attendance, User, Area } = require('../models');
const { Op } = require('sequelize');

const syncController = {
  // Synchroniser avec Google Sheets
  syncWithSheets: async (req, res) => {
    try {
      const { direction = 'both', force = false } = req.body;

      // Ici on intégrerait l'API Google Sheets
      // Pour l'instant, on simule la synchronisation

      const syncResults = {
        direction,
        timestamp: new Date(),
        members: {
          added: 0,
          updated: 0,
          errors: 0
        },
        attendance: {
          added: 0,
          updated: 0,
          errors: 0
        }
      };

      // Log de la synchronisation
      await SyncLog.create({
        entity_type: 'System',
        entity_id: 'sync-job',
        action: 'SYNC',
        sync_direction: direction,
        sync_status: 'completed',
        data_snapshot: syncResults
      });

      res.json({
        message: 'Synchronisation simulée avec succès',
        results: syncResults
      });
    } catch (error) {
      console.error('Sync with sheets error:', error);

      await SyncLog.create({
        entity_type: 'System',
        entity_id: 'sync-job',
        action: 'SYNC',
        sync_direction: 'both',
        sync_status: 'failed',
        error_message: error.message
      });

      res.status(500).json({ error: 'Erreur lors de la synchronisation' });
    }
  },

  // Obtenir les logs de synchronisation
  getSyncLogs: async (req, res) => {
    try {
      const { page = 1, limit = 50, sync_status, start_date, end_date } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (sync_status) whereClause.sync_status = sync_status;
      if (start_date && end_date) {
        whereClause.created_at = {
          [Op.between]: [start_date, end_date]
        };
      }

      const logs = await SyncLog.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        logs: logs.rows,
        total: logs.count,
        page: parseInt(page),
        totalPages: Math.ceil(logs.count / limit)
      });
    } catch (error) {
      console.error('Get sync logs error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des logs de synchronisation' });
    }
  }
};

module.exports = syncController;