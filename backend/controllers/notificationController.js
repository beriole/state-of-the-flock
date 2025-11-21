// controllers/notificationController.js
const { Notification } = require('../models');

const notificationController = {
    // Obtenir les notifications de l'utilisateur connecté
    getMyNotifications: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 20, unread_only } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = { user_id: userId };
            if (unread_only === 'true') {
                whereClause.read = false;
            }

            const notifications = await Notification.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            // Compter les non-lues
            const unreadCount = await Notification.count({
                where: { user_id: userId, read: false }
            });

            res.json({
                notifications: notifications.rows,
                total: notifications.count,
                unread_count: unreadCount,
                page: parseInt(page),
                totalPages: Math.ceil(notifications.count / limit)
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
        }
    },

    // Marquer une notification comme lue
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const notification = await Notification.findOne({
                where: { id, user_id: userId }
            });

            if (!notification) {
                return res.status(404).json({ error: 'Notification non trouvée' });
            }

            await notification.update({ read: true });

            res.json({ message: 'Notification marquée comme lue', notification });
        } catch (error) {
            console.error('Mark notification read error:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification' });
        }
    },

    // Marquer toutes les notifications comme lues
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.userId;

            await Notification.update(
                { read: true },
                { where: { user_id: userId, read: false } }
            );

            res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
        } catch (error) {
            console.error('Mark all notifications read error:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour des notifications' });
        }
    },

    // Supprimer une notification
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const deleted = await Notification.destroy({
                where: { id, user_id: userId }
            });

            if (!deleted) {
                return res.status(404).json({ error: 'Notification non trouvée' });
            }

            res.json({ message: 'Notification supprimée' });
        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
        }
    }
};

module.exports = notificationController;
