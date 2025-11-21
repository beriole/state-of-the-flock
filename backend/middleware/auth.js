const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware d'authentification JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header ou le cookie
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou désactivé' });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      area_id: user.area_id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Middleware de vérification de rôle
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès non autorisé. Rôle insuffisant.' 
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
