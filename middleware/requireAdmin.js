// middleware/requireAdmin.js
module.exports = function requireAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied: Admins only." });
    }
    next();
  };
  