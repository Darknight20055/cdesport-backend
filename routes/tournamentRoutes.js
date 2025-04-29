const express = require('express');
const router = express.Router();
const TournamentParticipant = require('../models/TournamentParticipant');
const protect = require('../middleware/authMiddleware'); // JWT middleware

// Basic test route (you can keep it)
router.get('/', (req, res) => {
  res.send('List of tournaments');
});

// ✅ Route to register a player to a tournament
router.post('/register', protect, async (req, res) => {
  try {
    const { pseudo, avatar, tournamentName } = req.body;

    // Check required fields
    if (!pseudo || !avatar) {
      return res.status(400).json({ message: 'Pseudo and avatar are required.' });
    }

    const participant = new TournamentParticipant({
      user: req.user._id, // provided by JWT middleware
      pseudo,
      avatar,
      tournamentName, // optional (default value used if not provided)
    });

    const savedParticipant = await participant.save();
    res.status(201).json(savedParticipant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
