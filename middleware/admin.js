const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    // 🛡️ Vérifie d'abord si req.user existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non autorisé, utilisateur non authentifié" });
    }

    const user = await User.findById(req.user.id);

    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Accès interdit : Admins uniquement." });
    }
  } catch (error) {
    console.error("Erreur middleware admin:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = admin;
