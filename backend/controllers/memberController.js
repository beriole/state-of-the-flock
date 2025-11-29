// controllers/memberController.js
const { Member, User, Area, Attendance, CallLog } = require('../models');
const { Op } = require('sequelize');

const memberController = {
  // Lister les membres
  getMembers: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search, 
        area_id, 
        leader_id, 
        state, 
        is_active,
        is_registered 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtrage basé sur le rôle
      if (req.user.role === 'Bacenta_Leader') {
        whereClause.leader_id = req.user.userId;
      } else if (req.user.role === 'Area_Pastor' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      } else if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      }

      // Filtres supplémentaires
      if (area_id) whereClause.area_id = area_id;
      if (leader_id) whereClause.leader_id = leader_id;
      if (state) whereClause.state = state;
      if (is_active !== undefined) whereClause.is_active = is_active === 'true';
      if (is_registered !== undefined) whereClause.is_registered = is_registered === 'true';

      // Recherche textuelle
      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { phone_primary: { [Op.like]: `%${search}%` } }
        ];
      }

      const members = await Member.findAndCountAll({
        where: whereClause,
        include: [
          { model: Area, as: 'area' },
          { model: User, as: 'leader' }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['first_name', 'ASC']]
      });

      res.json({
        members: members.rows,
        total: members.count,
        page: parseInt(page),
        totalPages: Math.ceil(members.count / limit)
      });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
    }
  },

  // Obtenir un membre par ID
  getMemberById: async (req, res) => {
    try {
      const memberId = req.params.id;

      const member = await Member.findByPk(memberId, {
        include: [
          { model: Area, as: 'area' },
          { model: User, as: 'leader' },
          { 
            model: Attendance, 
            as: 'attendances',
            limit: 10,
            order: [['sunday_date', 'DESC']]
          },
          {
            model: CallLog,
            as: 'call_logs',
            limit: 10,
            order: [['call_date', 'DESC']],
            include: [{ model: User, as: 'caller' }]
          }
        ]
      });

      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader' && member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé à ce membre' });
      }

      res.json(member);
    } catch (error) {
      console.error('Get member error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du membre' });
    }
  },

  // Créer un membre
  createMember: async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        phone_primary,
        phone_secondary,
        gender,
        is_registered,
        state,
        area_id,
        leader_id,
        ministry,
        profession,
        notes
      } = req.body;

      // Allow Bishops to create members without area_id (they can set it later)
      if (!first_name || !last_name || !phone_primary || !gender || !leader_id) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
      }

      // For Bishops, area_id is optional
      if (req.user.role !== 'Bishop' && !area_id) {
        return res.status(400).json({ error: 'Zone requise pour ce rôle' });
      }

      const member = await Member.create({
        first_name,
        last_name,
        phone_primary,
        phone_secondary,
        gender,
        is_registered: is_registered || false,
        state: state || 'Sheep',
        area_id,
        leader_id,
        ministry,
        profession,
        notes,
        is_active: true
      });

      const newMember = await Member.findByPk(member.id, {
        include: [
          { model: Area, as: 'area' },
          { model: User, as: 'leader' }
        ]
      });

      res.status(201).json(newMember);
    } catch (error) {
      console.error('Create member error:', error);
      res.status(500).json({ error: 'Erreur lors de la création du membre' });
    }
  },

  // Modifier un membre
  updateMember: async (req, res) => {
    try {
      const memberId = req.params.id;
      const updateData = req.body;

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      if (req.user.role === 'Bacenta_Leader' && member.leader_id !== req.user.userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      await member.update(updateData);

      const updatedMember = await Member.findByPk(memberId, {
        include: [
          { model: Area, as: 'area' },
          { model: User, as: 'leader' }
        ]
      });

      res.json(updatedMember);
    } catch (error) {
      console.error('Update member error:', error);
      res.status(500).json({ error: 'Erreur lors de la modification du membre' });
    }
  },

  // Désactiver un membre
  deleteMember: async (req, res) => {
    try {
      const memberId = req.params.id;

      const member = await Member.findByPk(memberId);
      if (!member) {
        return res.status(404).json({ error: 'Membre non trouvé' });
      }

      await member.update({ is_active: false });
      res.json({ message: 'Membre désactivé avec succès' });
    } catch (error) {
      console.error('Delete member error:', error);
      res.status(500).json({ error: 'Erreur lors de la désactivation du membre' });
    }
  }
};

module.exports = memberController;