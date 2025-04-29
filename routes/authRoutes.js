// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 🔐 Inscription
router.post('/register', authController.register);

// 🔑 Connexion
router.post('/login', authController.login);

// 📧 Confirmation d'email
router.get('/confirm/:token', authController.confirmEmail);

// 🔒 Mot de passe oublié (Forgot password)
router.post('/forgot-password', authController.forgotPassword);

// 🔒 Réinitialisation du mot de passe
router.put('/reset-password/:token', authController.resetPassword);

module.exports = router;
