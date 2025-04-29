const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendMail } = require('../services/email');

// 🔐 Register with email confirmation
exports.register = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;

    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      pseudo,
      email,
      password: hashedPassword,
      avatar: '',
      badges: [],
      isAdmin: false,
      isConfirmed: false,
    });

    const token = crypto.randomBytes(32).toString('hex');
    user.confirmToken = crypto.createHash('sha256').update(token).digest('hex');
    user.confirmTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    const confirmURL = `${process.env.CLIENT_URL}/confirm/${token}`;
    const html = `
      <h1>Confirm Your Email</h1>
      <p>Welcome to CDesport, ${pseudo}!</p>
      <p>Click here: <a href="${confirmURL}">Confirm your email</a></p>
      <p><b>Note:</b> This link expires in 24 hours.</p>
    `;

    await sendMail({
      to: email,
      subject: 'Confirm your CDesport email 🚀',
      html,
    });

    res.status(201).json({
      message: '✅ Registration successful. A confirmation email has been sent.',
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 🔑 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +isConfirmed');
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({ error: 'Please confirm your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      userId: user._id,
      pseudo: user.pseudo,
      email: user.email,
      avatar: user.avatar,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 📨 Email confirmation
exports.confirmEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      confirmToken: hashedToken,
      confirmTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    user.isConfirmed = true;
    user.confirmToken = undefined;
    user.confirmTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/login?confirmed=true`);

  } catch (err) {
    console.error('Email confirmation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 📨 Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with that email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password.</p>
      <p>Click here: <a href="${resetURL}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendMail({
      to: user.email,
      subject: '🔑 Reset your CDesport password',
      html,
    });

    res.json({ message: '📨 Password reset email sent.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 🔒 Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '✅ Password successfully updated.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
