const express = require('express');
const router = express.Router();
const TournamentParticipant = require('../models/TournamentParticipant');
const Tournament = require('../models/Tournament');
const protect = require('../middleware/protect'); // JWT middleware
const requireAdmin = require('../middleware/requireAdmin'); // admin check

// ✅ Basic test route
router.get('/', (req, res) => {
  res.send('List of tournaments');
});

// ✅ Route: register a player
router.post('/register', protect, async (req, res) => {
  try {
    const { pseudo, avatar, tournamentName } = req.body;

    if (!pseudo || !avatar) {
      return res.status(400).json({ message: 'Pseudo and avatar are required.' });
    }

    const participant = new TournamentParticipant({
      user: req.user._id,
      pseudo,
      avatar,
      tournamentName,
    });

    const savedParticipant = await participant.save();
    res.status(201).json(savedParticipant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Admin route: create a tournament
router.post('/admin/create', protect, requireAdmin, async (req, res) => {
  try {
    const { name, cashPrize, date, maxParticipants } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: "Tournament name and date are required." });
    }

    const tournament = await Tournament.create({
      name,
      cashPrize: cashPrize || 0,
      date,
      maxParticipants: maxParticipants || 100,
      createdBy: req.user._id,
    });

    res.status(201).json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create tournament." });
  }
});

// ✅ Admin route: update a tournament
router.put('/admin/update/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { name, cashPrize, date, maxParticipants } = req.body;

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found." });
    }

    tournament.name = name || tournament.name;
    tournament.cashPrize = cashPrize !== undefined ? cashPrize : tournament.cashPrize;
    tournament.date = date || tournament.date;
    tournament.maxParticipants = maxParticipants !== undefined ? maxParticipants : tournament.maxParticipants;

    const updated = await tournament.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update tournament." });
  }
});

// ✅ Admin route: delete a tournament
router.delete('/admin/delete/:id', protect, requireAdmin, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found." });
    }

    await tournament.deleteOne();
    res.json({ message: "Tournament deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete tournament." });
  }
});

// ✅ Public route: list all tournaments
router.get('/list', async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tournaments." });
  }
});

module.exports = router;
