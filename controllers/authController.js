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

    const hashedPassword = await bcrypt.hash(password, 10);

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
    user.confirmTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
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

    res.status(201).json({ message: '✅ Registration successful. A confirmation email has been sent.' });

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
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({ error: 'Please confirm your email before logging in.' });
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

// 📨 Confirm Email
exports.confirmEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      confirmToken: hashedToken,
      confirmTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/confirm-invalid`);
    }

    user.isConfirmed = true;
    user.confirmToken = undefined;
    user.confirmTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/confirm-success`);
  } catch (err) {
    console.error('Email confirmation error:', err);
    res.redirect(`${process.env.CLIENT_URL}/confirm-error`);
  }
};

// 🔁 Resend confirmation email
exports.resendConfirmation = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user found with that email." });
    }

    if (user.isConfirmed) {
      return res.status(400).json({ error: "Email is already confirmed." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.confirmToken = crypto.createHash('sha256').update(token).digest('hex');
    user.confirmTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const confirmURL = `${process.env.CLIENT_URL}/confirm/${token}`;
    const html = `
      <h1>Confirm Your Email</h1>
      <p>Click here: <a href="${confirmURL}">Confirm your email</a></p>
      <p>This link expires in 24 hours.</p>
    `;

    await sendMail({
      to: email,
      subject: '🔔 Resend Email Confirmation - CDesport',
      html,
    });

    res.json({ message: '📨 Confirmation email re-sent.' });

  } catch (err) {
    console.error('Resend confirmation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// 🔒 Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with that email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
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

// 🔒 Reset Password
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

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '✅ Password successfully updated.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
