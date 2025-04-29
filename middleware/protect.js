const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from the header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Find the user from the decoded token
      const user = await User.findById(decoded.id).select('-password'); // Exclude password

      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      // Attach user to the request object
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }
};

module.exports = protect;
