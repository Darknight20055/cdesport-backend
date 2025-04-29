const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 🔐 Register
router.post('/register', authController.register);

// 🔑 Login
router.post('/login', authController.login);

// 📧 Email confirmation
router.get('/confirm/:token', authController.confirmEmail);

// 🔒 Forgot password
router.post('/forgot-password', authController.forgotPassword);

// 🔒 Reset password
router.put('/reset-password/:token', authController.resetPassword);

module.exports = router;
