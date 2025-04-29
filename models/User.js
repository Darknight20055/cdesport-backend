const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pseudo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },

  badges: {
    type: [String], // 🎯 Liste des badges
    default: [],
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  // ✅ Confirmation d'email
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  confirmToken: String,
  confirmTokenExpires: Date,

  // ✅ Reset mot de passe
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);