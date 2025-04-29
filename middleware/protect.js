const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
const protect = async (req, res, next) => {
  let token;

  // Vérifie si le header Authorization est présent et commence par 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupère le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifie la validité du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Cherche l'utilisateur en fonction de l'ID décodé du token
      const user = await User.findById(decoded.id).select('-password'); // Exclut le mot de passe

      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // Ajoute l'utilisateur à la requête pour qu'il soit accessible dans les routes suivantes
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token invalide' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Pas de token fourni' });
  }
};

module.exports = protect;
