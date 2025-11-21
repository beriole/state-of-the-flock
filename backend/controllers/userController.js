// controllers/userController.js
const bcrypt = require('bcrypt');
const { User, Area, Member } = require('../models');
const { Op } = require('sequelize');

const userController = {
  // Lister les utilisateurs
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 50, role, area_id } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (role) whereClause.role = role;
      if (area_id) whereClause.area_id = area_id;

      if (req.user.role === 'Assisting_Overseer' && req.user.area_id) {
        whereClause.area_id = req.user.area_id;
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        include: [{ model: Area, as: 'area' }],
        attributes: { exclude: ['password_hash'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        users: users.rows,
        total: users.count,
        page: parseInt(page),
        totalPages: Math.ceil(users.count / limit)
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  },

  // Obtenir un utilisateur par ID
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;

      if (req.user.role !== 'Bishop' && req.user.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const user = await User.findByPk(userId, {
        include: [
          { model: Area, as: 'area' },
          { model: Member, as: 'members' }
        ],
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  },

  // Créer un utilisateur
  createUser: async (req, res) => {
    try {
      const { email, password, first_name, last_name, role, area_id, phone } = req.body;

      if (!email || !password || !first_name || !last_name || !role) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        password_hash: passwordHash,
        first_name,
        last_name,
        role,
        area_id,
        phone,
        is_active: true
      });

      const userResponse = await User.findByPk(user.id, {
        include: [{ model: Area, as: 'area' }],
        attributes: { exclude: ['password_hash'] }
      });

      res.status(201).json(userResponse);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
  },

  // Modifier un utilisateur
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { first_name, last_name, role, area_id, phone, is_active } = req.body;

      if (req.user.role !== 'Bishop' && req.user.userId !== userId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      await user.update({
        first_name,
        last_name,
        role: req.user.role === 'Bishop' ? role : user.role,
        area_id,
        phone,
        is_active: req.user.role === 'Bishop' ? is_active : user.is_active
      });

      const updatedUser = await User.findByPk(userId, {
        include: [{ model: Area, as: 'area' }],
        attributes: { exclude: ['password_hash'] }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const memberCount = await Member.count({ where: { leader_id: userId } });
      if (memberCount > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer cet utilisateur car il a des membres associés'
        });
      }

      await user.destroy();
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  },

  // Mettre à jour les paramètres utilisateur
  updateSettings: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { settings } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Fusionner les paramètres existants avec les nouveaux
      const currentSettings = user.settings || {};
      const newSettings = { ...currentSettings, ...settings };

      await user.update({ settings: newSettings });

      res.json({ message: 'Paramètres mis à jour', settings: newSettings });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
    }
  }
};

module.exports = userController;