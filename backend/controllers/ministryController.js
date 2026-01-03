// controllers/ministryController.js
const { Ministry, Member, User, MinistryAttendance, MinistryHeadcount } = require('../models');
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
    },

    // 7. Obtenir une vue d'ensemble de tous les ministères pour une date
    getMinistriesAttendanceOverview: async (req, res) => {
        try {
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({ error: 'Date requise (YYYY-MM-DD)' });
            }

            // Récupérer tous les ministères
            const ministries = await Ministry.findAll({
                include: [
                    { model: Member, as: 'members', attributes: ['id'] }
                ]
            });

            // Récupérer toutes les présences nominatives pour cette date
            const attendances = await MinistryAttendance.findAll({
                where: { date: date }
            });

            // Récupérer les effectifs manuels pour cette date
            const headcounts = await MinistryHeadcount.findAll({
                where: { date: date }
            });

            const overview = ministries.map(m => {
                const ministryAttendances = attendances.filter(a => a.ministry_id === m.id);
                const nominativeCount = ministryAttendances.filter(a => a.present).length;

                const manualRecord = headcounts.find(h => h.ministry_id === m.id);
                const manualCount = manualRecord ? manualRecord.headcount : 0;

                // On utilise le plus grand des deux ou on favorise le manuel s'il existe ?
                // Le manuel est souvent plus précis s'il est saisi globalement.
                const finalCount = manualRecord ? manualCount : nominativeCount;

                return {
                    id: m.id,
                    name: m.name,
                    total_members: m.members.length,
                    present_count: finalCount,
                    nominative_count: nominativeCount,
                    manual_count: manualCount,
                    has_manual: !!manualRecord,
                    attendance_rate: m.members.length > 0 ? Math.round((finalCount / m.members.length) * 100) : 0
                };
            });

            res.json(overview);
        } catch (error) {
            console.error('Get ministries overview error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la vue d\'ensemble' });
        }
    },

    // 8. Sauvegarder les effectifs (Bulk Headcount)
    saveHeadcounts: async (req, res) => {
        try {
            const { date, headcounts } = req.body; // headcounts: [{ ministry_id, headcount }]
            if (!date || !Array.isArray(headcounts)) {
                return res.status(400).json({ error: 'Date et tableau d\'effectifs requis' });
            }

            for (const h of headcounts) {
                if (h.ministry_id) {
                    await MinistryHeadcount.upsert({
                        ministry_id: h.ministry_id,
                        date: date,
                        headcount: h.headcount || 0,
                        marked_by_user_id: req.user.userId
                    });
                }
            }

            res.json({ message: 'Effectifs enregistrés avec succès' });
        } catch (error) {
            console.error('Save headcounts error:', error);
            res.status(500).json({ error: 'Erreur lors de l\'enregistrement des effectifs' });
        }
    },

    // 9. Obtenir l'évolution des statistiques (Graphique)
    getMinistryEvolution: async (req, res) => {
        try {
            const { id } = req.params;
            const { start_date, end_date } = req.query;

            if (!start_date || !end_date) {
                return res.status(400).json({ error: 'Dates de début et de fin requises' });
            }

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);

            // 1. Récupérer les effectifs manuels (Headcounts)
            const headcounts = await MinistryHeadcount.findAll({
                where: {
                    ministry_id: id,
                    date: { [Op.between]: [start_date, end_date] }
                },
                order: [['date', 'ASC']]
            });

            // 2. Récupérer les présences nominatives (Detailed Attendance)
            const attendances = await MinistryAttendance.findAll({
                where: {
                    ministry_id: id,
                    date: { [Op.between]: [start_date, end_date] }
                },
                attributes: ['date', 'present'],
                order: [['date', 'ASC']]
            });

            // 3. Récupérer tous les membres actuels avec leur date de création
            // On utilise created_at pour estimer l'historique de l'effectif total
            const members = await Member.findAll({
                where: { ministry_id: id },
                attributes: ['id', 'created_at']
            });

            // 4. Générer la chronologie (Timeline)
            const timeline = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                timeline.push(new Date(d).toISOString().split('T')[0]);
            }

            // 5. Construire les données du graphique
            const evolutionData = timeline.map(dateStr => {
                // a. Calcul de l'effectif total à cette date (Estimation)
                // Membres créés AVANT ou À cette date
                const totalMembersAtDate = members.filter(m => {
                    const createdDate = new Date(m.created_at).toISOString().split('T')[0];
                    return createdDate <= dateStr;
                }).length;

                // b. Calcul des présences
                // Option 1: Headcount manuel
                const manualEntry = headcounts.find(h => h.date === dateStr);
                const manualCount = manualEntry ? manualEntry.headcount : 0;

                // Option 2: Nominatif
                // On compte uniquement ceux marqués comme 'present' = true
                const nominativeCount = attendances
                    .filter(a => a.date === dateStr && a.present)
                    .length;

                // Priorité au manuel s'il existe (hypthèse: le manuel surcharge le nominatif partiel)
                // OU Max des deux ? 
                // "getMinistriesAttendanceOverview" utilisait une logique similaire.
                // Ici on garde la même logique: si manuel existe, on prend manuel. Sinon nominatif.
                // MAIS si nominatif > manuel, c'est bizarre. Prenons le MAX pour le graphique pour être gentil.
                const attendanceCount = Math.max(manualCount, nominativeCount);

                return {
                    date: dateStr,
                    total_members: totalMembersAtDate,
                    attendance: attendanceCount,
                    rate: totalMembersAtDate > 0 ? Math.round((attendanceCount / totalMembersAtDate) * 100) : 0,
                    is_manual: !!manualEntry
                };
            });

            // Pour réduire le bruit, on peut filtrer les jours où il y a 0 activité ?
            // Mais pour une courbe continue, il vaut mieux garder tous les jours ou filtrer côté frontend.
            // On renvoie tout, le frontend décidera (ex: afficher seulement les dimanches ou les jours avec event).
            // Pour l'instant on renvoie tout.

            res.json(evolutionData);

        } catch (error) {
            console.error('Get ministry evolution error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques d\'évolution' });
        }
    }
};

module.exports = ministryController;
