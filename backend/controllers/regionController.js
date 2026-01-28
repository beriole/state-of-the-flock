// controllers/regionController.js
const { Region, User, Area } = require('../models');

const regionController = {
    // 1. Lister toutes les régions (avec auto-seed si vide)
    getRegions: async (req, res) => {
        try {
            let regions = await Region.findAll({
                include: [
                    { model: User, as: 'governor', attributes: ['id', 'first_name', 'last_name'] },
                    { model: Area, as: 'areas', attributes: ['id', 'name'] }
                ],
                order: [['name', 'ASC']]
            });

            // Si aucune région n'existe, en créer 4 par défaut
            if (regions.length === 0) {
                const defaultRegions = [
                    { name: 'Région 1' },
                    { name: 'Région 2' },
                    { name: 'Région 3' },
                    { name: 'Région 4' }
                ];
                await Region.bulkCreate(defaultRegions);
                // Re-fetch
                regions = await Region.findAll({
                    include: [
                        { model: User, as: 'governor', attributes: ['id', 'first_name', 'last_name'] },
                        { model: Area, as: 'areas', attributes: ['id', 'name'] }
                    ],
                    order: [['name', 'ASC']]
                });
            }

            res.json(regions);
        } catch (error) {
            console.error('Get regions error:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des régions' });
        }
    },

    // 2. Créer une région
    createRegion: async (req, res) => {
        try {
            const { name, governor_id } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Le nom de la région est obligatoire' });
            }

            const region = await Region.create({ name, governor_id });
            res.status(201).json(region);
        } catch (error) {
            console.error('Create region error:', error);
            res.status(500).json({ error: 'Erreur lors de la création de la région' });
        }
    },

    // 3. Modifier une région
    updateRegion: async (req, res) => {
        try {
            const { id } = req.params;
            const region = await Region.findByPk(id);
            if (!region) {
                return res.status(404).json({ error: 'Région non trouvée' });
            }
            await region.update(req.body);
            res.json(region);
        } catch (error) {
            console.error('Update region error:', error);
            res.status(500).json({ error: 'Erreur lors de la modification' });
        }
    },

    // 4. Supprimer une région
    deleteRegion: async (req, res) => {
        try {
            const { id } = req.params;
            const region = await Region.findByPk(id);
            if (!region) {
                return res.status(404).json({ error: 'Région non trouvée' });
            }
            await region.destroy();
            res.json({ message: 'Région supprimée avec succès' });
        } catch (error) {
            console.error('Delete region error:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression de la région' });
        }
    }
};

module.exports = regionController;
