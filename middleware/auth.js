const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      // 🔥 on ajoute les champs qu’on veut utiliser après
      req.user = {
        id: user._id,
        pseudo: user.pseudo,
        avatar: user.avatar
      };

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token invalide' });
    }
  } else {
    return res.status(401).json({ message: 'Pas de token fourni' });
  }
};

module.exports = protect;
