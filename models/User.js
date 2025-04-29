const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pseudo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },

  badges: {
    type: [String], // 🎯 List of badges
    default: [],
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  // ✅ Email confirmation
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  confirmToken: String,
  confirmTokenExpires: Date,

  // ✅ Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // 🆕 XP system
  xp: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
