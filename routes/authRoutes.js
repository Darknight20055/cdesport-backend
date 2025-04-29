const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 🔐 Register
router.post('/register', authController.register);

// 🔑 Login
router.post('/login', authController.login);

// 📧 Email confirmation par lien
router.get('/confirm/:token', authController.confirmEmail);

// ✅ Confirmation par code (nouvelle route)
router.post('/confirm-code', authController.confirmCode); // ← ajoute ça

// 🔁 Resend confirmation email
router.post('/resend-confirmation', authController.resendConfirmation);

// 🔒 Forgot password
router.post('/forgot-password', authController.forgotPassword);

// 🔒 Reset password
router.put('/reset-password/:token', authController.resetPassword);

module.exports = router;
