const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendMail } = require('../services/email');

// 🔐 Inscription avec email de confirmation
exports.register = async (req, res) => {
  try {
    const { pseudo, email, password } = req.body;

    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé.' });
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
      <h1>Confirme ton email</h1>
      <p>Bienvenue sur CDesport, ${pseudo} !</p>
      <p>Clique ici : <a href="${confirmURL}">Confirmer mon email</a></p>
      <p><b>Attention :</b> Ce lien expire dans 24 heures.</p>
    `;

    await sendMail({
      to: email,
      subject: 'Confirme ton email CDesport 🚀',
      html,
    });

    res.status(201).json({
      message: '✅ Inscription réussie, un email de confirmation a été envoyé.',
    });

  } catch (err) {
    console.error('Erreur inscription :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 🔑 Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +isConfirmed');
    if (!user) {
      return res.status(400).json({ error: 'Email ou mot de passe invalide.' });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({ error: 'Merci de confirmer ton email avant de te connecter.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email ou mot de passe invalide.' });
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
    console.error('Erreur connexion :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 📨 Confirmation d’email
exports.confirmEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      confirmToken: hashedToken,
      confirmTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token invalide ou expiré.' });
    }

    user.isConfirmed = true;
    user.confirmToken = undefined;
    user.confirmTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/login?confirmed=true`);

  } catch (err) {
    console.error('Erreur confirmation email :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 📨 Mot de passe oublié
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Aucun compte trouvé avec cet email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <h1>Réinitialiser ton mot de passe</h1>
      <p>Tu as demandé une réinitialisation de mot de passe.</p>
      <p>Clique ici : <a href="${resetURL}">Réinitialiser</a></p>
      <p>Ce lien expirera dans 1 heure.</p>
    `;

    await sendMail({
      to: user.email,
      subject: '🔑 Réinitialisation de ton mot de passe CDesport',
      html,
    });

    res.json({ message: '📨 Email de réinitialisation envoyé.' });

  } catch (err) {
    console.error('Erreur forgotPassword :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 🔒 Réinitialisation du mot de passe
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
      return res.status(400).json({ error: 'Token invalide ou expiré.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: '✅ Mot de passe modifié avec succès.' });

  } catch (err) {
    console.error('Erreur resetPassword :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

console.log('🔐 Clé JWT :', process.env.JWT_SECRET);
