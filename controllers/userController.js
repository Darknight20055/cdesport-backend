const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ➡️ Create user + return token (signup)
exports.createUser = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;

    // 1️⃣ Required fields
    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 2️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "This email is already in use." });
    }

    // 3️⃣ Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create the user
    const user = await User.create({
      pseudo,
      email,
      password: hashedPassword,
      avatar: "",
      bio: "",
      badges: [],
      isAdmin: false,
    });

    // 5️⃣ Generate a JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6️⃣ Return token + user info
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
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ➡️ Update own profile (My Account)
exports.updateProfile = async (req, res) => {
  try {
    const { email, pseudo, avatar } = req.body;
    const userId = req.user.id;

    const updatedFields = {};
    if (email)  updatedFields.email  = email;
    if (pseudo) updatedFields.pseudo = pseudo;
    if (avatar) updatedFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true });
    res.json({
      message: "✅ Profile updated successfully.",
      user: {
        email: user.email,
        pseudo: user.pseudo,
        avatar: user.avatar,
      },
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

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: '✅ Password updated successfully.' });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
