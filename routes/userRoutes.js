const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/auth");  // Middleware de protection

// Import de tous les controllers, y compris changePassword
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  updateProfile,
  changePassword     // ← Bien penser à importer changePassword ici
} = require("../controllers/userController");

// 🔐 Route login pour obtenir un token JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email invalide." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe invalide." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔒 Routes protégées
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour son propre profil
router.put("/me", protect, updateProfile);

// Changer son mot de passe
router.put("/password", protect, changePassword);  // ← callback maintenant défini

// Routes CRUD (Admin / développement futur)
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);

module.exports = router;
