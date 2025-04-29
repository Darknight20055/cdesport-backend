const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ➡️ Create user + return token (signup) — ⚠️ à utiliser uniquement si tu n'utilises pas l'inscription avec confirmation
exports.createUser = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;

    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      pseudo,
      email,
      password: hashedPassword,
      avatar: "",
      bio: "",
      badges: [],
      isAdmin: false,
      isConfirmed: true, // ✅ pour ne pas bloquer la connexion
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    console.error("createUser error:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// ➡️ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➡️ Get a user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➡️ Update a user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { password, ...fieldsToUpdate } = req.body;
    if (password) {
      return res.status(400).json({ error: "Password update not allowed here." });
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: '✅ User updated successfully.', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ➡️ Update own profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, pseudo, avatar, bio } = req.body;
    const userId = req.user.id;

    const updatedFields = {};
    if (email) updatedFields.email = email;
    if (pseudo) updatedFields.pseudo = pseudo;
    if (avatar) updatedFields.avatar = avatar;
    if (bio) updatedFields.bio = bio;

    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true }).select('-password');

    res.json({
      message: "✅ Profile updated successfully.",
      user,
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ➡️ Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '✅ Password updated successfully.' });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
