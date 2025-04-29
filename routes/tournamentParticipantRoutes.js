const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const tournamentParticipantController = require('../controllers/tournamentParticipantController');

// 🔐 Register a player in a tournament (protected by token)
router.post('/register', protect, tournamentParticipantController.registerPlayer);

// 🔍 Get the list of participants for a tournament
router.get('/:tournamentId', tournamentParticipantController.getParticipants);

module.exports = router;
