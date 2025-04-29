const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ➡️ Créer un utilisateur + renvoyer un token (inscription)
exports.createUser = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;

    // 1️⃣ Champs obligatoires
    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    // 2️⃣ Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // 3️⃣ Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Création de l'utilisateur
    const user = await User.create({
      pseudo,
      email,
      password: hashedPassword,
      avatar: "",
      bio: "",
      badges: [],
      isAdmin: false,
    });

    // 5️⃣ Générer un token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6️⃣ Renvoyer token + infos utilisateur
    res.status(201).json({
      token,
      user: {
        id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        avatar: user.avatar,
      }
    });

  } catch (err) {
    console.error("Erreur createUser :", err);
    res.status(500).json({ error: "Erreur serveur pendant l'inscription." });
  }
};

// ➡️ Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➡️ Obtenir un utilisateur par ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➡️ Mettre à jour un utilisateur (par Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ➡️ Mettre à jour son propre profil (Mon Compte)
exports.updateProfile = async (req, res) => {
  try {
    const { email, pseudo, avatar } = req.body;
    const userId = req.user.id; // fourni par protect

    const updatedFields = {};
    if (email)  updatedFields.email  = email;
    if (pseudo) updatedFields.pseudo = pseudo;
    if (avatar) updatedFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true });
    res.json({
      message: "✅ Profil mis à jour",
      user: {
        email: user.email,
        pseudo: user.pseudo,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Erreur mise à jour profil :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ➡️ Changer son mot de passe
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // fourni par protect

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: '✅ Mot de passe mis à jour avec succès.' });
  } catch (err) {
    console.error("Erreur changePassword :", err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
