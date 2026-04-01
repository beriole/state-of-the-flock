// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Area } = require('../models');

const authController = {
  // Connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`🔑 Login attempt for: ${email}`);

      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }

      console.log('📡 Querying database for user...');
      const user = await User.findOne({
        where: { email },
        include: [
          { 
            model: Area, 
            as: 'area',
            include: [{ model: require('../models').Region, as: 'region', attributes: ['id', 'name'] }]
          },
          { model: require('../models').Region, as: 'governed_region' }
        ],
        attributes: { include: ['password_hash'] }
      });

      console.log(`📡 User found: ${user ? 'YES' : 'NO'}`);

      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Pour test : accepter n'importe quel mot de passe pour les emails @test.com
      let isValidPassword = false;
      if (user.email.endsWith('@test.com')) {
        isValidPassword = true; // Accepter n'importe quel mot de passe pour les utilisateurs de test
      } else if (user.password_hash === password) {
        // Mot de passe simple
        isValidPassword = true;
      } else {
        // Mot de passe hashé
        isValidPassword = await bcrypt.compare(password, user.password_hash);
      }

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      if (!user.is_active) {
        return res.status(401).json({ error: 'Compte désactivé' });
      }

      await user.update({ last_login: new Date() });

      // Vérification du secret JWT
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('❌ ERREUR CRITIQUE: JWT_SECRET n\'est pas défini');
        throw new Error('Configuration serveur incomplète (JWT_SECRET manquant)');
      }

      // Création du token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          area_id: user.area_id
        },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Stockage du token dans un cookie sécurisé
      res.cookie('token', token, {
        httpOnly: true,       // inaccessible au JS côté client (sécurité XSS)
        secure: process.env.NODE_ENV === 'production', // cookie HTTPS seulement en prod
        sameSite: 'strict',   // empêche le cross-site request forgery (CSRF)
        maxAge: 7 * 24 * 60 * 60 * 1000 // durée en ms (ici 7 jours)
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        area: user.area,
        area_id: user.area_id,
        phone: user.phone,
        photo_url: user.photo_url,
        is_active: user.is_active,
        last_login: user.last_login
      };

      res.json({
        message: 'Connexion réussie',
        token,        // renvoi également le token dans la réponse JSON si besoin côté client
        user: userResponse
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Erreur serveur lors de la connexion',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Vérification du token
  verifyToken: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, {
        include: [
          { 
            model: Area, 
            as: 'area',
            include: [{ model: require('../models').Region, as: 'region', attributes: ['id', 'name'] }]
          },
          { model: require('../models').Region, as: 'governed_region' }
        ],
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ error: 'Erreur de vérification du token' });
    }
  },

  // Changement de mot de passe
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
      }

      const user = await User.findByPk(userId, {
        attributes: { include: ['password_hash'] }
      });

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      await user.update({ password_hash: newPasswordHash });

      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
    }
  },
  // Déconnexion
  logout: (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'Déconnexion réussie' });
  },

  // Impersonner un utilisateur (Bishop seulement)
  impersonateUser: async (req, res) => {
    try {
      if (req.user.role !== 'Bishop') {
        return res.status(403).json({ error: 'Accès restreint aux Bishops' });
      }

      const targetUserId = req.params.id;
      const user = await User.findByPk(targetUserId, {
        include: [{ model: Area, as: 'area' }]
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Création du token pour l'utilisateur cible
      const secret = process.env.JWT_SECRET;
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          area_id: user.area_id,
          isImpersonated: true,
          originalAdminId: req.user.userId
        },
        secret,
        { expiresIn: '2h' } // Token court pour l'impersonation
      );

      const userResponse = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        area: user.area,
        area_id: user.area_id,
        phone: user.phone,
        photo_url: user.photo_url,
        is_active: user.is_active
      };

      res.json({
        message: `Impersonation réussie pour ${user.first_name} ${user.last_name}`,
        token,
        user: userResponse
      });

    } catch (error) {
      console.error('Impersonation error:', error);
      res.status(500).json({ error: 'Erreur lors de l\'impersonation' });
    }
  }
};

module.exports = authController;