// controllers/areaController.js
const { Area, User } = require('../models');
const { Op } = require('sequelize');

const areaController = {
  // Lister les zones
  getAreas: async (req, res) => {
    try {
      const { page = 1, limit = 50, search } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtrage strict pour les Gouverneurs (voir uniquement les zones de leur région)
      if (req.user.role === 'Governor') {
        const { Region } = require('../models');
        const region = await Region.findOne({
          where: { governor_id: req.user.userId }
        });

        if (region) {
          whereClause.region_id = region.id;
        } else {
          whereClause.region_id = '00000000-0000-0000-0000-000000000000'; // Force empty
        }
      }

      // Recherche textuelle
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } }
        ];
      }

      const areas = await Area.findAndCountAll({
        where: whereClause,
        include: [
          { model: require('../models').Region, as: 'region', attributes: ['id', 'name'] },
          { model: User, as: 'overseer', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: User, as: 'leader_user', attributes: ['id', 'first_name', 'last_name', 'email'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['number', 'ASC']]
      });

      res.json({
        areas: areas.rows,
        total: areas.count,
        page: parseInt(page),
        totalPages: Math.ceil(areas.count / limit)
      });
    } catch (error) {
      console.error('Get areas error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des zones' });
    }
  },

  // Obtenir une zone par ID
  getAreaById: async (req, res) => {
    try {
      const areaId = req.params.id;

      const area = await Area.findByPk(areaId, {
        include: [
          { model: User, as: 'overseer', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: User, as: 'leader_user', attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });

      if (!area) {
        return res.status(404).json({ error: 'Zone non trouvée' });
      }

      res.json(area);
    } catch (error) {
      console.error('Get area error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la zone' });
    }
  },

  // Créer une zone
  createArea: async (req, res) => {
    try {
      const { name, number, overseer_id, leader_id, region_id, description } = req.body;

      if (!name || !number) {
        return res.status(400).json({ error: 'Le nom et le numéro sont obligatoires' });
      }

      // Sanitization
      const finalRegionId = region_id === "" ? null : region_id;
      const finalLeaderId = leader_id === "" ? null : leader_id;
      const finalOverseerId = overseer_id === "" ? null : overseer_id;

      // Vérifier que le numéro est unique
      const existingArea = await Area.findOne({ where: { number } });
      if (existingArea) {
        return res.status(400).json({ error: 'Ce numéro de zone existe déjà' });
      }

      const area = await Area.create({
        name,
        number,
        overseer_id: finalOverseerId,
        leader_id: finalLeaderId,
        region_id: finalRegionId,
        description
      });

      const newArea = await Area.findByPk(area.id, {
        include: [
          { model: User, as: 'overseer', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: User, as: 'leader_user', attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });

      res.status(201).json(newArea);
    } catch (error) {
      console.error('Create area error:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la zone' });
    }
  },

  // Modifier une zone
  updateArea: async (req, res) => {
    try {
      const areaId = req.params.id;
      const updateData = req.body;

      const area = await Area.findByPk(areaId);
      if (!area) {
        return res.status(404).json({ error: 'Zone non trouvée' });
      }

      // Vérifier l'unicité du numéro si modifié
      if (updateData.number && updateData.number !== area.number) {
        const existingArea = await Area.findOne({
          where: { number: updateData.number, id: { [Op.ne]: areaId } }
        });
        if (existingArea) {
          return res.status(400).json({ error: 'Ce numéro de zone existe déjà' });
        }
      }

      // Sanitization for updates
      const finalUpdateData = { ...updateData };
      if (finalUpdateData.region_id === "") finalUpdateData.region_id = null;
      if (finalUpdateData.leader_id === "") finalUpdateData.leader_id = null;
      if (finalUpdateData.overseer_id === "") finalUpdateData.overseer_id = null;

      await area.update(finalUpdateData);

      const updatedArea = await Area.findByPk(areaId, {
        include: [
          { model: User, as: 'overseer', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: User, as: 'leader_user', attributes: ['id', 'first_name', 'last_name', 'email'] }
        ]
      });

      res.json(updatedArea);
    } catch (error) {
      console.error('Update area error:', error);
      res.status(500).json({ error: 'Erreur lors de la modification de la zone' });
    }
  },

  // Supprimer une zone
  deleteArea: async (req, res) => {
    try {
      const areaId = req.params.id;

      const area = await Area.findByPk(areaId);
      if (!area) {
        return res.status(404).json({ error: 'Zone non trouvée' });
      }

      await area.destroy();
      res.json({ message: 'Zone supprimée avec succès' });
    } catch (error) {
      console.error('Delete area error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la zone' });
    }
  },

  // Assigner une zone à un utilisateur
  assignAreaToUser: async (req, res) => {
    try {
      const { user_id, area_id } = req.body;

      if (!user_id || !area_id) {
        return res.status(400).json({ error: 'ID utilisateur et ID zone requis' });
      }

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const area = await Area.findByPk(area_id);
      if (!area) {
        return res.status(404).json({ error: 'Zone non trouvée' });
      }

      await user.update({ area_id });

      res.json({ message: 'Zone assignée avec succès' });
    } catch (error) {
      console.error('Assign area error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'assignation de la zone' });
    }
  },

  // 6. Obtenir les leaders d'une zone
  getAreaLeaders: async (req, res) => {
    try {
      const areaId = req.params.id;
      const leaders = await require('../models').User.findAll({
        where: { area_id: areaId },
        include: [
          {
            model: require('../models').Member,
            as: 'led_members',
            attributes: ['id']
          }
        ],
        attributes: ['id', 'first_name', 'last_name', 'email', 'role']
      });
      res.json(leaders);
    } catch (error) {
      console.error('Get area leaders error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des leaders' });
    }
  }
};

module.exports = areaController;