// backend/routes/tournamentRoutes.js
const express = require('express');
const router = express.Router();
const TournamentParticipant = require('../models/TournamentParticipant');
const protect = require('../middleware/authMiddleware'); // middleware JWT

// Test basique (tu peux garder)
router.get('/', (req, res) => {
  res.send('Liste des tournois');
});

// ✅ Route pour inscrire un joueur au tournoi
router.post('/register', protect, async (req, res) => {
  try {
    const { pseudo, avatar, tournamentName } = req.body;

    // Vérifie les données reçues
    if (!pseudo || !avatar) {
      return res.status(400).json({ message: 'Pseudo et avatar requis.' });
    }

    const participant = new TournamentParticipant({
      user: req.user._id, // récupéré par ton middleware JWT
      pseudo,
      avatar,
      tournamentName, // optionnel (valeur par défaut utilisée sinon)
    });

    const savedParticipant = await participant.save();
    res.status(201).json(savedParticipant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
