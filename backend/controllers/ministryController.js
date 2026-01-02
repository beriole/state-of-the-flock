// controllers/ministryController.js
const { Ministry, Member, User, MinistryAttendance } = require('../models');
const { Op } = require('sequelize');

const ministryController = {
    // 1. Lister tous les ministères
    getAllMinistries: async (req, res) => {
        try {
            const ministries = await Ministry.findAll({
                include: [
                    { model: User, as: 'leader', attributes: ['id', 'first_name', 'last_name'] },
                    { model: Member, as: 'members', attributes: ['id'] } // Pour compter les membres
                ],
                order: [['name', 'ASC']]
            });

            const formatted = ministries.map(m => ({
                id: m.id,
                name: m.name,
                description: m.description,
                leader: m.leader ? `${m.leader.first_name} ${m.leader.last_name}` : null,
                member_count: m.members.length
            }));

            res.json(formatted);
        } catch (error) {
            console.error('Get ministries error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des ministères' });
        }
    },

    // 2. Créer un ministère
    createMinistry: async (req, res) => {
        try {
            const { name, description, leader_id } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Le nom du ministère est obligatoire' });
            }

            const ministry = await Ministry.create({ name, description, leader_id });
            res.status(201).json(ministry);
        } catch (error) {
            console.error('Create ministry error:', error);
            res.status(500).json({ error: 'Erreur lors de la création du ministère' });
        }
    },

    // 3. Supprimer un ministère
    deleteMinistry: async (req, res) => {
        try {
            const { id } = req.params;
            const ministry = await Ministry.findByPk(id);
            if (!ministry) {
                return res.status(404).json({ error: 'Ministère non trouvé' });
            }
            await ministry.destroy();
            res.json({ message: 'Ministère supprimé avec succès' });
        } catch (error) {
            console.error('Delete ministry error:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    },

    // 4. Obtenir les membres d'un ministère
    getMinistryMembers: async (req, res) => {
        try {
            const { id } = req.params;
            const members = await Member.findAll({
                where: { ministry_id: id, is_active: true },
                include: [{ model: User, as: 'leader', attributes: ['first_name', 'last_name'] }],
                order: [['first_name', 'ASC']]
            });
            res.json(members);
        } catch (error) {
            console.error('Get ministry members error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
        }
    },

    // 5. Marquer/Mettre à jour les présences (Bulk)
    markAttendance: async (req, res) => {
        try {
            const { id } = req.params; // ministry_id
            const { date, attendances } = req.body; // attendances: [{ member_id, present }]

            if (!date || !Array.isArray(attendances)) {
                return res.status(400).json({ error: 'Format invalide' });
            }

            // Pour chaque entrée, update ou create
            for (const att of attendances) {
                if (att.member_id) {
                    const defaults = {
                        ministry_id: id,
                        member_id: att.member_id,
                        date: date,
                        present: att.present,
                        marked_by_user_id: req.user.userId
                    };

                    const existing = await MinistryAttendance.findOne({
                        where: {
                            ministry_id: id,
                            member_id: att.member_id,
                            date: date
                        }
                    });

                    if (existing) {
                        await existing.update({ present: att.present });
                    } else {
                        await MinistryAttendance.create(defaults);
                    }
                }
            }

            res.json({ message: 'Présences mises à jour' });
        } catch (error) {
            console.error('Mark ministry attendance error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'enregistrement des présences' });
        }
    },

    // 6. Obtenir les stats de présence pour un ministère à une date
    getMinistryAttendanceStats: async (req, res) => {
        try {
            const { id } = req.params;
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({ error: 'Date requise (YYYY-MM-DD)' });
            }

            // Récupérer tous les membres du ministère
            const members = await Member.findAll({
                where: { ministry_id: id, is_active: true },
                attributes: ['id', 'first_name', 'last_name']
            });

            // Récupérer les présences enregistrées
            const attendances = await MinistryAttendance.findAll({
                where: {
                    ministry_id: id,
                    date: date
                }
            });

            // Croiser les données
            const report = members.map(m => {
                const record = attendances.find(a => a.member_id === m.id);
                return {
                    member_id: m.id,
                    name: `${m.first_name} ${m.last_name}`,
                    present: record ? record.present : false // Par défaut absent si non marqué ? Ou null ? Boolean est plus simple.
                };
            });

            const totalPresent = report.filter(r => r.present).length;

            res.json({
                date,
                total_present: totalPresent,
                total_members: members.length,
                details: report
            });
        } catch (error) {
            console.error('Get ministry stats error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
        }
    }
};

module.exports = ministryController;
