const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    // 🛡️ First, check if req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated." });
    }

    const user = await User.findById(req.user.id);

    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied: Admins only." });
    }
  } catch (error) {
    console.error("admin middleware error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = admin;
